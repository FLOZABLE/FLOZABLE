const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { generateRandomId } = require("../utils/tool");
const {
  planPushNotification,
  NOTIFICATION_PAYLOADS,
} = require("../services/notification");
const { google } = require("googleapis");
const { DateTime } = require("luxon");
const {
  validateStrictString,
  validateInteger,
  validateLength,
  validateString,
  validateBoolean,
  validateISO,
} = require("../utils/validate");
const {
  googleAccessTokenCache,
  userCache,
  userFriendsCache,
  clearGoogleAccessToken,
} = require("../services/redisLoader");
const schedule = require("node-schedule");
const RESPONSE_MESSAGES = require("../utils/responses");
const { mainIo } = require("../sockets/io");
const { googleOauth2client, autoSignin } = require("./auth");
const { NOTIFICATION_MESSAGES } = require("../Constant");

Router.get("/", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      const [plans] = await connection.query(
        `SELECT 
          p.plan_id, 
          p.title, 
          p.start * 1000 AS start, 
          p.end  * 1000 AS end, 
          p.\`repeat\`, 
          p.description, 
          p.notification, 
          p.subject_id, 
          p.priority, 
          p.completed,
          s.color as subject_color
        FROM 
          plans p
        LEFT JOIN 
          plan_share ps ON p.plan_id = ps.plan_id AND ps.status = "accepted"
        LEFT JOIN
          subjects s ON s.subject_id = p.subject_id
        WHERE 
          p.user_id = ? OR ps.user_id = ?
        GROUP BY 
          p.plan_id;`,
        [userId, userId]
      );
      plans.map((plan) => {
        plan.type = "local";
        plan.editable = true;
        plan.isEditable = true;
        plan.backgroundColor = plan.subject_color
          ? plan.subject_color
          : "#000000";
        plan.borderColor = plan.subject_color ? plan.subject_color : "#000000";
        plan.backgroundColor = plan.subject_color
          ? plan.subject_color
          : "#000000";
        if (plan.completed) {
          plan.className = "completed";
        }
      });

      return res.status(200).send({
        success: true,
        status: 200,
        data: { plans: plans },
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.get("/google", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    const connection = pool.promise();
    try {
      const { date } = req.query;

      const isValidDate = validateISO(date, "date");
      console.log(req.query);
      if (!isValidDate.isValid) {
        const response = RESPONSE_MESSAGES.validationError(isValidDate);
        return res.status(response.status).send(response);
      }

      const dateTime = DateTime.fromISO(date).startOf("day").startOf("month");

      const timeMin = dateTime.minus({ week: 1 }).toISO();

      const timeMax = dateTime.endOf("month").plus({ week: 1 }).toISO();

      const plans = [];
      const access_token = await googleAccessTokenCache(connection, userId);

      if (!access_token) {
        return res.status(200).send({
          success: true,
          status: 200,
          data: { plans: plans },
        });
      }

      const auth = googleOauth2client({ access_token });
      const googleCalendar = google.calendar({
        version: "v3",
        auth: auth,
      });
      const calendars = await googleCalendar.calendarList.list();
      if (!calendars?.data) {
        const response = RESPONSE_MESSAGES.error();
        return res.status(response.status).send(response);
      }

      await Promise.all(
        calendars.data.items.map(async (calendar) => {
          const response = await googleCalendar.events.list({
            calendarId: calendar.id,
            timeMax,
            timeMin,
          });
          const events = response.data.items;

          events.map((event) => {
            const { htmlLink, id, summary, start, end, description } = event;
            const startDateTime = DateTime.fromISO(
              start ? start.dateTime : "",
              {
                zone: start ? start.timeZone : "",
              }
            ).toMillis();
            const endDateTime = DateTime.fromISO(end ? end.dateTime : "", {
              zone: end ? end.timeZone : "",
            }).toMillis();
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
              backgroundColor: calendar.backgroundColor,
              borderColor: calendar.backgroundColor,
            };
            plans.push(newEvent);
            return null;
          });
          return null;
        })
      );

      return res.status(200).send({
        success: true,
        status: 200,
        data: { plans: plans },
      });
    } catch (err) {
      //console.log(err);
      if (!err?.response?.data?.error) {
        const response = RESPONSE_MESSAGES.error();
        return res.status(response.status).send(response);
      }

      if (err.response.data.error === "invalid_token") {
        clearGoogleAccessToken(connection, userId);
      }

      return res.status(400).send({
        success: false,
        status: 400,
        error: {
          code: err.response.data.error.code,
          reason: err.response.data.error.message,
        },
      });
    }
  });
});

