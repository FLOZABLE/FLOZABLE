const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');
const extensionAuthKey = process.env.EXTENSIONAUTHKEY;
const crypto = require('crypto');

function encryptText(text, key, iv) {
  const algorithm = 'aes-256-gcm';

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encryptedData = cipher.update(text, 'utf8', 'hex');
  encryptedData += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return { encryptedData, tag };
}

Router.post("/update-tabs", async (req, res) => {
  if(!req.session.user_id) {
    return res.send({success: false, reason: 'auth-fail'})
  }
  const connection = await (await pool).getConnection();
  const newWebUsageData = req.body.tabUsageData;
  let prevWebUsageData = await connection.query(`SELECT activity from users where user_id = "${req.session.user_id}"`);
  prevWebUsageData = JSON.parse(prevWebUsageData[0].activity);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const date = new Date();
  date.toLocaleString("en-US", { timeZone });
  date.setHours(0, 0, 0, 0);
  prevWebUsageData[date / 1000] = {data: newWebUsageData};

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

  let prevWebUsageData = await connection.query(`SELECT activity from users where user_id = "${req.session.user_id}"`);
  prevWebUsageData = JSON.parse(prevWebUsageData[0].activity);
  const date = req.body.date;
  res.send({success: true, data: prevWebUsageData[date / 1000]})
  connection.release();
})

module.exports = Router;