const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { isValidJSON, hashing, generateRandomId, autoSignin, googleOauth2client } = require("../tool");
const { removePrevNotification, planNotification } = require("../services/notification");
const {google} = require('googleapis');
const { DateTime } = require("luxon");

Router.post("/bring-plans", async (req, res) => {
  autoSignin(req, res, (async () => {
    const connection = pool.promise();
    try {
      const userId = req.session.user_id;
      let [plans] = await connection.query(`SELECT id, title, start, end, \`repeat\`, description, notification, subject, priority, completed FROM plans where user_id = ?`, [userId]);
      const [[{google_refresh_token}]] = await connection.query(`SELECT google_refresh_token FROM users WHERE user_id = ?`, [userId]);
      if (google_refresh_token) {
        const auth = googleOauth2client(google_refresh_token);
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
              const {htmlLink, id, summary, start, end, description, reminders} = event;
              const startDateTime = Math.floor(DateTime.fromISO(start ? start.dateTime : '', { zone: start ? start.timeZone : '' }).toSeconds() / 60);
              const endDateTime = Math.floor(DateTime.fromISO(end ? end.dateTime : '', { zone: end ? end.timeZone : '' }).toSeconds() / 60);
              const newEvent = {id, title: summary, start: startDateTime, end: endDateTime, repeat: 0, description, notification: reminders, subject: calendar.summary, priority: 5, completed: 0, htmlLink};
              calendarEvents.push(newEvent);
              return null;
            });
            return null;
          });
          
          await Promise.all(calendarPromises);
          plans = plans.concat(calendarEvents);
        };
      };
      res.send({ success: true, plans: plans });
    } catch (err) {
      console.log(err);
    } finally {
      pool.releaseConnection(connection);
    }
  }));
});

Router.post('/update-plan', async (req, res) => {
  autoSignin(req, res, (async() => {
    try {
      const userId = req.session.user_id;
      const planInfo = req.body;
      const now = new Date();
      const maxPlanVal = Math.floor(new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).getTime() / (1000 * 60));
      const schema = {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 100 },
          id: { type: 'string', minLength: 10, maxLength: 10 },
          start: { type: 'integer', minimum: 0, maximum: maxPlanVal },
          end: { type: 'integer', minimum: 0, maximum: maxPlanVal },
          repeat: { type: 'integer', minimum: 0, maximum: 3 },
          description: { type: 'string', minLength: 0, maxLength: 1000 },
          subject: { type: 'string', minLength: 10, maxLength: 10 },
          notification: { type: 'integer', minimum: -1, maximum: 60 },
          priority: { type: 'integer', minimum: 0, maximum: 100 },
          completed: { type: 'integer', minimum: 0, maximum: 1 }
        },
        required: ['title', 'id', 'start', 'end', 'repeat', 'description', 'notification', 'subject', 'priority', 'completed'],
        additionalProperties: false
      };
  
      const isValid = isValidJSON(planInfo, schema);
      const {title, id, start, end, repeat, description, subject, notification, priority, completed} = planInfo;
      if (planInfo.start > planInfo.end) {
        return res.send({ success: false, reason: 'Invalid Time' });
      };
  
      if (!planInfo.title.length) {
        return res.send({ success: false, reason: 'Enter Plan Title' });
      }
      if (isValid) {
        const connection = pool.promise();
        try {
          const insertInfo = { ...planInfo, user_id: userId };
          const [deletePrev] = await connection.query(`DELETE FROM plans WHERE user_id = ? AND id = ?`, [userId, planInfo.id]);
          if (!deletePrev.affectedRows) {
            removePrevNotification(userId, planInfo.id);
          }
          const [userInfo] = await connection.query(`SELECT user_id, name, email, notification_setting, key_salt, iv, subscription from users where user_id = ?`, [userId]);
          const startTime = planInfo * 1000 * 60;
          planNotification(insertInfo, userInfo[0], startTime)
          const insert = await connection.query(`INSERT INTO plans SET ?`, insertInfo);
          res.send({ success: true, msg: 'Plan Saved!' })
        } catch (error) {
          res.send({ success: false, reason: 'An error occurred' });
          console.log('Mysql Err', error);
        };
      } else {
        res.send({ success: false, reason: 'Invalid Value' });
      }
    } catch (error) {
      console.error('An error occurred:', error);
      res.send({ success: false, reason: 'An error occurred' });
    };
  }))
});

Router.post("/status-change", async (req, res) => {
  autoSignin(req, res, (async() => {
    try {
      const planInfo = req.body;
      const userId = req.session.user_id;
      const schema = {
        type: 'object',
        properties: {
          id: { type: 'string', minLength: 10, maxLength: 10 },
          completed: { type: 'integer', minimum: 0, maximum: 1 }
        },
        required: ['id', 'completed'],
        additionalProperties: false
      };
  
      const isValid = isValidJSON(planInfo, schema);
      if (isValid) {
        const connection = pool.promise();
        try {
          await connection.query(`UPDATE plans SET completed = ? WHERE id = ?`, [planInfo.completed, planInfo.id])
          res.send({ success: true, msg: 'Updated' })
        } catch (err) {
          console.log(err);
        } finally {
          connection.releaseConnection();
        };
      } else {
        res.send({ success: false, reason: "Invalid data" });
      }
    } catch (err) {
      console.log(err);
      res.send({ success: false, reason: "Err" });
    };
  }));
});

module.exports = Router;