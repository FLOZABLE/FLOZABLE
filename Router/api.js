const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');
const extensionAuthKey = process.env.EXTENSIONAUTHKEY;
const crypto = require('crypto');
const {DateTime} = require('luxon')

function encryptText(text, key, iv) {
  const algorithm = 'aes-256-gcm';

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encryptedData = cipher.update(text, 'utf8', 'hex');
  encryptedData += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return { encryptedData, tag };
};

Router.post("/update-tabs", async (req, res) => {
  if(!req.session.user_id) {
    return res.send({success: false, reason: 'auth-fail'})
  }
  const connection = await (await pool).getConnection();
  const newWebUsageData = req.body.tabUsageData;
  let prevWebUsageData = await connection.query(`SELECT activity from users where user_id = ?`, [req.session.user_id]);
  prevWebUsageData = JSON.parse(prevWebUsageData[0].activity);
  const timeZone = req.session.timeZone;

  const userDateTime = DateTime.now().setZone(timeZone);
  const twelveAmDateTime = userDateTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  const unixTimestamp = Math.floor(twelveAmDateTime.toMillis() / 1000);
  
  prevWebUsageData[unixTimestamp] = newWebUsageData;

  //decrypt

  const encryptionKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  const { encryptedData, tag } = encryptText(JSON.stringify(prevWebUsageData), encryptionKey, iv);
  const encryptedEncryptionKey = crypto.pbkdf2Sync(encryptionKey, req.session.user_id, 99097, 32, 'sha512').toString('hex');

  console.log(prevWebUsageData);
  //const encryptInfo = { encryptionKey: encryptedEncryptionKey, iv: iv, tag: tag }
  //const update = await connection.query('UPDATE users SET activity = ? WHERE user_id = ?', [JSON.stringify(encryptedData), req.session.user_id]);
  const update = await connection.query('UPDATE users SET activity = ? WHERE user_id = ?', [JSON.stringify(prevWebUsageData), req.session.user_id]);
  res.send({success: true});
  connection.release();
});

/* Router.post('/user-info', async(req, res) => {
  if(!req.session.loggedin) {
    return res.send({success: false, reason: 'auth-required'})
  }

  res.send({success: true, data: req.session.userInfo});
}) */

Router.post('/bring-tabs', async(req, res) => {
  if(!req.session.user_id) {
    return res.send({success: false, reason: 'auth-fail'})
  }
  const connection = await (await pool).getConnection();

  let prevWebUsageData = await connection.query(`SELECT activity from users where user_id = ?`, [req.session.user_id]);
  prevWebUsageData = JSON.parse(prevWebUsageData[0].activity);
  const date = req.body.date;
  res.send({success: true, data: prevWebUsageData[date / 1000]})
  connection.release();
});

Router.post('/bring-activities', async(req, res) => {
  if(!req.session.user_id) {
    return res.send({success: false, reason: 'auth-fail'})
  }
  const connection = await (await pool).getConnection();

  let prevWebUsageData = await connection.query(`SELECT activity from users where user_id = ?`, [req.session.user_id]);
  prevWebUsageData = JSON.parse(prevWebUsageData[0].activity);
  const date = req.body.date;
  res.send({success: true, data: prevWebUsageData})
  connection.release();
})

Router.post('/bring-activity-setting', async(req, res) => {
  if (!req.session.loggedin) {
    return res.send({ success : false, reason : 'no session'})
  }
  const connection = await (await pool).getConnection();
  let activitySetting = await connection.query(`SELECT activity_setting from users where user_id = ?`, [req.session.user_id]);
  activitySetting = activitySetting[0].activity_setting;
  res.send({ success : true, activitySetting : activitySetting})
});

module.exports = Router;