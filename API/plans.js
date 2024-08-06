const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const {
  generateRandomId,
  autoSignin,
  googleOauth2client,
} = require("../Utils/tool");
const { planPushNotification } = require("../services/notification");
const { google } = require("googleapis");
const { DateTime } = require("luxon");
const {
  validateStrictString,
  validateInteger,
  validateLength,
  validateString,
  validateBoolean,
} = require("../Utils/validate");
const {
  googleAccessTokenCache,
  userCache,
  NotificationCache,
} = require("../services/redisLoader");
const schedule = require("node-schedule");
const { responseCodes } = require("../Constant");
const { mainIo } = require("../sockets/mainIo");

Router.get("/", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      let [plans] = await connection.query(
        `SELECT 
          p.plan_id, 
          p.title, 
          p.start, 
          p.end, 
          p.\`repeat\`, 
          p.description, 
          p.notification, 
          p.subject_id, 
          p.priority, 
          p.completed
        FROM 
          plans p
        LEFT JOIN 
          plan_shared s ON p.plan_id = s.plan_id
        WHERE 
          p.user_id = ? OR s.user_id = ?
        GROUP BY 
          p.plan_id;`,
        [userId, `%${userId}%`]
      );
      plans.map((plan) => {
        plan.editable = true;
        plan.isEditable = true;
      });
      const access_token = await googleAccessTokenCache(userId);
      if (access_token) {
        try {
          const auth = googleOauth2client({ access_token });
          const googleCalendar = google.calendar({
            version: "v3",
            auth: auth,
          });
          const calendars = await googleCalendar.calendarList.list();
          if (calendars && calendars.data) {
            const calendarEvents = [];
            const calendarPromises = calendars.data.items.map(
              async (calendar) => {
                // Only bring last 30 days events, future 30 days
                const timeMin = new Date(
                  new Date().getTime() - 1000 * 60 * 60 * 24 * 30
                );
                const timeMax = new Date(
                  new Date().getTime() + 1000 * 60 * 60 * 24 * 30
                );
                const response = await googleCalendar.events.list({
                  calendarId: calendar.id,
                  timeMin,
                  timeMax,
                });
                const events = response.data.items;
                events.map((event) => {
                  const {
                    htmlLink,
                    id,
                    summary,
                    start,
                    end,
                    description,
                    reminders,
                  } = event;
                  const startDateTime = Math.floor(
                    DateTime.fromISO(start ? start.dateTime : "", {
                      zone: start ? start.timeZone : "",
                    }).toSeconds()
                  );
                  const endDateTime = Math.floor(
                    DateTime.fromISO(end ? end.dateTime : "", {
                      zone: end ? end.timeZone : "",
                    }).toSeconds()
                  );
                  const editable = calendar.accessRole !== "reader";
                  const newEvent = {
                    plan_id: id,
                    title: summary,
                    start: startDateTime,
                    end: endDateTime,
                    repeat: 0,
                    description,
                    subject: calendar.id,
                    priority: 5,
                    completed: 0,
                    htmlLink,
                    type: "google",
                    editable,
                    isEditable: editable,
                    color: calendar.backgroundColor,
                  };
                  calendarEvents.push(newEvent);
                  return null;
                });
                return null;
              }
            );

            await Promise.all(calendarPromises);
            plans = plans.concat(calendarEvents);
          }
        } catch (err) {
          if (
            err.response &&
            err.response &&
            err.response.data &&
            (err.response.data.error === "invalid_grant" ||
              err.response.data.error_description ===
                "Token has been expired or revoked.")
          ) {
            connection.query(
              `UPDATE users set google_refresh_token = NULL WHERE user_id = ?`,
              [userId]
            );
            redisClient.del(`user:${userId}:googleAccessToken`);
          }
        }
      }
      res.send({ success: true, plans: plans });
    } catch (err) {
      console.log(err);
      res.send({ success: false });
    }
  });
});

