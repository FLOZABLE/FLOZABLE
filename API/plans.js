const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const {
  isValidJSON,
  hashing,
  generateRandomId,
  autoSignin,
  googleOauth2client,
} = require("../Utils/tool");
const {
  removePrevNotification,
  planNotification,
  planPushNotification,
} = require("../services/notification");
const { google } = require("googleapis");
const { DateTime } = require("luxon");
const { UserRefreshClient } = require("google-auth-library");
const {
  validateStrictString,
  validateInteger,
  validateLength,
  validateString,
  validateArray,
  validateBoolean,
} = require("../Utils/validate");
const {
  googleAccessTokenCache,
  userCache,
  usersCache,
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
                    }).toSeconds() / 60
                  );
                  const endDateTime = Math.floor(
                    DateTime.fromISO(end ? end.dateTime : "", {
                      zone: end ? end.timeZone : "",
                    }).toSeconds() / 60
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

      const minPlanTime = DateTime.now().minus({ month: 1 }).toSeconds() / 60;
      const maxPlanTime = DateTime.now().plus({ year: 1 }).toSeconds() / 60;
      const {
        title,
        id,
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

      console.log(planInfo)

      if (type === "google") {
        const access_token = await googleAccessTokenCache(userId);
        if (access_token) {
          try {
            const auth = googleOauth2client({ access_token });
            const googleCalendar = google.calendar({
              version: "v3",
              auth: auth,
            });

            const startDateTime = DateTime.fromSeconds(start * 60, {
              zone: timezone,
            });
            const endDateTime = DateTime.fromSeconds(end * 60, {
              zone: timezone,
            });

            console.log(subject, id);
            const updateResults = await googleCalendar.events.update({
              auth: auth,
              calendarId: subject,
              eventId: id,
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
      const isValidId = validateStrictString(id, "Id", 10, 10);
      if (!isValidId.isValid) {
        return res.send({ success: false, reason: isValidId.reason });
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

      const isValidSubjectId = validateStrictString(subject_id, "Subject", 10, 10);
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
          plan_id: id,
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
          [userId, id]
        );
        let isNew = false;
        if (deletePrev.affectedRows) {
          schedule.cancelJob(userId + "-" + id);
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
            link: `${process.env.SERVER}/dashboard/planner?plan=${id}`,
          },
        });

        if (notification !== -1) {
          const subNotificationStart = startTime - notification * 60;
          if (subNotificationStart > DateTime.now().toSeconds() && userInfo) {
            planPushNotification(
              userId + "-" + id,
              { ...userInfo, user_id: userId },
              payload,
              subNotificationStart
            );
          }
        }
        if (startTime > DateTime.now().toSeconds() && userInfo) {
          planPushNotification(
            userId + "-" + id,
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
      console.log(req.body);

      const isValidId = validateStrictString(id, "plan id", 10, 8);

      if (!isValidId.isValid) {
        return res.send({ success: false, reason: isValidId.reason });
      }

      console.log("gddd", id);

      const [deletePlan] = await connection.query(
        `DELETE FROM plans WHERE user_id = ? AND id = ?`,
        [userId, id]
      );
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
      const { id } = req.query;

      const isValidId = validateStrictString(id, "Id", 10, 10);
      if (!isValidId.isValid) {
        return res.send({ success: false, reason: isValidId.reason });
      }

      const connection = pool.promise();

      const result = await connection.query(
        `SELECT user_id FROM plan_shared WHERE plan_id = ? AND user_id = ?; SELECT user_id FROM plan_share WHERE plan_id = ? AND user_id = ?;`,
        [id, userId, id, userId]
      );
      console.log(result);
      return;

      if (!planInfo) {
        return res.send({ success: false, reason: "Invalid Plan" });
      }

      planInfo.share = planInfo.share === "" ? [] : planInfo.share.split(",");
      planInfo.shared =
        planInfo.shared === "" ? [] : planInfo.shared.split(",");

      //auery all at once for performance
      const users = await usersCache([...planInfo.share, ...planInfo.shared]);
      const share = users.filter((userInfo) =>
        planInfo.share.includes(userInfo.user_id)
      );
      const shared = users.filter((userInfo) =>
        planInfo.shared.includes(userInfo.user_id)
      );
      res.send({ success: true, share, shared });
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

      console.log(users, planId);

      if (!users.length) return res.send({ success: true });

      const userInfo = await userCache(userId);

      if (!userInfo)
        return res.send({ success: false, reason: responseCodes["no-user"] });

      const connection = pool.promise();

      const existingUsers = (
        await connection.query(
          `SELECT user_id FROM users WHERE user_id IN(?)`,
          [users]
        )
      )[0].map((userInfo) => userInfo.user_id);
      console.log(existingUsers);

      const friends = existingUsers.filter((user) =>
        userInfo.friends.includes(user)
      );

      const [[planInfo]] = await connection.query(
        `SELECT shared, share, title FROM plans WHERE user_id = ? AND id = ?`,
        [userId, planId]
      );

      if (!planInfo)
        return res.send({ success: false, reason: "Invalid Plan" });

      planInfo.shared =
        planInfo.shared === "" ? [] : planInfo.shared.split(",");
      planInfo.shared = [...new Set(planInfo.shared.concat(friends))];

      const nonFriends = existingUsers.filter(
        (user) =>
          !userInfo.friends.includes(user) && !planInfo.shared.includes(user)
      );

      planInfo.share = planInfo.share === "" ? [] : planInfo.share.split(",");
      planInfo.share = [...new Set(planInfo.share.concat(nonFriends))];

      const updateInfo = {
        shared: planInfo.shared.toString(),
        share: planInfo.share.toString(),
      };
      await connection.query(
        `UPDATE plans SET ? WHERE user_id = ? AND id = ?`,
        [updateInfo, userId, planId]
      );

      console.log(friends, nonFriends);

      const date = Math.floor(new Date().getTime() / (1000 * 60));

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

      console.log(targetId, planId);

      const isValidTargetId = validateStrictString(targetId, "user id", 10);

      if (!isValidTargetId.isValid) {
        return res.send({ success: false, reason: isValidTargetId.reason });
      }

      const userInfo = await userCache(userId);

      if (!userInfo)
        return res.send({ success: false, reason: responseCodes["no-user"] });

      const connection = pool.promise();

      const [[planInfo]] = await connection.query(
        `SELECT shared, share, title FROM plans WHERE user_id = ? AND id = ?`,
        [userId, planId]
      );

      if (!planInfo)
        return res.send({ success: false, reason: "Invalid Plan" });

      planInfo.shared =
        planInfo.shared === "" ? [] : planInfo.shared.split(",");
      planInfo.shared = [
        ...new Set(planInfo.shared.filter((user) => user !== targetId)),
      ];

      planInfo.share = planInfo.share === "" ? [] : planInfo.share.split(",");
      planInfo.share = [
        ...new Set(planInfo.share.filter((user) => user !== targetId)),
      ];

      const updateInfo = {
        shared: planInfo.shared.toString(),
        share: planInfo.share.toString(),
      };
      await connection.query(
        `UPDATE plans SET ? WHERE user_id = ? AND id = ?`,
        [updateInfo, userId, planId]
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
      const { planId, accepted } = req.body;

      console.log(planId, accepted);

      const isValidPlanId = validateStrictString(planId, "user id", 10);

      if (!isValidPlanId.isValid) {
        return res.send({ success: false, reason: isValidPlanId.reason });
      }

      const isValidAcceped = validateBoolean(accepted, "accept", true);

      if (!isValidAcceped.isValid) {
        return res.send({ success: false, reason: isValidAcceped.reason });
      }

      const planRequests = await NotificationCache(userId, 7, false);
      const planRequest = planRequests.find((planRequest) => {
        return planRequest.pi === planId;
      });
      console.log(planRequests);
      if (!planRequest)
        return res.send({ success: false, reason: "expired request" });

      const userInfo = await userCache(userId);

      if (!userInfo)
        return res.send({ success: false, reason: responseCodes["no-user"] });

      redisClient.hdel(`user:${userId}:notifications`, planRequest.i);

      const connection = pool.promise();
      const [[planInfo]] = await connection.query(
        `SELECT share, shared, user_id, title FROM plans WHERE id = ?`,
        [planId]
      );

      if (!planInfo)
        return res.send({ success: false, reason: "Invalid Plan" });

      planInfo.share = planInfo.share === "" ? [] : planInfo.share.split(",");
      planInfo.shared =
        planInfo.shared === "" ? [] : planInfo.shared.split(",");

      if (!planInfo.share.includes(userId))
        return res.send({ success: false, reason: "expired request" });

      planInfo.share = [
        ...new Set(planInfo.share.filter((id) => id !== userId)),
      ];

      if (accepted) {
        planInfo.shared.push(userId);

        const id = generateRandomId(5);
        const date = Math.floor(new Date().getTime() / (1000 * 60));

        const notification = {
          t: 8,
          f: userId,
          d: date,
          n: planInfo.title,
          pi: planId,
        };
        const socketNotif = { i: id, t: 8, f: userInfo, d: date, pi: planId };

        const targetId = planInfo.user_id;
        mainIo.to(targetId).emit("notification", socketNotif);
        redisClient.hset(
          `user:${targetId}:notifications`,
          id,
          JSON.stringify(notification)
        );
      } else {
        planInfo.shared = [
          ...new Set(planInfo.shared.filter((id) => id !== userId)),
        ];
      }

      const updateInfo = {
        share: planInfo.share.toString(),
        shared: planInfo.shared.toString(),
      };

      await connection.query(`UPDATE plans SET ? WHERE id = ?`, [
        updateInfo,
        planId,
      ]);

      if (accepted) {
        res.send({ success: true, msg: `Accepted share request!` });
      } else {
        res.send({ success: true, msg: `Declined share request!` });
      }
    } catch (err) {
      console.log(err);
      res.send({ success: false });
    }
  });
});

module.exports = Router;
