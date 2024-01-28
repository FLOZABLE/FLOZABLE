const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { isValidJSON, hashing, generateRandomId, autoSignin, googleOauth2client } = require("../tool");
const { removePrevNotification, planNotification } = require("../services/notification");
const { google } = require('googleapis');
const { DateTime } = require("luxon");
const { UserRefreshClient } = require("google-auth-library");
const { validateStrictString, validateInteger, validateLength, validateBoolean } = require("../validate");

Router.get("/", async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const connection = pool.promise();
      let [plans] = await connection.query(`SELECT id, title, start, end, \`repeat\`, description, notification, subject, priority, completed FROM plans where user_id = ?`, [userId]);
      const [[{ google_refresh_token }]] = await connection.query(`SELECT google_refresh_token FROM users WHERE user_id = ?`, [userId]);
      if (google_refresh_token) {
        try {
          const user = new UserRefreshClient(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            google_refresh_token,
          );
          const { credentials } = await user.getAccessToken();
          const auth = googleOauth2client(credentials);
          const googleCalendar = google.calendar({
            version: 'v3',
            auth: auth
          });
          const calendars = await googleCalendar.calendarList.list();
          if (calendars && calendars.data) {
            const calendarEvents = [];
            const calendarPromises = calendars.data.items.map(async (calendar) => {
              // Only bring last 30 days events, future 30 days
              const timeMin = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30);
              const timeMax = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30);
              const response = await googleCalendar.events.list({
                calendarId: calendar.id,
                timeMin,
                timeMax,
              });
              const events = response.data.items;
              events.map(event => {
                const { htmlLink, id, summary, start, end, description, reminders } = event;
                const startDateTime = Math.floor(DateTime.fromISO(start ? start.dateTime : '', { zone: start ? start.timeZone : '' }).toSeconds() / 60);
                const endDateTime = Math.floor(DateTime.fromISO(end ? end.dateTime : '', { zone: end ? end.timeZone : '' }).toSeconds() / 60);
                const newEvent = { id, title: summary, start: startDateTime, end: endDateTime, repeat: 0, description, notification: reminders, subject: calendar.summary, priority: 5, completed: 0, htmlLink };
                calendarEvents.push(newEvent);
                return null;
              });
              return null;
            });

            await Promise.all(calendarPromises);
            plans = plans.concat(calendarEvents);
          };
        } catch (err) {
          if (err.response && err.response && err.response.data && err.response.data.error === "invalid_grant") {
            connection.query(`UPDATE users set google_refresh_token = NULL WHERE user_id = ?`, [userId]);
          };
        };
      };
      res.send({ success: true, plans: plans });
    } catch (err) {
      console.log(err);
      res.send({ success: false });
    };
  }));
});

Router.post('/update', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const planInfo = req.body;
      if (!planInfo) return res.send({ success: false, reason: 'Plan information missing' });

      const minPlanTime = DateTime.now().minus({ month: 1 }).toSeconds();
      const maxPlanTime = DateTime.now().plus({ year: 1 }).toSeconds();
      const { title, id, start, end, repeat, description, subject, notification, priority, completed } = planInfo;

      const isValidTitle = validateStrictString(title, 'Title');
      if (!isValidTitle.isValid) {
        return res.send({ success: false, reason: isValidTitle.reason });
      };
      const isValidId = validateStrictString(id, 'Id', 10, 10);
      if (!isValidId.isValid) {
        return res.send({ success: false, reason: isValidId.reason });
      };

      const isValidStart = validateInteger(start, 'Start time', maxPlanTime, minPlanTime);
      if (!isValidStart.isValid) {
        return res.send({ success: false, reason: isValidStart.reason });
      };

      const isValidEnd = validateInteger(end, 'End time', maxPlanTime, start);
      if (!isValidEnd.isValid) {
        return res.send({ success: false, reason: isValidEnd.reason });
      };

      const isValidRepeat = validateInteger(repeat, 'Repeat', 3, 0);
      if (!isValidRepeat.isValid) {
        return res.send({ success: false, reason: isValidRepeat.reason });
      };

      const isValidDescription = validateLength(description, 'Description', 300);
      if (!isValidDescription.isValid) {
        return res.send({ success: false, reason: isValidDescription.reason });
      };

      const isValidSubject = validateStrictString(subject, 'Subject', 10, 10);
      if (!isValidSubject.isValid) {
        return res.send({ success: false, reason: isValidSubject.reason });
      };

      const isValidNotification = validateInteger(notification, 'Notification', -1, 60);
      if (!isValidNotification.isValid) {
        return res.send({ success: false, reason: isValidNotification.reason });
      };

      const isValidPriority = validateStrictString(priority, 'Subject', 10, 10);
      if (!isValidPriority.isValid) {
        return res.send({ success: false, reason: isValidPriority.reason });
      };

      const isValidCompleted = validateStrictString(completed, 'Completed', 0, 1);
      if (!isValidCompleted.isValid) {
        return res.send({ success: false, reason: isValidCompleted.reason });
      };

      try {
        const connection = pool.promise();
        const planData = { title, id, start, end, repeat, description, subject, notification, priority, completed };
        const insertInfo = { ...planData, user_id: userId };
        const [deletePrev] = await connection.query(`DELETE FROM plans WHERE user_id = ? AND id = ?`, [userId, planData.id]);
        if (!deletePrev.affectedRows) {
          removePrevNotification(userId, planData.id);
        }
        const [userInfo] = await connection.query(`SELECT user_id, name, email, notification_setting, key_salt, iv, subscription from users where user_id = ?`, [userId]);
        const startTime = planData * 1000 * 60;
        planNotification(insertInfo, userInfo[0], startTime)
        const insert = await connection.query(`INSERT INTO plans SET ?`, insertInfo);
        res.send({ success: true, msg: 'Plan Saved!' })
      } catch (error) {
        res.send({ success: false, reason: 'An error occurred' });
        console.log('Mysql Err', error);
      };
    } catch (error) {
      console.error('An error occurred:', error);
      res.send({ success: false, reason: 'An error occurred' });
    };
  }))
});

Router.post("/status-change", async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const { id, completed } = req.body;

      const isValidId = validateStrictString(id, 'plan id', 10, 8);

      if (!isValidId) {
        return res.send({ success: false, reason: isValidId.reason });
      };

      const isValidCompleted = validateInteger(completed, 'completed', 1, 0);

      if (!isValidCompleted) {
        return res.send({ success: false, reason: isValidCompleted.reason });
      };

      const connection = pool.promise();
      try {
        await connection.query(`UPDATE plans SET completed = ? WHERE id = ? AND user_id = ?`, [completed, id, userId]);
        res.send({ success: true, msg: 'Plan Updated' });
      } catch (err) {
        console.log(err);
      };
    } catch (err) {
      console.log(err);
      res.send({ success: false, reason: "Err" });
    };
  }));
});

module.exports = Router;