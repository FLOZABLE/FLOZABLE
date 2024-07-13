const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { autoSignin } = require("../Utils/tool");
const { DateTime } = require("luxon");

Router.get("/ranking/user", async (req, res) => {
  try {
    const { userId, mode, date, timezone } = req.query;

    
    let formattedMode = "day";
    
    if (mode.toLowerCase() === "weekly") {
      formattedMode = "week";
    } else if (mode.toLowerCase() === "monthly") {
      formattedMode = "month";
    }
    const dates = getDates(date, timezone, formattedMode);

    const connection = pool.promise();
    const [userRankings] = await connection.query(
      `SELECT rd.rank, r.date, r.length
      FROM ranking_details rd 
      JOIN rankings r ON rd.ranking_id = r.ranking_id 
      WHERE rd.user_id = ? AND r.mode = ? AND r.date IN (?)`,
      [userId, mode, dates.map((date) => date.toSeconds())]
    );
    console.log(userRankings, dates.map((date) => date.toSeconds()), userId, mode);

    const today = DateTime.now().setZone(timezone).startOf("day");
    const timezoneOffset = Math.floor(today.offset / 60).toString();

    const dayTotal = await redisClient.zscore(
      `users:${timezoneOffset}:dayTotal`,
      userId
    );

    res.send({ success: false });
  } catch (err) {
    console.log(err);
  }
});

function getDates(date, timezone, mode, length = 10) {
  const dates = [];
  let dateTime = DateTime.fromISO(date).setZone(timezone);
  const now = DateTime.now().setZone(timezone).startOf(mode).startOf("day");

  for (let i = 0; i < length; i++) {
    if (dateTime.plus({ [mode]: i }) <= now) {
      dates.push(dateTime.plus({ [mode]: i }));
    }
  }
  while (dates.length < length) {
    dateTime = dateTime.minus({ [mode]: 1 });
    dates.unshift(dateTime);
  }

  return dates;
}

module.exports = Router;
