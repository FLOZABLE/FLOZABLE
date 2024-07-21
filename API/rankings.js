const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { DateTime } = require("luxon");
const { usersCache } = require("../services/redisLoader");

Router.get("/", async (req, res) => {
  try {
    const { mode, date, timezone } = req.query;

    const dateTime = DateTime.fromISO(date)
      .setZone(timezone)
      .startOf("day")
      .startOf(mode);

    const now = DateTime.now().setZone(timezone).startOf("day").startOf(mode);

    const rankings = [];

    if (now.toSeconds() === dateTime.toSeconds()) {
      //today/this week/this month = cached
      const timezoneOffset = Math.floor(now.offset / 60).toString();

      const studyTotal = await redisClient.zrevrange(
        `users:${timezoneOffset}:${mode}Total`,
        0,
        -1,
        "WITHSCORES"
      );

      for (let i = 0; i < studyTotal.length; i += 2) {
        const study_time = parseInt(studyTotal[i + 1]);
        if (study_time) {
          rankings.push({
            user_id: studyTotal[i],
            study_time,
            rank: Math.floor(i / 2) + 1,
          });
        }
      }
    } else {
      const connection = pool.promise();

      const [rankingsData] = await connection.query(
        `
        SELECT
        rd.rank,
        rd.user_id,
        rd.study_time
        FROM ranking_details rd
        JOIN rankings r
        ON r.ranking_id = rd.ranking_id
        WHERE r.date = ? AND r.mode = ?
        ORDER by rd.rank
      `,
        [dateTime.toSeconds(), mode]
      );

      rankings.push(...rankingsData);
    }
    console.log(rankings, date);

    const users = await usersCache(rankings.map((ranking) => ranking.user_id));

    const rankingsUsers = rankings
      .map((ranking) => {
        const user = users.find((user) => user.user_id === ranking.user_id);
        return { ...user, ...ranking };
      })
      .filter((ranking) => ranking.name);

    res.send({ success: true, rankings: rankingsUsers });
  } catch (err) {
    console.log(err);
    res.send({ success: false });
  }
});

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
  let dateTime = DateTime.fromISO(date)
    .setZone(timezone)
    .startOf(mode)
    .startOf("day");
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
