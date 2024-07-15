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
    const [searchedRankings] = await connection.query(
      `SELECT rd.rank, r.date, r.length
      FROM ranking_details rd 
      JOIN rankings r ON rd.ranking_id = r.ranking_id 
      WHERE rd.user_id = ? AND r.mode = ? AND r.date IN (?)`,
      [userId, mode, dates.map((date) => date.toSeconds())]
    );

    const today = DateTime.now().setZone(timezone).startOf("day");
    const timezoneOffset = Math.floor(today.offset / 60).toString();

    const todayRanking = await redisClient.zrevrank(
      `users:${timezoneOffset}:dayTotal`,
      userId
    );

    console.log(dates, "gd");

    const rankings = dates.map((date) => {
      if (
        date.toSeconds() === today.toSeconds() &&
        typeof todayRanking === "number"
      ) {
        return { date: date.toSeconds(), ranking: todayRanking + 1 };
      }

      const rankingInfo = searchedRankings.find(
        (ranking) => ranking.date === date.toSeconds()
      );
      if (rankingInfo) {
        return { date: date.toSeconds(), ranking: rankingInfo.rank };
      }

      return { date: date.toSeconds(), ranking: -1 };
    });

    const [[usersLength]] = await connection.query(
      `SELECT COUNT(*) FROM users`
    );

    res.send({
      success: true,
      rankings,
      maxLength: Object.values(usersLength)[0],
    });
  } catch (err) {
    console.log(err);
    res.send({ success: false });
  }
});

function getDates(date, timezone, mode, length = 30) {
  const dates = [];
  let dateTime = DateTime.fromISO(date).setZone(timezone).startOf(mode).startOf("day");
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
