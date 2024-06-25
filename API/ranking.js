const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const NodeCache = require("node-cache");
const { DateTime } = require("luxon");
const {
  userCache,
  getActiveUsers,
} = require("../services/redisLoader");
const { promises } = require("fs");
const { autoSignin } = require("../Utils/tool");
const {
  validateStrictString,
  validateISO,
  validateTimeZone,
} = require("../Utils/validate");
const rankingCache = new NodeCache();

const REFRESH_INTERVAL = 60 * 3; //3min

Router.get("/sort", async (req, res) => {
  const { mode, date, timezone } = req.query;

  try {
    let dateTime = DateTime.fromISO(date, { zone: timezone });
    const minOffset = dateTime.offset % 60;
    dateTime = dateTime.plus({ minute: minOffset });

    const today = DateTime.now().setZone(timezone);
    const timezoneOffset = Math.floor(dateTime.offset / 60).toString();

    let rankings = [];
    if (mode === "Daily") {
      //use redis value when its today
      if (dateTime.hasSame(today, "day")) {
        //today
        rankings = rankingCache.get(`day:${timezoneOffset}`);
        if (!rankings) {
          const users = await getActiveUsers("day");
          rankings = await todaySorting(users, timezoneOffset);
          rankings = await Promise.all(
            rankings.map(async (ranking) => {
              const user = await userCache(ranking.userId);
              return { ...ranking, ...user };
            })
          );

          //cache value into node cache
          rankingCache.set(`day:${timezoneOffset}`, rankings, REFRESH_INTERVAL);
        }
      } else {
        //get ranking from database if its not today;
        const connection = pool.promise();
        const [[dailyRanking]] = await connection.query(
          `SELECT ranking FROM dailyRanking WHERE date = ?`,
          [dateTime.toSeconds()]
        );
        if (dailyRanking) {
          rankings = JSON.parse(dailyRanking.ranking);
          rankings = await Promise.all(
            rankings.map(async (ranking) => {
              const user = await userCache(ranking.u);
              return { ...ranking, ...user };
            })
          );
        }
      }
    } else if (mode === "Weekly") {
      //use redis value when its same week
      if (today.hasSame(dateTime, "week")) {
        rankings = rankingCache.get(`week:${timezoneOffset}`);
        if (!rankings) {
          const users = await getActiveUsers("week");
          rankings = await thisWeekSorting(users, timezoneOffset);
          rankings = await Promise.all(
            rankings.map(async (ranking) => {
              const user = await userCache(ranking.userId);
              return { ...ranking, ...user };
            })
          );

          //cache value into node cache
          rankingCache.set(
            `week:${timezoneOffset}`,
            rankings,
            REFRESH_INTERVAL
          );
        }
      } else {
        //get ranking from database if its not today;
        const connection = pool.promise();
        const [[weeklyRanking]] = await connection.query(
          `SELECT ranking FROM weeklyRanking WHERE date = ?`,
          [dateTime.startOf("week").toSeconds()]
        );
        if (weeklyRanking) {
          rankings = JSON.parse(weeklyRanking.ranking);
          rankings = await Promise.all(
            rankings.map(async (ranking) => {
              const user = await userCache(ranking.u);
              return { ...ranking, ...user };
            })
          );
        }
      }
    } else {
      //month

      //use redis value when its same month
      if (today.hasSame(dateTime, "month")) {
        rankings = rankingCache.get(`month:${timezoneOffset}`);
        if (!rankings) {
          const users = await getActiveUsers("week");
          rankings = await thisMonthSorting(users, timezoneOffset);
          rankings = await Promise.all(
            rankings.map(async (ranking) => {
              const user = await userCache(ranking.userId);
              return { ...ranking, ...user };
            })
          );

          //cache value into node cache
          rankingCache.set(
            `month:${timezoneOffset}`,
            rankings,
            REFRESH_INTERVAL
          );
        }
      } else {
        //get ranking from database if its not today;
        const connection = pool.promise();
        const [[monthlyRanking]] = await connection.query(
          `SELECT ranking FROM monthlyRanking WHERE date = ?`,
          [dateTime.startOf("month").toSeconds()]
        );
        if (monthlyRanking) {
          rankings = JSON.parse(monthlyRanking.ranking);
          rankings = await Promise.all(
            rankings.map(async (ranking) => {
              const user = await userCache(ranking.u);
              return { ...ranking, ...user };
            })
          );
        }
      }
    }

    res.send({ success: true, data: rankings });
  } catch (err) {
    console.log(err);
    res.send({ success: false, reason: "Invalid Values" });
  }
});