Router.patch("/plan", async (req, res) => {
  autoSignin(req, res, async (userId, timezone) => {
    try {
      const planInfo = req.body;
      if (!planInfo)
        return res.send({
          success: false,
          reason: "Plan information missing",
        });

      const minPlanTime = DateTime.now().minus({ month: 1 }).toSeconds();
      const maxPlanTime = DateTime.now().plus({ year: 1 }).toSeconds();
      const {
        title,
        plan_id,
        start,
        end,
        repeat,
        description,
        subject_id,
        notification,
        priority,
        completed,
        type,
      } = planInfo;

      if (type === "google") {
        const access_token = await googleAccessTokenCache(userId);
        if (access_token) {
          try {
            const auth = googleOauth2client({ access_token });
            const googleCalendar = google.calendar({
              version: "v3",
              auth: auth,
            });

            const startDateTime = DateTime.fromSeconds(start, {
              zone: timezone,
            });
            const endDateTime = DateTime.fromSeconds(end, {
              zone: timezone,
            });

            const updateResults = await googleCalendar.events.update({
              auth: auth,
              calendarId: subject,
              eventId: plan_id,
              resource: {
                summary: title,
                description,
                start: {
                  dateTime: startDateTime.toISO(),
                  timeZone: timezone,
                },
                end: { dateTime: endDateTime.toISO(), timeZone: timezone },
              },
            });

            if (updateResults.status === 200) {
              return res.send({ success: true, msg: "Plan updated!" });
            } else {
              return res.send({
                success: false,
                msg: "You cannot modify this plan",
              });
            }
          } catch (err) {}
        }
      }

      const isValidTitle = validateString(title, "Title", 100);
      if (!isValidTitle.isValid) {
        return res.send({ success: false, reason: isValidTitle.reason });
      }
      const isValidPlanId = validateStrictString(plan_id, "Id", 10, 10);
      if (!isValidPlanId.isValid) {
        return res.send({ success: false, reason: isValidPlanId.reason });
      }

      const isValidStart = validateInteger(
        start,
        "Start time",
        maxPlanTime,
        minPlanTime
      );
      if (!isValidStart.isValid) {
        return res.send({ success: false, reason: isValidStart.reason });
      }

      const isValidEnd = validateInteger(end, "End time", maxPlanTime, start);
      if (!isValidEnd.isValid) {
        return res.send({ success: false, reason: isValidEnd.reason });
      }

      const isValidRepeat = validateInteger(repeat, "Repeat", 3, 0);
      if (!isValidRepeat.isValid) {
        return res.send({ success: false, reason: isValidRepeat.reason });
      }

      const isValidDescription = validateLength(
        description,
        "Description",
        300
      );
      if (!isValidDescription.isValid) {
        return res.send({
          success: false,
          reason: isValidDescription.reason,
        });
      }

      const isValidSubjectId = validateStrictString(
        subject_id,
        "Subject",
        10,
        10
      );
      if (!isValidSubjectId.isValid) {
        return res.send({ success: false, reason: isValidSubjectId.reason });
      }

      const isValidNotification = validateInteger(
        notification,
        "Notification",
        -1,
        60
      );
      if (!isValidNotification.isValid) {
        return res.send({
          success: false,
          reason: isValidNotification.reason,
        });
      }

      const isValidPriority = validateStrictString(priority, "Subject", 10, 10);
      if (!isValidPriority.isValid) {
        return res.send({ success: false, reason: isValidPriority.reason });
      }

      const isValidCompleted = validateInteger(completed, "Completed", 0, 1);
      if (!isValidCompleted.isValid) {
        return res.send({ success: false, reason: isValidCompleted.reason });
      }

      const connection = pool.promise();

      const [[userInfo]] = await connection.query(
        `SELECT key_salt, iv, notification_endpoint, notification_keys FROM users WHERE user_id = ?`,
        [userId]
      );

      if (!userInfo)
        return res.send({ success: false, reason: responseCodes["no-user"] });

      try {
        const planData = {
          title,
          plan_id,
          start,
          end,
          repeat,
          description,
          subject_id,
          notification,
          priority,
          completed,
          user_id: userId,
        };

        const [deletePrev] = await connection.query(
          `DELETE FROM plans WHERE user_id = ? AND plan_id = ?`,
          [userId, plan_id]
        );
        let isNew = false;
        if (deletePrev.affectedRows) {
          schedule.cancelJob(userId + "-" + plan_id);
        } else {
          //new plan
          planData.plan_id = generateRandomId(10);
          isNew = true;
        }

        const startTime = start * 60;
        //const body = description.replace(/(&nbsp;|<([^>]+)>)/ig, " ");
        const startDateTime = DateTime.fromSeconds(startTime)
          .setZone(timezone)
          .toFormat("h:mm a");
        const endDateTime = DateTime.fromSeconds(end * 60)
          .setZone(timezone)
          .toFormat("h:mm a");
        const body = `${startDateTime} - ${endDateTime}`;
        const payload = JSON.stringify({
          title,
          body,
          icon: "https://flozable.com/favicon.ico",
          actions: [
            { action: "viewplan", title: "View plan" },
            { action: "close", title: "Close" },
          ],
          data: {
            link: `${process.env.SERVER}/dashboard/planner?plan=${plan_id}`,
          },
        });

        if (notification !== -1) {
          const subNotificationStart = startTime - notification * 60;
          if (subNotificationStart > DateTime.now().toSeconds() && userInfo) {
            planPushNotification(
              userId + "-" + plan_id,
              { ...userInfo, user_id: userId },
              payload,
              subNotificationStart
            );
          }
        }
        if (startTime > DateTime.now().toSeconds() && userInfo) {
          planPushNotification(
            userId + "-" + plan_id,
            { ...userInfo, user_id: userId },
            payload,
            startTime
          );
        }
        //planNotification(insertInfo, userInfo[0], startTime)
        await connection.query(`INSERT INTO plans SET ?`, planData);
        res.send({ success: true, msg: "Plan Saved!", planData, isNew });
      } catch (error) {
        res.send({ success: false, reason: "An error occurred" });
        console.log(error);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      res.send({ success: false, reason: "An error occurred" });
    }
  });
});

Router.patch("/plan/status", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { plan_id, completed } = req.body;

      const isValidPlanId = validateStrictString(plan_id, "plan id", 10, 8);

      if (!isValidPlanId.isValid) {
        return res.send({ success: false, reason: isValidPlanId.reason });
      }

      const isValidCompleted = validateInteger(completed, "completed", 1, 0);

      if (!isValidCompleted) {
        return res.send({ success: false, reason: isValidCompleted.reason });
      }

      const connection = pool.promise();
      try {
        await connection.query(
          `UPDATE plans SET completed = ? WHERE plan_id = ? AND user_id = ?`,
          [completed, plan_id, userId]
        );
        res.send({ success: true, msg: "Plan Updated" });
      } catch (err) {
        console.log(err);
      }
    } catch (err) {
      console.log(err);
      res.send({ success: false, reason: "Err" });
    }
  });
});

