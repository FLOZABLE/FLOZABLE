const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');
const extensionAuthKey = process.env.EXTENSIONAUTHKEY;


Router.post("/update-tabs", async (req, res) => {
  if(!req.session.user_id) {
    return res.send({success: false, reason: 'auth-fail'})
  }
  const connection = await (await pool).getConnection();
  const newWebUsageData = req.body.tabUsageData;
  let prevWebUsageData = await connection.query(`SELECT activity from users where user_id = "${req.session.user_id}"`);
  prevWebUsageData = JSON.parse(prevWebUsageData[0].activity);
  console.log(req.body.tabUsageData)
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const date = new Date();
  date.toLocaleString("en-US", { timeZone });
  date.setHours(0, 0, 0, 0);
  prevWebUsageData[date / 1000] = {data: newWebUsageData};

  /* const newWebsites = Object.keys(newWebUsageData);
  const prevWebsites = Object.keys(prevWebUsageData);
  Object.values(newWebUsageData).map((newWebsite, index) => {
    if(prevWebUsageData[newWebsites[index]]) {
      prevWebUsageData[newWebsites[index]].timeline = prevWebUsageData[newWebsites[index]].timeline.concat(newWebsite.timeline);
      prevWebUsageData[newWebsites[index]].usageCount = prevWebUsageData[newWebsites[index]].usageCount += newWebsite.usageCount;
      prevWebUsageData[newWebsites[index]].lastActiveTime = newWebsite.lastActiveTime;
      prevWebUsageData[newWebsites[index]].totalTime += newWebsite.totalTime;
    } else {
      prevWebUsageData[newWebsites[index]] = newWebsite;
    }
  }) */

  console.log(prevWebUsageData)


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

module.exports = Router;