async function todaySorting(users, timezoneOffset) {
  const filteredUsers = [];
  await Promise.all(
    users.map(async (userId) => {
      const todayTotal = await redisClient.zScore(
        `user:${userId}:dayTotal`,
        timezoneOffset
      );
      if (todayTotal) {
        filteredUsers.push({ userId, t: todayTotal });
      }
    })
  );

  return filteredUsers.sort((a, b) => b.t - a.t);
}

async function thisWeekSorting(users, timezoneOffset) {
  const filteredUsers = [];

  await Promise.all(
    users.map(async (userId) => {
      const weekTotal = await redisClient.zScore(
        `user:${userId}:weekTotal`,
        timezoneOffset.toString()
      );
      const todayTotal = await redisClient.zScore(
        `user:${userId}:dayTotal`,
        timezoneOffset.toString()
      );
      if (weekTotal || todayTotal) {
        const t = weekTotal ? weekTotal : 0 + todayTotal ? todayTotal : 0;
        filteredUsers.push({ userId, t });
      }
    })
  );

  return filteredUsers.sort((a, b) => b.t - a.t);
}

async function thisMonthSorting(users, timezoneOffset) {
  const filteredUsers = [];

  await Promise.all(
    users.map(async (userId) => {
      const monthTotal = await redisClient.zScore(
        `user:${userId}:monthTotal`,
        timezoneOffset.toString()
      );
      const todayTotal = await redisClient.zScore(
        `user:${userId}:dayTotal`,
        timezoneOffset.toString()
      );
      if (monthTotal || todayTotal) {
        const t = monthTotal ? monthTotal : 0 + todayTotal ? todayTotal : 0;
        filteredUsers.push({ userId, t });
      }
    })
  );

  return filteredUsers.sort((a, b) => b.t - a.t);
}

const LENGTH = 7;
/** get ranking change of user for each period */
Router.get("/user", async (req, res) => {
  try {
    const { userId, date, mode, timezone } = req.query;

    const isValidUserId = validateStrictString(userId, "user id", 10);

    if (!isValidUserId.isValid) {
      return res.send({ success: false, reason: isValidUserId.reason });
    }

    const isValidDate = validateISO(date, "date");

    if (!isValidDate.isValid) {
      return res.send({ success: false, reason: isValidDate.reason });
    }

    const isValidMode = validateStrictString(mode, "mode", 10);

    if (!isValidMode.isValid) {
      return res.send({ success: false, reason: isValidMode.reason });
    }

    const isValidTimezone = validateTimeZone(timezone);

    if (!isValidTimezone.isValid) {
      return res.send({ success: false, reason: isValidTimezone.reason });
    }

    if (!userId) {
      return res.send({ success: false, reason: "userid required" });
    }

    const connection = pool.promise();
    let rankings = [];

    if (mode === "day" || mode === "daily") {
      rankings = await userDailySorting(userId, date, timezone, LENGTH);
    } else if (mode === "week" || mode === "weekly") {
      rankings = await userWeeklySorting(userId, date, timezone, LENGTH);
    } else {
      rankings = await userMonthlySorting(userId, date, timezone, LENGTH);
    }
    const [[usersLength]] = await connection.query(
      `SELECT COUNT(*) FROM users`
    );
    res.send({
      success: true,
      rankings: { data: rankings, maxLength: Object.values(usersLength)[0] },
    });
  } catch (err) {
    console.log(err);
    res.send({ success: false, reason: "err" });
  }
});

