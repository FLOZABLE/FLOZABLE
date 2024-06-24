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
} = require("../tool");
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
} = require("../validate");
const {
  googleAccessTokenCache,
  userCache,
  usersCache,
} = require("../services/redisLoader");
const schedule = require("node-schedule");
const { responseCodes } = require("../Constant");

Router.get("/", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      let [plans] = await connection.query(
        `SELECT id, title, start, end, \`repeat\`, description, notification, subject, priority, completed, share, shared FROM plans where user_id = ?`,
        [userId]
      );
      plans.map((plan) => {
        plan.editable = true;
        plan.isEditable = true;
        plan.share = plan.share === "" ? [] : plan.share.split(",");
        plan.shared = plan.shared === "" ? [] : plan.shared.split(",");
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
                    id,
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

Router.post("/update", async (req, res) => {
  autoSignin(
    req,
    res,
    async (userId, timezone) => {
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
          subject,
          notification,
          priority,
          completed,
          type,
          share,
          shared,
        } = planInfo;

        console.log(share, shared);
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

        const isValidSubject = validateStrictString(subject, "Subject", 10, 10);
        if (!isValidSubject.isValid) {
          return res.send({ success: false, reason: isValidSubject.reason });
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

        const isValidPriority = validateStrictString(
          priority,
          "Subject",
          10,
          10
        );
        if (!isValidPriority.isValid) {
          return res.send({ success: false, reason: isValidPriority.reason });
        }

        const isValidCompleted = validateInteger(completed, "Completed", 0, 1);
        if (!isValidCompleted.isValid) {
          return res.send({ success: false, reason: isValidCompleted.reason });
        }

        const isValidSharedUsers = validateArray(share, "Shared Users", 5, 0);
        if (!isValidSharedUsers.isValid) {
          return res.send({
            success: false,
            reason: isValidSharedUsers.reason,
          });
        }

        const connection = pool.promise();

        const [[userInfo]] = await connection.query(
          `SELECT friends, key_salt, iv, notification_endpoint, notification_keys from users where user_id = ?`,
          [userId]
        );

        if (!userInfo)
          return res.send({ success: false, reason: responseCodes["no-user"] });

        try {
          const planData = {
            title,
            id,
            start,
            end,
            repeat,
            description,
            subject,
            notification,
            priority,
            completed,
            user_id: userId,
          };

          /* if (share.length) {
            console.log(userInfo);
            const existingUsers = (
              await connection.query(
                `SELECT user_id FROM users WHERE user_id IN(?)`,
                [share]
              )
            )[0].map((userInfo) => userInfo.user_id);
            console.log(existingUsers, userInfo);

            const friends = existingUsers.filter((user) =>
              userInfo.friends.includes(user)
            );

            console.log(friends);
          } */

          const [deletePrev] = await connection.query(
            `DELETE FROM plans WHERE user_id = ? AND id = ?`,
            [userId, id]
          );
          if (deletePrev.affectedRows) {
            schedule.cancelJob(userId + "-" + id);
          } else {
            planData.id = generateRandomId(10);
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
          res.send({ success: true, msg: "Plan Saved!", planData });
        } catch (error) {
          res.send({ success: false, reason: "An error occurred" });
          console.log(error);
        }
      } catch (error) {
        console.error("An error occurred:", error);
        res.send({ success: false, reason: "An error occurred" });
      }
    },
    undefined,
    true
  );
});

Router.post("/status-change", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { id, completed } = req.body;

      const isValidId = validateStrictString(id, "plan id", 10, 8);

      if (!isValidId.isValid) {
        return res.send({ success: false, reason: isValidId.reason });
      }

      const isValidCompleted = validateInteger(completed, "completed", 1, 0);

      if (!isValidCompleted) {
        return res.send({ success: false, reason: isValidCompleted.reason });
      }

      const connection = pool.promise();
      try {
        await connection.query(
          `UPDATE plans SET completed = ? WHERE id = ? AND user_id = ?`,
          [completed, id, userId]
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

Router.delete("/", async (req, res) => {
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

Router.get("/users", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { id } = req.query;

      const isValidId = validateStrictString(id, "Id", 10, 10);
      if (!isValidId.isValid) {
        return res.send({ success: false, reason: isValidId.reason });
      }

      const connection = pool.promise();

      const [[plan]] = await connection.query(
        `SELECT share FROM plans WHERE id = ? AND user_id = ?`,
        [id, userId]
      );

      if (!plan) {
        return res.send({ success: false, reason: "Invalid Plan" });
      }

      const sharedIds = plan.share === "" ? [] : plan.share.split(",");

      const users = await usersCache(sharedIds);
      res.send({ success: true, users });
    } catch (err) {
      console.log(err);
      res.send({ success: false });
    }
  });
});

Router.post("/share", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { targetId } = req.body;

      console.log(targetId);
    } catch (err) {
      console.log(err);
      res.send({ success: false });
    }
  });
});

Router.post("/share", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { users } = req.body;

      if (!users.length) return res.send({success: true});

      const existingUsers = (
        await connection.query(
          `SELECT user_id FROM users WHERE user_id IN(?)`,
          [share]
        )
      )[0].map((userInfo) => userInfo.user_id);
      console.log(existingUsers, userInfo);

      const friends = existingUsers.filter((user) =>
        userInfo.friends.includes(user)
      );

      console.log(friends);

      console.log(targetId);
    } catch (err) {
      console.log(err);
      res.send({ success: false });
    }
  });
});

Router.post("/share/respond", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { planId, accepted } = req.body;

      console.log(planId, accepted);
    } catch (err) {
      console.log(err);
      res.send({ success: false });
    }
  });
});

/* Router.post("/share", async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const connection = pool.promise();

      const user = await userCache(userId);

      if (!user) return res.send({success: false, reason: responseCodes['no-user']});

      if (user.friends.include)
    } catch (err) {
      console.log(err);
      res.send({ success: false });
    };
  }));
}); */
module.exports = Router;
