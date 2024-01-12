const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { autoSignin, arraysHaveSameContents, generateRandomId } = require("../tool");

Router.get("/today-tabs", async (req, res) => {
  autoSignin(req, res, (async () => {
    const userId = req.session.user_id;
    const tabsTimer = await redisClient.zRangeWithScores(`user${userId}:tabs:timer`, 0, -1);
    const tabsUsage = await redisClient.zRangeWithScores(`user${userId}:tabs:usage`, 0, -1);
    console.log(tabsUsage, tabsTimer)
    res.send({success: true, tabsTimer, tabsUsage});
  }));
});

Router.post("/update-tabs", async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const {domain, duration} = req.body;
      console.log(userId, domain, duration)
      if (!userId || !domain || !duration) return res.send({success: false});

      await redisClient.zIncrBy(`user:${userId}:tabs:timer`, duration, domain);
      await redisClient.zIncrBy(`user:${userId}:tabs:usage`, 1, domain);
      return res.send({success: true});
    } catch (err) {
      return res.send({success: false});
    };
  }));
});

Router.get("/tabs-settings", async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;

      if (!userId) return res.send({success: false});
      const connection = pool.promise();
      const tabsSettings = await connection.query(`SELECT activity_setting FROM users WHERE user_id = ?`, [userId]);
      console.log(tabsSettings);

      return res.send({success: true});
    } catch (err) {
      return res.send({success: false});
    };
  }));
});

module.exports = Router;