Router.patch("/plan", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
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
        timezone,
      } = req.body;

      const isValidTitle = validateString(title, "Title", 100);
      if (!isValidTitle.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidTitle.reason,
          error: { reason: isValidTitle.reason },
        });
      }

      const isValidPlanId = validateStrictString(plan_id, "Id", 10, 10);
      if (!isValidPlanId.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidPlanId.reason,
          error: { reason: isValidPlanId.reason },
        });
      }

      const isValidStart = validateInteger(
        start,
        "Start time",
        maxPlanTime,
        minPlanTime
      );
      if (!isValidStart.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidStart.reason,
          error: { reason: isValidStart.reason },
        });
      }

      const isValidEnd = validateInteger(end, "End time", maxPlanTime, start);
      if (!isValidEnd.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidEnd.reason,
          error: { reason: isValidEnd.reason },
        });
      }

      const isValidRepeat = validateInteger(repeat, "Repeat", 3, 0);
      if (!isValidRepeat.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidRepeat.reason,
          error: { reason: isValidRepeat.reason },
        });
      }

      const isValidDescription = validateLength(
        description,
        "Description",
        300
      );
      if (!isValidDescription.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidDescription.reason,
          error: { reason: isValidDescription.reason },
        });
      }

      const isValidSubjectId = validateStrictString(
        subject_id,
        "Subject",
        10,
        10
      );
      if (!isValidSubjectId.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidSubjectId.reason,
          error: { reason: isValidSubjectId.reason },
        });
      }

      const isValidNotification = validateInteger(
        notification,
        "Notification",
        -1,
        1800
      );
      if (!isValidNotification.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidNotification.reason,
          error: { reason: isValidNotification.reason },
        });
      }

      const isValidPriority = validateStrictString(priority, "Subject", 10, 10);
      if (!isValidPriority.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidPriority.reason,
          error: { reason: isValidPriority.reason },
        });
      }

      const isValidCompleted = validateInteger(completed, "Completed", 0, 1);
      if (!isValidCompleted.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidCompleted.reason,
          error: { reason: isValidCompleted.reason },
        });
      }

      const connection = pool.promise();

      const newPlan = {
        title,
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

      if (plan_id !== "0000000000") {
        await connection.query(
          `UPDATE plans set ? WHERE plan_id = ? AND user_id = ?`,
          [newPlan, plan_id, userId]
        );
        newPlan.plan_id = plan_id;
      } else {
        newPlan.plan_id = generateRandomId(10);
        await connection.query(`INSERT INTO plans SET ?`, newPlan);
      }

      const notificationId = userId + "-" + plan_id;
      schedule.cancelJob(notificationId);

      const notificationTime = start - notification; //DateTime.now().toSeconds() + 5

      if (notification !== -1) {
        const payload = NOTIFICATION_PAYLOADS["plan"]({ ...newPlan, timezone });
        planPushNotification(
          connection,
          userId,
          notificationId,
          notificationTime,
          payload
        );
      }
      //planNotification(insertInfo, userInfo[0], startTime)
      const is_new = plan_id === "0000000000";
      res.status(200).send({
        success: true,
        status: 200,
        message: "Plan Saved!",
        data: { plan: newPlan, is_new },
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.patch("/plan/google", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    const connection = pool.promise();

    try {
      const { subject, plan_id, title, description, start, end, timezone } =
        req.body;

      const access_token = await googleAccessTokenCache(connection, userId);

      if (!access_token) {
        const response = RESPONSE_MESSAGES.notAuthed();
        return res.status(response.status).send(response);
      }

      const auth = googleOauth2client({ access_token });
      const googleCalendar = google.calendar({
        version: "v3",
        auth: auth,
      });

      const updateResults = await googleCalendar.events.update({
        auth: auth,
        calendarId: subject,
        eventId: plan_id,
        resource: {
          summary: title,
          description,
          start: {
            dateTime: start,
            timeZone: timezone,
          },
          end: { dateTime: end, timeZone: timezone },
        },
      });

      if (updateResults.status === 200) {
        return res.status(200).send({
          success: true,
          status: 200,
          message: "Plan updated!",
        });
      }

      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    } catch (err) {
      //console.log(err);
      if (!err?.response?.data?.error) {
        const response = RESPONSE_MESSAGES.error();
        return res.status(response.status).send(response);
      }

      if (err.response.data.error === "invalid_token") {
        clearGoogleAccessToken(connection, userId);
      }

      return res.status(400).send({
        success: false,
        status: err.response.data.error.code,
        message: err.response.data.error.message,
        error: {
          code: err.response.data.error.code,
          reason: err.response.data.error.message,
        },
      });
    }
  });
});