Router.delete("/plan", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();

      const { id } = req.body;

      const isValidId = validateStrictString(id, "plan id", 10, 8);

      if (!isValidId.isValid) {
        return res.send({ success: false, reason: isValidId.reason });
      }

      await connection.query(`DELETE FROM plans WHERE user_id = ? AND id = ?`, [
        userId,
        id,
      ]);
      /* if (!deletePlan.affectedRows) {

      } */

      res.send({ success: true });
    } catch (err) {
      console.log(err);
    }
  });
});

Router.get("/plan/users", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { planId } = req.query;

      const isValidId = validateStrictString(planId, "plan id", 10, 10);
      if (!isValidId.isValid) {
        return res.send({ success: false, reason: isValidId.reason });
      }

      const connection = pool.promise();

      const [[planInfo]] = await connection.query(
        `
        SELECT
          p.plan_id,
          p.user_id,
          JSON_ARRAYAGG(JSON_OBJECT('user_id', u.user_id, 'name', u.name)) AS shared,
          JSON_ARRAYAGG(JSON_OBJECT('user_id', u2.user_id, 'name', u2.name)) AS share
        FROM plans p
        LEFT JOIN plan_shared psd ON psd.plan_id = p.plan_id
        LEFT JOIN users u ON u.user_id = psd.user_id
        LEFT JOIN plan_share ps ON ps.plan_id = p.plan_id
        LEFT JOIN users u2 ON u2.user_id = ps.user_id
        WHERE p.plan_id = ?
        GROUP BY p.plan_id
      `,
        [planId]
      );

      if (!planInfo) {
        return res.send({ success: false, reason: "Invalid Plan" });
      }

      planInfo.share = JSON.parse(planInfo.share).filter(
        (user) => user.user_id
      );
      planInfo.shared = JSON.parse(planInfo.shared).filter(
        (user) => user.user_id
      );

      const allowedUsers = [
        ...planInfo.shared,
        ...planInfo.share,
        { user_id: planInfo.user_id },
      ];
      if (!allowedUsers.find((user) => user.user_id === userId)) {
        return res.send(responseCodes["non-memeber"]);
      }

      res.send({ success: true, planInfo });
    } catch (err) {
      console.log(err);
      res.send({ success: false });
    }
  });
});