async function userDailySorting(userId, date, timezone, length) {
  const rankings = [];
  let dateStart = DateTime.fromISO(date, { zone: timezone });
  //this prevents from displaying future ranking
  const today = DateTime.now().setZone(timezone).startOf("day");
  const timezoneOffset = Math.floor(today.offset / 60).toString();
  const minOffset = today.offset % 60;
  dateStart = dateStart.minus({ minute: minOffset });
  let diff = today.diff(dateStart, "days").toObject().days;
  while (diff < length - 1) {
    dateStart = dateStart.plus({ days: -1 });
    diff += 1;
  }
  const connection = pool.promise();
  for (let i = 0; i < length; i++) {
    const date = dateStart.plus({ days: i }).toSeconds();
    const [[dailyRanking]] = await connection.query(
      `SELECT ranking FROM dailyRanking WHERE date = ?`,
      [date]
    );
    if (dailyRanking) {
      const parsedRanking = JSON.parse(dailyRanking.ranking);
      const rankingIndex = parsedRanking.findIndex((info) => {
        return info.u === userId;
      });
      rankings.push({ date, ranking: rankingIndex });
    } else if (date === today.toSeconds()) {
      const users = await getActiveUsers("week");
      const rankingVal = await todaySorting(users, timezoneOffset);
      const rankingIndex = rankingVal.findIndex((ranking) => {
        return ranking.userId === userId;
      });
      rankings.push({ date, ranking: rankingIndex });
    } else {
      rankings.push({ date, ranking: -1 });
    }
  }
  return rankings;
}

async function userWeeklySorting(userId, date, timezone, length) {
  const rankings = [];
  let weekStart = DateTime.fromISO(date, { zone: timezone }).startOf("week");
  //this prevents from displaying future ranking
  const thisWeek = DateTime.now().setZone(timezone).startOf("week");
  const timezoneOffset = Math.floor(thisWeek.offset / 60).toString();
  const minOffset = thisWeek.offset % 60;
  weekStart = weekStart.minus({ minute: minOffset });
  let diff = thisWeek.diff(weekStart, "weeks").toObject().weeks;
  while (diff < length - 1) {
    weekStart = weekStart.plus({ weeks: -1 });
    diff += 1;
  }
  const connection = pool.promise();
  for (let i = 0; i < length; i++) {
    const date = weekStart.plus({ weeks: i }).toSeconds();
    const [[weeklyRanking]] = await connection.query(
      `SELECT ranking FROM weeklyRanking WHERE date = ?`,
      [date]
    );
    if (weeklyRanking) {
      const parsedRanking = JSON.parse(weeklyRanking.ranking);
      const rankingIndex = parsedRanking.findIndex((info) => {
        return info.u === userId;
      });
      rankings.push({ date, ranking: rankingIndex });
    } else if (date === thisWeek.toSeconds()) {
      const users = await getActiveUsers("week");
      const rankingVal = await thisWeekSorting(users, timezoneOffset);
      const rankingIndex = rankingVal.findIndex((ranking) => {
        return ranking.userId === userId;
      });
      rankings.push({ date, ranking: rankingIndex });
    } else {
      rankings.push({ date, ranking: -1 });
    }
  }
  return rankings;
}