Router.patch("/plan/status", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { plan_id, completed } = req.body;

      const isValidPlanId = validateStrictString(plan_id, "plan id", 10, 8);

      if (!isValidPlanId.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidPlanId.reason,
          error: { reason: isValidPlanId.reason },
        });
      }

      const isValidCompleted = validateInteger(completed, "completed", 1, 0);

      if (!isValidCompleted) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidCompleted.reason,
          error: { reason: isValidCompleted.reason },
        });
      }

      const connection = pool.promise();
      await connection.query(
        `UPDATE plans SET completed = ? WHERE plan_id = ? AND user_id = ?`,
        [completed, plan_id, userId]
      );
      res
        .status(200)
        .send({ success: true, status: 200, message: "Plan Updated" });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.delete("/plan", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();

      const { plan_id: planId } = req.body;

      const isValidPlanId = validateStrictString(planId, "plan id", 10, 8);

      if (!isValidPlanId.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidPlanId.reason,
          error: { reason: isValidPlanId.reason },
        });
      }

      const [[planInfo]] = await connection.query(
        `SELECT title FROM plans WHERE plan_id = ? AND user_id = ?`,
        [planId, userId]
      );

      if (!planInfo) {
        const response = RESPONSE_MESSAGES.noPlan();
        return res.status(response.status).send(response);
      }

      await connection.query(
        `
        DELETE FROM plan_share WHERE plan_id = ?;
        DELETE FROM plan_shared WHERE plan_id = ?;
        DELETE FROM plans WHERE user_id = ? AND plan_id = ?`,
        [planId, planId, userId, planId]
      );

      res.status(200).send({
        success: true,
        status: 200,
        message: `Deleted plan ${planInfo.title}`,
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.get("/plan/users", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { plan_id: planId } = req.query;

      const isValidPlanId = validateStrictString(planId, "plan id", 10, 8);

      if (!isValidPlanId.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidPlanId.reason,
          error: { reason: isValidPlanId.reason },
        });
      }

      const connection = pool.promise();
      const [[planInfo]] = await connection.query(
        `
        SELECT
          p.user_id,
          CASE
            WHEN COUNT(u.user_id) = 0 THEN '[]'
            ELSE JSON_ARRAYAGG(JSON_OBJECT('user_id', u.user_id, 'name', u.name, 'status', ps.status))
          END AS share
        FROM plans p
        LEFT JOIN plan_share ps ON ps.plan_id = p.plan_id
        LEFT JOIN users u ON u.user_id = ps.user_id
        WHERE p.plan_id = ?
        GROUP BY p.plan_id
      `,
        [planId]
      );

      planInfo.share = JSON.parse(planInfo.share);

      const sharedUserIds = planInfo.share.map((share) => share.user_id);
      if (!sharedUserIds.includes(userId) && planInfo.user_id !== userId) {
        const response = RESPONSE_MESSAGES.nonMember();
        return res.status(response.status).send(response);
      }

      res.send({ success: true, status: 200, data: { users: planInfo.share } });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.post("/plan/share", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { users, plan_id: planId } = req.body;

      if (!users.length) {
        return res.status(400).send({
          success: "false",
          status: 400,
          message: "No users selected",
          error: { reason: "No users selected" },
        });
      }

      const connection = pool.promise();

      const [userInfo, userFriends, [[plan]]] = await Promise.all([
        userCache(connection, userId),
        userFriendsCache(connection, userId),
        connection.query(
          `
          SELECT
            p.plan_id,
            p.title,
            GROUP_CONCAT(DISTINCT ps.user_id) AS share
          FROM plans p
          LEFT JOIN plan_share ps ON ps.plan_id = p.plan_id
          WHERE p.plan_id = ? AND p.user_id = ?
          GROUP BY p.plan_id
          `,
          [planId, userId]
        ),
      ]);

      if (!userInfo) {
        const response = RESPONSE_MESSAGES.noUser();
        return res.status(response.status).send(response);
      }

      if (!plan) {
        const response = RESPONSE_MESSAGES.noPlan();
        return res.status(response.status).send(response);
      }

      plan.share = plan.share ? plan.share.split(",") : [];

      //users that is not shared yet
      const filteredUsers = users.filter((user) => !plan.share.includes(user));

      const friends = filteredUsers.filter((user) =>
        userFriends.includes(user)
      );

      const nonFriends = filteredUsers.filter(
        (user) => !userFriends.includes(user)
      );

      const date = Math.floor(Date.now() / 1000);

      const notifications = [];

      //friends  = accepted, non friend = send request
      const newShare = [];

      filteredUsers.map((user) => {
        const notification_id = generateRandomId(10);

        const notification = {
          notification_id,
          user_id: user,
          from_user_id: userId,
          sent_at: date,
          type: "plan_shared",
          related_id: planId,
        };

        const socketNotification = {
          ...notification,
          plan_share_id: notification_id,
          userInfo,
        };
        //share directly when it's friend
        if (userFriends.includes(user)) {
          notifications.push(notification);

          socketNotification.message = NOTIFICATION_MESSAGES.planShared(
            userInfo.name,
            plan.title
          );

          mainIo.to(user).emit("notification", socketNotification);
          newShare.push([notification_id, planId, user, "accepted", date]);
        } else {
          //non friends
          socketNotification.type = "plan_share";
          socketNotification.message = NOTIFICATION_MESSAGES.planShare(
            userInfo.name,
            plan.title
          );

          mainIo.to(user).emit("notification", socketNotification);
          newShare.push([notification_id, planId, user, "pending", date]);
        }
      });

      if (newShare.length) {
        await connection.query(
          `INSERT IGNORE INTO plan_share
          (plan_share_id, plan_id, user_id, status, date) 
          VALUES ?`,
          [newShare]
        );
      }

      if (notifications.length) {
        await connection.query(
          `INSERT IGNORE INTO notifications
          (notification_id, user_id, from_user_id, sent_at, type, related_id) 
          VALUES ?`,
          [notifications.map((notification) => Object.values(notification))]
        );
      }

      res.status(200).send({
        success: true,
        message: "Plan shared!",
        status: 200,
        data: { share: nonFriends, shared: friends },
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.delete("/plan/share", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { target_id: targetId, plan_id: planId } = req.body;

      const isValidTargetId = validateStrictString(targetId, "user id", 10);

      if (!isValidTargetId.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidTargetId.reason,
          error: { reason: isValidTargetId.reason },
        });
      }

      const connection = pool.promise();

      const [[planInfo]] = await connection.query(
        `
        SELECT
          p.plan_id,
          p.title,
          p.user_id,
          JSON_ARRAYAGG(JSON_OBJECT('user_id', u.user_id, 'name', u.name)) AS share
        FROM plans p
        LEFT JOIN plan_share ps ON ps.plan_id = p.plan_id
        LEFT JOIN users u ON u.user_id = ps.user_id
        WHERE p.plan_id = ?
        GROUP BY p.plan_id
      `,
        [planId]
      );

      planInfo.share = JSON.parse(planInfo.share).filter(
        (user) => user.user_id
      );

      const sharedIds = planInfo.share.map((share) => share.user_id);
      if (!sharedIds.includes(userId) && planInfo.user_id !== userId) {
        const response = RESPONSE_MESSAGES.nonMember();
        return res.status(response.status).send(response);
      }

      await connection.query(
        `
        DELETE FROM plan_share WHERE plan_id = ? AND user_id = ?;
        DELETE FROM notifications WHERE related_id = ? AND type = "plan_shared" AND from_user_id = ? AND user_id = ?
        `,
        [planId, targetId, planId, userId, targetId]
      );

      res
        .status(200)
        .send({ success: true, status: 200, message: `Removed user!` });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.post("/plan/share/respond", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { notification_id: notificationId, accepted } = req.body;

      const isValidAcceped = validateBoolean(accepted, "accept", true);

      if (!isValidAcceped.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidAcceped.reason,
          error: { reason: isValidAcceped.reason },
        });
      }

      const isValidNotificationId = validateStrictString(
        notificationId,
        "notification id",
        10
      );
      if (!isValidNotificationId.isValid) {
        const response = RESPONSE_MESSAGES.validationError(
          isValidNotificationId
        );
        return res.status(response.status).send(response);
      }

      const connection = pool.promise();

      await connection.query(
        "DELETE FROM notifications WHERE user_id = ? AND notification_id = ?",
        [userId, notificationId]
      );

      console.log("gddd");

      if (!accepted) {
        const [result] = await connection.query(
          `
          DELETE FROM plan_share
          WHERE plan_share_id = ? AND user_id = ?
        `,
          [notificationId, userId]
        );

        console.log(result);

        if (!result.affectedRows) {
          const response = RESPONSE_MESSAGES.expiredRequest();
          return res.status(response.status).send(response);
        }

        return res.status(200).send({
          success: true,
          status: 200,
          message: `Declined share request!`,
        });
      }

      const date = Math.floor(Date.now() / 1000);

      const shared = {
        date,
        status: "accepted",
      };

      await connection.query(
        `UPDATE plan_share SET ? WHERE plan_share_id = ? AND user_id = ?`,
        [shared, notificationId, userId]
      );

      return res.status(200).send({
        success: true,
        status: 200,
        message: `Accepted share request!`,
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

module.exports = Router;
