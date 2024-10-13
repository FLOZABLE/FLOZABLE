const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { DateTime } = require("luxon");
const {
  usersCache,
  userCache,
  userFriendsCache,
} = require("../services/redisLoader");
const { RESPONSE_CODES } = require("../Constant");
const { getDates } = require("../Utils/tool");
const { autoSignin } = require("./auth");

Router.get("/", async (req, res) => {
  try {
    const { mode, date, timezone } = req.query;

    const dateTime = DateTime.fromISO(date, { zone: timezone })
      .startOf("day")
      .startOf(mode);

    const now = DateTime.now().setZone(timezone).startOf("day").startOf(mode);

    const rankings = [];

    const connection = pool.promise();

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

    const users = await usersCache(
      connection,
      rankings.map((ranking) => ranking.user_id)
    );

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

Router.get("/user", async (req, res) => {
  try {
    const { userId, mode, date, timezone } = req.query;

    const dates = getDates(date, timezone, mode, 7);

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

Router.get("/friends", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();

      const [userInfo, userFriends] = await Promise.all([
        userCache(connection, userId),
        userFriendsCache(connection, userId),
      ]);

      if (!userInfo) return res.send(RESPONSE_CODES["no-user"]);

      const { mode, timezone, date } = req.query;

      const now = DateTime.now().setZone(timezone).startOf("day").startOf(mode);

      const dateTime = date
        ? DateTime.fromISO(date, { zone: timezone })
            .startOf("day")
            .startOf(mode)
        : now;

      const friends = await usersCache(connection, userFriends);

      friends.push(userInfo);

      if (now.toSeconds() === dateTime.toSeconds()) {
        //today/this week/this month = cached
        const timezoneOffset = Math.floor(now.offset / 60).toString();

        const studyTotal = await redisClient.zmscore(
          `users:${timezoneOffset}:${mode}Total`,
          friends.map((friend) => friend.user_id)
        );

        friends.map((friend, i) => {
          friend.study_time = studyTotal[i] ? parseInt(studyTotal[i]) : 0;
        });

        friends.sort((a, b) => b.study_time - a.study_time);
      } else {
        const [rankingsData] = await connection.query(
          `
          SELECT
          r.length,
          rd.rank,
          rd.user_id,
          rd.study_time
          FROM ranking_details rd
          JOIN rankings r
          ON r.ranking_id = rd.ranking_id
          WHERE r.date = ? AND r.mode = ? AND rd.user_id IN (?)
          ORDER by rd.rank
        `,
          [dateTime.toSeconds(), mode, friends.map((friend) => friend.user_id)]
        );

        friends.map((friend) => {
          const ranking = rankingsData.find(
            (ranking) => ranking.user_id === friend.user_id
          );
          friend = { ...friend, ranking };
        });
      }

      res.send({ success: true, rankings: friends });
    } catch (err) {
      console.log(err);
      res.send({ success: false, reason: "An Error Occured" });
    }
  });
});

module.exports = Router;