async function userMonthlySorting(userId, date, timezone, length) {
  const rankings = [];
  let monthStart = DateTime.fromISO(date, { zone: timezone }).startOf("month");
  //this prevents from displaying future ranking
  const thisMonth = DateTime.now().setZone(timezone).startOf("month");
  const timezoneOffset = Math.floor(thisMonth.offset / 60).toString();
  const minOffset = thisMonth.offset % 60;
  monthStart = monthStart.minus({ minute: minOffset });
  let diff = thisMonth.diff(monthStart, "months").toObject().months;
  while (diff < length - 1) {
    monthStart = monthStart.plus({ months: -1 });
    diff += 1;
  }
  const connection = pool.promise();
  for (let i = 0; i < length; i++) {
    const date = monthStart.plus({ months: i }).toSeconds();
    const [[monthlyRanking]] = await connection.query(
      `SELECT ranking FROM monthlyRanking WHERE date = ?`,
      [date]
    );
    if (monthlyRanking) {
      const parsedRanking = JSON.parse(monthlyRanking.ranking);
      const rankingIndex = parsedRanking.findIndex((info) => {
        return info.u === userId;
      });
      rankings.push({ date, ranking: rankingIndex });
    } else if (date === thisMonth.toSeconds()) {
      const users = await getActiveUsers("week");
      const rankingVal = await thisMonthSorting(users, timezoneOffset);
      const rankingIndex = rankingVal.findIndex((ranking) => {
        return ranking.userId === userId;
      });
      rankings.push({ date, ranking: rankingIndex });
    } else {
      rankings.push({ date, ranking: -1 });
    }
  }
  return rankings;
}

async function friendsDailySorting(dateTime, length, friends, usersLength) {
  const rankings = [];
  let dateStart = dateTime.startOf("day");
  //this prevents from displaying future ranking
  let diff = DateTime.now()
    .setZone("utc")
    .startOf("day")
    .diff(dateStart, "days")
    .toObject().days;
  while (diff < length) {
    dateStart = dateStart.plus({ days: -1 });
    diff += 1;
  }
  const connection = pool.promise();
  for (let i = 0; i < length; i++) {
    const date = dateStart.plus({ days: i }).toSeconds();
    const [[dailyRanking]] = await connection.query(
      `SELECT ranking FROM dailyRanking WHERE date = ?`,
      [date]
    );
    if (dailyRanking) {
      const parsedRanking = JSON.parse(dailyRanking.ranking);
      const ranking = await Promise.all(
        friends.map(async (userId) => {
          const rankingIndex = parsedRanking.findIndex((info) => {
            return info.u === userId;
          });
          const userInfo = await userCache(userId);
          return {
            userInfo,
            ranking: rankingIndex === -1 ? usersLength : rankingIndex,
          };
        })
      );
      ranking.sort((a, b) => b.ranking - a.ranking);
      rankings.push({ date, ranking });
    } else {
      const ranking = await Promise.all(
        friends.map(async (userId) => {
          const userInfo = await userCache(userId);
          return { userInfo, ranking: usersLength };
        })
      );
      rankings.push({ date, ranking });
    }
  }
  return rankings;
}

async function friendsWeeklySorting(dateTime, length, friends, usersLength) {
  const rankings = [];
  let weekStart = dateTime.startOf("week");
  //this prevents from displaying future ranking
  let diff = DateTime.now()
    .setZone("utc")
    .startOf("week")
    .diff(weekStart, "weeks")
    .toObject().weeks;
  while (diff < length) {
    weekStart = weekStart.plus({ weeks: -1 });
    diff += 1;
  }
  const connection = pool.promise();
  for (let i = 0; i < length; i++) {
    const date = weekStart.plus({ weeks: i }).toSeconds();
    const [[weeklyRanking]] = await connection.query(
      `SELECT ranking FROM weeklyRanking WHERE date = ?`,
      [date]
    );
    if (weeklyRanking) {
      const parsedRanking = JSON.parse(weeklyRanking.ranking);
      const ranking = await Promise.all(
        friends.map(async (userId) => {
          const rankingIndex = parsedRanking.findIndex((info) => {
            return info.u === userId;
          });
          const userInfo = await userCache(userId);
          return {
            userInfo,
            ranking: rankingIndex === -1 ? usersLength : rankingIndex,
          };
        })
      );
      ranking.sort((a, b) => b.ranking - a.ranking);
      rankings.push({ date, ranking });
    } else {
      const ranking = await Promise.all(
        friends.map(async (userId) => {
          const userInfo = await userCache(userId);
          return { userInfo, ranking: usersLength };
        })
      );
      rankings.push({ date, ranking });
    }
  }
  return rankings;
}