Router.post("/plan/share", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { users, planId } = req.body;

      if (!users.length) return res.send({ success: true });

      const userInfo = await userCache(userId);

      if (!userInfo)
        return res.send({ success: false, reason: responseCodes["no-user"] });

      const connection = pool.promise();

      const [[planInfo]] = await connection.query(
        `SELECT plan_id FROM plans WHERE user_id = ? AND plan_id = ?`,
        [userId, planId]
      );

      if (!planInfo) {
        return res.send({ success: false, reason: "Invalid Plan" });
      }

      const existingUsers = (
        await connection.query(
          `SELECT user_id FROM users WHERE user_id IN(?)`,
          [users]
        )
      )[0].map((userInfo) => userInfo.user_id);

      const friends = existingUsers.filter((user) =>
        userInfo.friends.includes(user)
      );

      const newShared = friends.map((friend) => [planId, friend]);

      if (newShared.length) {
        await connection.query(
          `INSERT IGNORE INTO plan_shared 
          (plan_id, user_id) 
          VALUES ?`,
          [newShared]
        );
      }

      const nonFriends = existingUsers.filter(
        (user) => !userInfo.friends.includes(user)
      );

      const newShare = nonFriends.map((friend) => [planId, friend]);

      if (newShare.length) {
        await connection.query(
          `INSERT IGNORE INTO plan_share 
          (plan_id, user_id) 
          VALUES ?`,
          [newShare]
        );
      }

      const date = Math.floor(new Date().getTime() / 1000);

      nonFriends.map(async (targetId) => {
        const id = generateRandomId(5);
        const notification = {
          t: 7,
          f: userId,
          d: date,
          n: planInfo.title,
          pi: planId,
        };
        const socketNotif = {
          i: id,
          t: 7,
          f: userInfo,
          d: date,
          n: planInfo.title,
          pi: planId,
        };
        mainIo.to(targetId).emit("notification", socketNotif);
        redisClient.hset(
          `user:${targetId}:notifications`,
          id,
          JSON.stringify(notification)
        );
      });
      console.log("shared");
      res.send({ success: true });
    } catch (err) {
      console.log(err);
      res.send({ success: false });
    }
  });
});

Router.delete("/plan/share", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { targetId, planId } = req.body;

      const isValidTargetId = validateStrictString(targetId, "user id", 10);

      if (!isValidTargetId.isValid) {
        return res.send({ success: false, reason: isValidTargetId.reason });
      }

      const userInfo = await userCache(userId);

      if (!userInfo)
        return res.send({ success: false, reason: responseCodes["no-user"] });

      const connection = pool.promise();

      const [[planInfo]] = await connection.query(
        `
        SELECT
          p.plan_id,
          p.name,
          p.user_id,
          JSON_ARRAYAGG(JSON_OBJECT('user_id', u.user_id, 'name', u.name)) AS shared,
          JSON_ARRAYAGG(JSON_OBJECT('user_id', u2.user_id, 'name', u2.name)) AS share
        FROM plans p
        LEFT JOIN plan_shared psd ON psd.plan_id = p.plan_id
        LEFT JOIN users u ON u.user_id = psd.user_id
        LEFT JOIN plan_share ps ON ps.plan_id = p.plan_id
        LEFT JOIN users u2 ON u2.user_id = ps.user_id
        WHERE p.plan_id = ?
        GROUP BY p.plan_id
      `,
        [planId]
      );

      planInfo.share = JSON.parse(planInfo.share).filter(
        (user) => user.user_id
      );
      planInfo.shared = JSON.parse(planInfo.shared).filter(
        (user) => user.user_id
      );

      const allowedUsers = [
        ...planInfo.shared,
        ...planInfo.share,
        { user_id: planInfo.user_id },
      ];
      if (!allowedUsers.find((user) => user.user_id === userId)) {
        return res.send(responseCodes["non-memeber"]);
      }

      await connection.query(
        `
        DELETE FROM plan_share WHERE plan_id = ? AND user_id = ?;
        DELETE FROM plan_shared WHERE plan_id = ? AND user_id = ?`,
        [planId, userId, planId, userId]
      );

      const planRequests = await NotificationCache(targetId, 7, false);
      const planRequest = planRequests.find((planRequest) => {
        return planRequest.pi === planId;
      });
      if (planRequest) {
        redisClient.hdel(`user:${targetId}:notifications`, planRequest.i);
      }
      res.send({ success: true, msg: `Removed user!` });
    } catch (err) {
      console.log(err);
      res.send({ success: false });
    }
  });
});

Router.post("/plan/share/respond", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { notificationId, accepted } = req.body;

      const isValidAcceped = validateBoolean(accepted, "accept", true);

      if (!isValidAcceped.isValid) {
        return res.send({ success: false, reason: isValidAcceped.reason });
      }

      const notification = await redisClient.hget(
        `user:${userId}:notifications`,
        notificationId
      );

      if (!notification) return res.send(responseCodes["expired-request"]);

      const userInfo = await userCache(userId);

      if (!userInfo)
        return res.send({ success: false, reason: responseCodes["no-user"] });

      const plan_id = JSON.parse(notification).pi;

      redisClient.hdel(`user:${userId}:notifications`, notificationId);

      const connection = pool.promise();

      if (accepted) {
        const shared = {
          plan_id,
          user_Id: userId,
        };

        await connection.query(`INSERT INTO plan_shared SET ?`, [shared]);
        return res.send({ success: true, msg: `Accepted share request!` });
      }

      res.send({ success: true, msg: `Declined share request!` });
    } catch (err) {
      console.log(err);
      res.send(responseCodes["error"]);
    }
  });
});

module.exports = Router;
