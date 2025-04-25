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
      const { date } = req.query;

      const isValidDate = validateISO(date, "date");
      if (!isValidDate.isValid) {
        const response = RESPONSE_MESSAGES.validationError(isValidDate);
        return res.status(response.status).send(response);
      }

      const dateTime = DateTime.fromISO(date).startOf("day").startOf("month");
      const timeMin = dateTime.minus({ week: 1 }).toISO();
      const timeMax = dateTime.endOf("month").plus({ week: 1 }).toISO();

      const connection = pool.promise();

      const access_token = await googleAccessTokenCache(connection, userId);

      if (!access_token) {
        return res.status(200).send({
          success: true,
          status: 200,
          data: { plans: [] },
        });
      }

      const auth = googleOauth2client({ access_token });
      const googleCalendar = google.calendar({ version: "v3", auth });

      const calendars = await googleCalendar.calendarList.list();

      const items = calendars?.data?.items || [];

      if (!items.length) {
        return res.status(200).send({
          success: true,
          status: 200,
          data: { plans: [] },
        });
      }

      const calendarResults = await Promise.allSettled(
        items.map(async (calendar) => {
          const response = await googleCalendar.events.list({
            calendarId: calendar.id,
            timeMin,
            timeMax,
            maxResults: 250,
          });

          const events = (response.data.items || []).map((event) =>
            formatEvent(calendar, event)
          );

          return {
            background_color: calendar.backgroundColor,
            foreground_color: calendar.foregroundColor,
            summary: calendar.summary,
            id: calendar.id,
            events,
          };
        })
      );

      const plans = calendarResults
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      return res.status(200).send({
        success: true,
        status: 200,
        data: { plans },
      });
    } catch (err) {
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

function formatEvent(calendar, event) {
  const isAllDay = !!event.start?.date;
  const editable =
    calendar.accessRole === "owner" || calendar.accessRole === "writer";

  return {
    id: event.id,
    title: event.summary || "(No Title)",
    description: event.description || "",
    html_link: event.htmlLink || "",
    start: isAllDay ? event.start.date : event.start.dateTime,
    end: isAllDay ? event.end.date : event.end.dateTime,
    all_day: isAllDay,
    background_color: calendar.backgroundColor,
    calendar_id: calendar.id,
    editable,
  };
}

Router.patch("/plan", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { plan } = req.body;
      console.log(plan);

      const access_token = await googleAccessTokenCache(null, userId);

      if (!access_token) {
        const response = RESPONSE_MESSAGES.notAuthed();
        return res.status(response.status).send(response);
      }

      const auth = googleOauth2client({ access_token });
      const googleCalendar = google.calendar({ version: "v3", auth });

      const patchPlanResponse = await googleCalendar.events.update({
        calendarId: plan.calendar_id,
        eventId: plan.id,
        requestBody: {
          ...plan,
          summary: plan.title,
          start: { dateTime: plan.start },
          end: { dateTime: plan.end },
        },
      });

      const calendarResponse = await googleCalendar.calendarList.get({
        calendarId: "primary",
        auth,
      });

      const formattedPlan = formatEvent(
        calendarResponse.data,
        patchPlanResponse.data
      );

      res.status(200).send({
        success: true,
        status: 200,
        message: "Plan Saved!",
        data: { plan: formattedPlan },
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.put("/plan", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { plan } = req.body;

      const access_token = await googleAccessTokenCache(null, userId);

      if (!access_token) {
        const response = RESPONSE_MESSAGES.notAuthed();
        return res.status(response.status).send(response);
      }

      const auth = googleOauth2client({ access_token });
      const googleCalendar = google.calendar({ version: "v3", auth });

      console.log("put", plan);

      const response = await googleCalendar.events.insert({
        calendarId: "primary",
        requestBody: {
          ...plan,
          summary: plan.title,
          start: { dateTime: plan.start },
          end: { dateTime: plan.end },
        },
      });

      const calendarResponse = await googleCalendar.calendarList.get({
        calendarId: "primary",
        auth,
      });

      const formattedPlan = formatEvent(calendarResponse.data, response.data);

      console.log(formattedPlan);

      res.status(200).send({
        success: true,
        status: 200,
        message: "Plan Saved!",
        data: {
          plan: formattedPlan,
        },
      });
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
      const { calendar_id, plan_id } = req.body;
      const access_token = await googleAccessTokenCache(null, userId);

      if (!access_token) {
        const response = RESPONSE_MESSAGES.notAuthed();
        return res.status(response.status).send(response);
      }

      const auth = googleOauth2client({ access_token });
      const googleCalendar = google.calendar({
        version: "v3",
        auth: auth,
      });

      await googleCalendar.events.delete({
        calendarId: calendar_id,
        eventId: plan_id,
        auth: auth,
      });

      res.status(200).send({
        success: true,
        status: 200,
        message: `Deleted the plan`,
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
          userinfo: userInfo,
        };
        //share directly when it's friend
        if (userFriends.includes(user)) {
          notifications.push(notification);

          socketNotification.message = NOTIFICATION_MESSAGES.planShared(
            userInfo,
            plan.title
          );

          mainIo.to(user).emit("notification", socketNotification);
          newShare.push([notification_id, planId, user, "accepted", date]);
        } else {
          //non friends
          socketNotification.type = "plan_share";
          socketNotification.message = NOTIFICATION_MESSAGES.planShare(
            userInfo,
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