async function friendsMonthlySorting(dateTime, length, friends, usersLength) {
  const rankings = [];
  let monthStart = dateTime.startOf("month");
  //this prevents from displaying future ranking
  let diff = DateTime.now()
    .setZone("utc")
    .startOf("month")
    .diff(monthStart, "months")
    .toObject().months;
  while (diff < length) {
    monthStart = monthStart.plus({ months: -1 });
    diff += 1;
  }
  const connection = pool.promise();
  for (let i = 0; i < length; i++) {
    const date = monthStart.plus({ months: i }).toSeconds();
    const [[monthlyRanking]] = await connection.query(
      `SELECT ranking FROM monthlyRanking WHERE date = ?`,
      [date]
    );
    if (monthlyRanking) {
      const parsedRanking = JSON.parse(monthlyRanking.ranking);
      const ranking = await Promise.all(
        friends.map(async (userId) => {
          const rankingIndex = parsedRanking.findIndex((info) => {
            return info.u === userId;
          });
          const userInfo = await userCache(userId);
          return {
            userInfo,
            ranking: rankingIndex === -1 ? usersLength : rankingIndex,
          };
        })
      );
      ranking.sort((a, b) => b.ranking - a.ranking);
      rankings.push({ date, ranking });
    } else {
      const ranking = await Promise.all(
        friends.map(async (userId) => {
          const userInfo = await userCache(userId);
          return { userInfo, ranking: usersLength };
        })
      );
      rankings.push({ date, ranking });
    }
  }
  return rankings;
}

/* Router.get('/friends', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const { date } = req.query;
      const userId = req.session.user_id;
      const userInfo = await userCache(userId);
      if (!userInfo) return res.send({ success: false, reason: 'no user found' });
      let { friends } = userInfo;
      friends = friends === "" ? [] : friends.split(',');
      const connection = pool.promise();
      let [[usersLength]] = await connection.query(`SELECT COUNT(*) FROM users`);
      const dateTime = DateTime.fromISO(date, { zone: 'utc' });
      usersLength = Object.values(usersLength)[0];
      const dailyRankings = await friendsDailySorting(dateTime, 1, [userId, ...friends], friends.length);
      const weeklyRankings = await friendsWeeklySorting(dateTime, 1, [userId, ...friends], friends.length);
      const monthlyRankings = await friendsMonthlySorting(dateTime, 1, [userId, ...friends], friends.length);
      res.send({ success: true, dailyRankings, weeklyRankings, monthlyRankings });
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    }
  }));
}); */

