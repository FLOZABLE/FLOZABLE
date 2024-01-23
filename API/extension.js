const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { autoSignin, arraysHaveSameContents, generateRandomId } = require("../tool");

Router.post("/auth", async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    const authId = generateRandomId(10);
    redisClient.setEx(`extension:auth:${authId}`, 10, userId);
    return res.send({success: true, authId});
  }));
});

Router.get("/today-tabs", async (req, res) => {
  autoSignin(req, res, (async () => {
    const userId = req.session.user_id;
    const tabsTimer = await redisClient.zRangeWithScores(`user:${userId}:tabs:timer`, 0, -1);
    const tabsUsage = await redisClient.zRangeWithScores(`user:${userId}:tabs:usage`, 0, -1);
    const tabs = {};
    tabsTimer.map(tab => {
      const usageCount = tabsUsage.find(usageTab => usageTab.value === tab.value);
      tabs[tab.value] = {usageCount: usageCount ? usageCount.score : 0, totalTime: tab.score};
    });
    res.send({success: true, tabs});
  }));
});

Router.get("/tabs-settings", async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      if (!userId) return res.send({success: false});
      const connection = pool.promise();
      const [[userInfo]] = await connection.query(`SELECT activity_setting FROM users WHERE user_id = ?`, [userId]);
      if (!userInfo) return res.send({success: false, reason: 'No auth'});

      const tabSettings = userInfo.activity_setting === "" ? [] : JSON.parse(userInfo.activity_setting.replace(/^/, "[").replace(/$/, "]"));
      console.log(tabSettings)
      return res.send({success: true, tabSettings});
    } catch (err) {
      return res.send({success: false});
    };
  }));
});

Router.get("/usage", async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const {date, mode} = req.body;
      const connection = pool.promise();
      const [[userInfo]] = await connection.query(`SELECT activity_setting FROM users WHERE user_id = ?`, [userId]);
      if (!userInfo) return res.send({success: false, reason: 'No auth'});

      const tabSettings = userInfo.activity_setting === "" ? [] : JSON.parse(userInfo.activity_setting.replace(/^/, "[").replace(/$/, "]"));
      console.log(tabSettings)
      return res.send({success: true, tabSettings});
    } catch (err) {
      return res.send({success: false});
    };
  }));
});

module.exports = Router;