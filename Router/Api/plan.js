const express = require("express");
const Router = express.Router();
const pool = require('../model/pool');
const notificationService = require('../services/notification');
const account = require('./account');
const Ajv = require('ajv');
const ajv = new Ajv();
const {DateTime} = require('luxon');


Router.post('/bring-plans', async(req, res) => {
  account.autoSignin(req, res, (async() => {
    const connection = pool.promise();

    let [plans] = await connection.query(`SELECT * from plans where user_id = ?`, [req.session.user_id]);
    res.send({success: true, plans: plans})
    pool.releaseConnection(connection);
  }))
});

Router.post('/update-plan', async(req, res) => {
  account.autoSignin(req, res, (async() => {
    try {
      const planInfo = req.body;
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 100 },
          id: { type: 'string', minLength: 10, maxLength: 10 },
          date: { type: 'integer'},
          hr: { type: 'integer', minimum: 0, maximum: 24 },
          min: { type: 'integer', minimum: 0, maximum: 60 },
          length: { type: 'integer' },
          repeat: { type: 'string' },
          description: { type: 'string'},
          subject: { type: 'string' },
          notification: { type: 'string'},
          priority: { type: 'integer', minimum: 0, maximum: 100 },
        },
        required: ['name', 'id', 'date', 'hr', 'min', 'length', 'repeat', 'description', 'notification', 'subject', 'priority'],
        additionalProperties: false
      };

      const isValid = isValidJSON(planInfo, schema);
      if (isValid) {
        const connection = pool.promise();
        try {
          const {name, id, date, hr, min, length, repeat, description, notification, subject, priority} = planInfo;
          const insertInfo = {
            id: id,
            user_id: req.session.user_id,
            name: name,
            date: date.toString(),
            time: `${hr}:${min}`,
            length: length,
            repeat: repeat,
            description: description,
            notification: notification,
            subject: subject,
            priority: priority
          }
          const [deletePrev] = await connection.query(`DELETE FROM plans WHERE user_id = ? AND id = ?`, [req.session.user_id, id]);
          if (!deletePrev.affectedRows) {
            notificationService.removePrevNotification(req.session.user_id, planInfo.id);
          }
          const [userInfo] = await connection.query(`SELECT user_id, name, email, notification_setting, key_salt, iv, subscription from users where user_id = ?`, [req.session.user_id]);
          const startTime = (planInfo.date + planInfo.hr * 60 * 60 + planInfo.min * 60) * 1000;
          notificationService.planNotification(insertInfo, userInfo[0], startTime)
          const insert = connection.query(`INSERT INTO plans SET ?`, insertInfo);
          res.send({success: true})
        } catch (error) {
          res.send({ success: false, reason: 'An error occurred' });
          console.log('Mysql Err', error);
        } finally {
          pool.releaseConnection(connection);
        }
      }
    } catch (error) {
      console.error('An error occurred:', error);
      res.send({ success: false, reason: 'An error occurred' });
    }
  }))
})

function isValidJSON(data, schema) {
  const validate = ajv.compile(schema);
  const isValid = validate(data);

  if (!isValid) {
    return false;
  } else {
    return true;
  }
}

module.exports = Router;