Router.get("/friends", async (req, res) => {
  autoSignin(
    req,
    res,
    async (userId, timezone) => {
      try {
        const userInfo = await userCache(userId);
        if (!userInfo)
          return res.send({ success: false, reason: "no user found" });
        const { friends } = userInfo;

        let today = DateTime.now().setZone(timezone).startOf("day");
        const timezoneOffset = Math.floor(today.offset / 60).toString();

        userInfo.dayTotal = await redisClient.zScore(
          `user:${userId}:dayTotal`,
          timezoneOffset
        );
        userInfo.weekTotal = await redisClient.zScore(
          `user:${userId}:weekTotal`,
          timezoneOffset
        );
        userInfo.monthTotal = await redisClient.zScore(
          `user:${userId}:monthTotal`,
          timezoneOffset
        );

        //remove nulls
        userInfo.dayTotal = userInfo.dayTotal === null ? 0 : userInfo.dayTotal;
        userInfo.weekTotal =
          userInfo.weekTotal === null
            ? userInfo.dayTotal
            : userInfo.weekTotal + userInfo.dayTotal;
        userInfo.monthTotal =
          userInfo.monthTotal === null
            ? userInfo.dayTotal
            : userInfo.monthTotal + userInfo.dayTotal;
        const friendsData = [userInfo];
        await Promise.all(
          friends.map(async (friend) => {
            friend = await userCache(friend);
            if (friend) {
              const userId = friend.user_id;
              friend.dayTotal = await redisClient.zScore(
                `user:${userId}:dayTotal`,
                timezoneOffset
              );
              friend.weekTotal = await redisClient.zScore(
                `user:${userId}:weekTotal`,
                timezoneOffset
              );
              friend.monthTotal = await redisClient.zScore(
                `user:${userId}:monthTotal`,
                timezoneOffset
              );

              //remove nulls
              friend.dayTotal = friend.dayTotal === null ? 0 : friend.dayTotal;
              friend.weekTotal =
                friend.weekTotal === null
                  ? friend.dayTotal
                  : friend.weekTotal + friend.dayTotal;
              friend.monthTotal =
                friend.monthTotal === null
                  ? friend.dayTotal
                  : friend.monthTotal + friend.dayTotal;
              friendsData.push(friend);
            }
            return null;
          })
        );

        const day = [...friendsData].sort((a, b) => b.dayTotal - a.dayTotal);
        const week = [...friendsData].sort((a, b) => b.weekTotal - a.weekTotal);
        const month = [...friendsData].sort(
          (a, b) => b.monthTotal - a.monthTotal
        );

        const minOffset = today.offset % 60;
        today = today.plus({ minute: minOffset });

        const data = [];
        const dates = [];
        const connection = pool.promise();

        for (let i = 1; i < 6; i++) {
          today = today.minus({ day: 1 });
          dates.push(today.toSeconds());
        }

        const [rankings] = await connection.query(
          `SELECT date, ranking FROM dailyRanking WHERE date IN(?)`,
          [dates]
        );

        //today study times
        for (let i = 1; i < 6; i++) {
          let rankingInfo = rankings.find(
            (ranking) => ranking.date === today.toSeconds()
          );

          data.push({ date: today.toFormat("M/d"), friends: {} });
          today = today.plus({ day: 1 });

          if (!rankingInfo) {
            friendsData.map((friend) => {
              data[data.length - 1].friends[friend.user_id] = {
                t: 0,
                ...friend,
              };
            });
            continue;
          }

          rankingInfo = JSON.parse(rankingInfo.ranking);
          friendsData.map((friend) => {
            const rankedInfo = rankingInfo.find(
              (ranking) => ranking.u === friend.user_id
            );
            if (!rankedInfo) {
              data[data.length - 1].friends[friend.user_id] = {
                t: 0,
                ...friend,
              };
            } else {
              data[data.length - 1].friends[friend.user_id] = {
                t: rankedInfo.t,
                ...friend,
              };
            }
          });
        }

        //today study times
        data.push({ date: today.toFormat("M/d"), friends: {} });

        friendsData.map((friend) => {
          data[data.length - 1].friends[friend.user_id] = {
            t: friend.dayTotal,
            ...friend,
          };
        });

        res.send({ success: true, day, week, month, dayTrend: data });
      } catch (error) {
        console.log(error);
        res.send({ success: false, reason: "An Error Occured" });
      }
    },
    undefined,
    true
  );
});

Router.get("/today", async (req, res) => {
  try {
    const { timezone } = req.query;
    const today = DateTime.now().setZone(timezone);
    const timezoneOffset = Math.floor(today.offset / 60).toString();

    const users = await getActiveUsers("week");
    let rankings = await todaySorting(users, timezoneOffset);
    rankings = await Promise.all(
      rankings.map(async (ranking) => {
        const user = await userCache(ranking.userId);
        return { ...ranking, user };
      })
    );

    res.send({ success: true, rankings });
  } catch (err) {
    console.log(err);
    res.send({ success: false, reason: "err" });
  }
});

module.exports = Router;
