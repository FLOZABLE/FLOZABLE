const express = require("express");
const Router = express.Router();
const pool = require('../model/pool');
const redisClient = require("../model/redis");
const NodeCache = require('node-cache');
const cache = new NodeCache();
const { DateTime } = require('luxon');
const { subjectsCache, userCache } = require("../services/redisLoader");
const { promises } = require("fs");
const { autoSignin } = require("../tool");
const { validateInteger, validateStrictString, validateLength, validateISO } = require("../validate");


Router.get('/sort', async (req, res) => {
  const {mode, date, timezone} = req.query;
  console.log(mode, date, timezone);
  res.send({mode, date, timezone});

  const dateTime = DateTime.fromISO(date, {zone: timezone});
  const today = DateTime.now().setZone(timezone);
  console.log(today.get("hour"));
  let rankings = [];
  if (mode === "Daily") {
    if (today.hasSame(dateTime, "day")) {

    } else {
      const [[dailyRanking]] = await connection.query(`SELECT ranking FROM dailyRanking WHERE date = ?`, [date]);
      if (dailyRanking) {
        const parsedRanking = JSON.parse(dailyRanking.ranking);
        const rankingIndex = parsedRanking.findIndex(info => {
          return info.u === userId;
        })
        rankings.push({ date, ranking: rankingIndex });
      } 
    }
  } else if (mode === "Weekly") {
    if (today.hasSame(dateTime, "week")) {

    }
  } else {
    if (today.hasSame(dateTime, "month")) {

    }
  }
});


/* 
Router.get('/sort', async (req, res) => {
  const { startTime, stopTime } = req.body;

  const maxStartTime = DateTime.now().plus({year: 1}).millisecond;
  const maxStopTime = DateTime.now().minus({year: 1}).millisecond;

  const isValidStartTime = validateInteger(startTime, "start time", maxStartTime, maxStopTime);

  if (!isValidStartTime.isValid) {
    return res.send({success: false, reason: isValidStartTime.reason});
  };

  const isValidStopTime = validateInteger(stopTime, "stop time", startTime, startTime + 1000 * 60 * 60 * 24 * 50);

  if (!isValidStopTime.isValid) {
    return res.send({success: false, reason: isValidStopTime.reason});
  };


  //console.log(startTime, stopTime);
  try {
    const connection = pool.promise();
    const [users] = await connection.query(`SELECT name, user_id, timezone from users`);
    const subjectPromises = users.map(async (user) => {
      const { user_id } = user;
      const [subjects] = await connection.query(`SELECT datum_point, timeline, id FROM subjects WHERE user_id = ?`, [user_id]);
      user.total = 0;
      user.focus = 0;
      const timelinePromises = subjects.map(async ({ timeline, datum_point, id }) => {
        let timelineSum = 0;
        const prevTimeline = timeline === "" ? [[]] : JSON.parse(timeline.replace(/^/, "[").replace(/$/, "]")); //wrapping the string with "[]"
        const todayTimeline = (await redisClient.lRange(`user:${user_id}:subject:${id}`, 0, -1)).map(JSON.parse);
        const totalTimeline = prevTimeline.concat(todayTimeline);
        totalTimeline.find(([start, duration]) => {
          const startUnix = datum_point + start + timelineSum;
          const stopUnix = startUnix + duration;
          timelineSum += start + duration;
          if (startTime / 1000 <= startUnix && stopUnix <= stopTime / 1000) {
            user.total += duration;
            user.focus = Math.max(user.focus, duration);
          } else if (startTime / 1000 <= stopUnix) {
            //this is the case when time range is between the starttime and stop time
            //console.log(stopUnix, startUnix, timelineSum)
            //user.total += stopUnix - startTime;
          } else if (startTime / 1000 <= startUnix) {
            //stop running the loop
            return true;
          };
        });
      });
      await Promise.all(timelinePromises);
    });
    await Promise.all(subjectPromises);

    //sort
    await users.sort((a, b) => b.total - a.total);
    res.send({ success: true, data: users })
  } catch (err) {
    console.log(err);
    res.send({ success: false });
  }
}); */

const LENGTH = 7;
/** get ranking change of user for each period */
Router.get('/user', async (req, res) => {
  try {
    const { userId, date, mode } = req.query;

    const isValidUserId = validateStrictString(userId, 'user id', 10);

    if (!isValidUserId.isValid) {
      return res.send({ success: false, reason: isValidUserId.reason });
    };
    
    const isValidDate = validateISO(date, 'date');

    if (!isValidDate.isValid) {
      return res.send({ success: false, reason: isValidDate.reason });
    };

    const isValidMode = validateStrictString(mode, 'mode', 10);

    if (!isValidMode.isValid) {
      return res.send({ success: false, reason: isValidMode.reason });
    };

    const dateTime = DateTime.fromISO(date, { zone: 'utc' });
    if (!userId) {
      return res.send({ success: false, reason: 'userid required' })
    }
    const connection = pool.promise();
    let rankings = [];
    const [[usersLength]] = await connection.query(`SELECT COUNT(*) FROM users`);

    if (mode === 'day' || mode === 'daily') {
      rankings = await userDailySorting(dateTime, LENGTH, userId);
    } else if (mode === 'week' || mode === 'weekly') {
      rankings = await userWeeklySorting(dateTime, LENGTH, userId);
    } else {
      rankings = await userMonthlySorting(dateTime, LENGTH, userId);
    };
    res.send({ success: true, rankings: { data: rankings, maxLength: Object.values(usersLength)[0] } });
  } catch (err) {
    console.log(err);
    res.send({ success: false, reason: 'err' })
  };
});

async function userDailySorting(dateTime, length, userId) {
  const rankings = [];
  let dateStart = dateTime.startOf('day');
  //this prevents from displaying future ranking
  let diff = DateTime.now().setZone('utc').startOf('day').diff(dateStart, 'days').toObject().days;
  while (diff < length) {
    dateStart = dateStart.plus({ days: -1 });
    diff += 1;
  };
  const connection = pool.promise();
  for (let i = 0; i < length; i++) {
    const date = dateStart.plus({ days: i }).toSeconds();
    const [[dailyRanking]] = await connection.query(`SELECT ranking FROM dailyRanking WHERE date = ?`, [date]);
    if (dailyRanking) {
      const parsedRanking = JSON.parse(dailyRanking.ranking);
      const rankingIndex = parsedRanking.findIndex(info => {
        return info.u === userId;
      })
      rankings.push({ date, ranking: rankingIndex });
    } else {
      rankings.push({ date, ranking: -1 });
    };
  };
  return rankings;
};

async function userDaySorting(users, userId) {
  
};

async function userWeeklySorting(dateTime, length, userId) {
  const rankings = [];
  let weekStart = dateTime.startOf('week');
  //this prevents from displaying future ranking
  let diff = DateTime.now().setZone('utc').startOf('week').diff(weekStart, 'weeks').toObject().weeks;
  while (diff < length) {
    weekStart = weekStart.plus({ weeks: -1 });
    diff += 1;
  };
  const connection = pool.promise();
  for (let i = 0; i < length; i++) {
    const date = weekStart.plus({ weeks: i }).toSeconds();
    const [[weeklyRanking]] = await connection.query(`SELECT ranking FROM weeklyRanking WHERE date = ?`, [date]);
    if (weeklyRanking) {
      const parsedRanking = JSON.parse(weeklyRanking.ranking);
      const rankingIndex = parsedRanking.findIndex(info => {
        return info.u === userId;
      })
      rankings.push({ date, ranking: rankingIndex });
    } else {
      rankings.push({ date, ranking: -1 });
    };
  };
  return rankings;
};

async function userMonthlySorting(dateTime, length, userId) {
  const rankings = [];
  let monthStart = dateTime.startOf('month');
  //this prevents from displaying future ranking
  let diff = DateTime.now().setZone('utc').startOf('month').diff(monthStart, 'months').toObject().months;
  while (diff < length) {
    monthStart = monthStart.plus({ months: -1 });
    diff += 1;
  };
  const connection = pool.promise();
  for (let i = 0; i < length; i++) {
    const date = monthStart.plus({ months: i }).toSeconds();
    const [[monthlyRanking]] = await connection.query(`SELECT ranking FROM monthlyRanking WHERE date = ?`, [date]);
    if (monthlyRanking) {
      const parsedRanking = JSON.parse(monthlyRanking.ranking);
      const rankingIndex = parsedRanking.findIndex(info => {
        return info.u === userId;
      })
      rankings.push({ date, ranking: rankingIndex });
    } else {
      rankings.push({ date, ranking: -1 });
    };
  };
  return rankings;
};


async function friendsDailySorting(dateTime, length, friends, usersLength) {
  const rankings = [];
  let dateStart = dateTime.startOf('day');
  //this prevents from displaying future ranking
  let diff = DateTime.now().setZone('utc').startOf('day').diff(dateStart, 'days').toObject().days;
  while (diff < length) {
    dateStart = dateStart.plus({ days: -1 });
    diff += 1;
  };
  const connection = pool.promise();
  for (let i = 0; i < length; i++) {
    const date = dateStart.plus({ days: i }).toSeconds();
    const [[dailyRanking]] = await connection.query(`SELECT ranking FROM dailyRanking WHERE date = ?`, [date]);
    if (dailyRanking) {
      const parsedRanking = JSON.parse(dailyRanking.ranking);
      const ranking = await Promise.all(friends.map(async (userId) => {
        const rankingIndex = parsedRanking.findIndex(info => {
          return info.u === userId;
        });
        const userInfo = await userCache(userId);
        return { userInfo, ranking: rankingIndex === -1 ? usersLength : rankingIndex };
      }));
      ranking.sort((a, b) => b.ranking - a.ranking);
      rankings.push({ date, ranking });
    } else {
      const ranking = await Promise.all(friends.map(async (userId) => {
        const userInfo = await userCache(userId);
        return { userInfo, ranking: usersLength };
      }));
      rankings.push({ date, ranking });
    };
  };
  return rankings;
};

async function friendsWeeklySorting(dateTime, length, friends, usersLength) {
  const rankings = [];
  let weekStart = dateTime.startOf('week');
  //this prevents from displaying future ranking
  let diff = DateTime.now().setZone('utc').startOf('week').diff(weekStart, 'weeks').toObject().weeks;
  while (diff < length) {
    weekStart = weekStart.plus({ weeks: -1 });
    diff += 1;
  };
  const connection = pool.promise();
  for (let i = 0; i < length; i++) {
    const date = weekStart.plus({ weeks: i }).toSeconds();
    const [[weeklyRanking]] = await connection.query(`SELECT ranking FROM weeklyRanking WHERE date = ?`, [date]);
    if (weeklyRanking) {
      const parsedRanking = JSON.parse(weeklyRanking.ranking);
      const ranking = await Promise.all(friends.map(async (userId) => {
        const rankingIndex = parsedRanking.findIndex(info => {
          return info.u === userId;
        });
        const userInfo = await userCache(userId);
        return { userInfo, ranking: rankingIndex === -1 ? usersLength : rankingIndex };
      }));
      ranking.sort((a, b) => b.ranking - a.ranking);
      rankings.push({ date, ranking });
    } else {
      const ranking = await Promise.all(friends.map(async (userId) => {
        const userInfo = await userCache(userId);
        return { userInfo, ranking: usersLength };
      }));
      rankings.push({ date, ranking });
    };
  };
  return rankings;
};

async function friendsMonthlySorting(dateTime, length, friends, usersLength) {
  const rankings = [];
  let monthStart = dateTime.startOf('month');
  //this prevents from displaying future ranking
  let diff = DateTime.now().setZone('utc').startOf('month').diff(monthStart, 'months').toObject().months;
  while (diff < length) {
    monthStart = monthStart.plus({ months: -1 });
    diff += 1;
  };
  const connection = pool.promise();
  for (let i = 0; i < length; i++) {
    const date = monthStart.plus({ months: i }).toSeconds();
    const [[monthlyRanking]] = await connection.query(`SELECT ranking FROM monthlyRanking WHERE date = ?`, [date]);
    if (monthlyRanking) {
      const parsedRanking = JSON.parse(monthlyRanking.ranking);
      const ranking = await Promise.all(friends.map(async (userId) => {
        const rankingIndex = parsedRanking.findIndex(info => {
          return info.u === userId;
        });
        const userInfo = await userCache(userId);
        return { userInfo, ranking: rankingIndex === -1 ? usersLength : rankingIndex };
      }));
      ranking.sort((a, b) => b.ranking - a.ranking);
      rankings.push({ date, ranking });
    } else {
      const ranking = await Promise.all(friends.map(async (userId) => {
        const userInfo = await userCache(userId);
        return { userInfo, ranking: usersLength };
      }));
      rankings.push({ date, ranking });
    };
  };
  return rankings;
};

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

Router.get('/friends', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const userInfo = await userCache(userId);
      if (!userInfo) return res.send({ success: false, reason: 'no user found' });
      let { friends } = userInfo;
      friends = friends === "" ? [] : friends.split(',');
      userInfo.dayTotal = await redisClient.get(`user:${userId}:dayTotal`);
      userInfo.weekTotal = await redisClient.get(`user:${userId}:weekTotal`);
      userInfo.monthTotal = await redisClient.get(`user:${userId}:monthTotal`);

      //remove nulls
      userInfo.dayTotal = userInfo.dayTotal === null ? 0 : userInfo.dayTotal;
      userInfo.weekTotal = userInfo.weekTotal === null ? userInfo.dayTotal : userInfo.weekTotal + userInfo.dayTotal;
      userInfo.monthTotal = userInfo.monthTotal === null ? userInfo.dayTotal : userInfo.monthTotal + userInfo.dayTotal;
      const friendsData = [userInfo];
      await Promise.all(friends.map(async (friend) => {
        friend = await userCache(friend);
        if (friend) {
          const userId = friend.user_id;
          friend.dayTotal = await redisClient.get(`user:${userId}:dayTotal`);
          friend.weekTotal = await redisClient.get(`user:${userId}:weekTotal`);
          friend.monthTotal = await redisClient.get(`user:${userId}:monthTotal`);
    
          //remove nulls
          friend.dayTotal = friend.dayTotal === null ? 0 : friend.dayTotal;
          friend.weekTotal = friend.weekTotal === null ? friend.dayTotal : friend.weekTotal + friend.dayTotal;
          friend.monthTotal = friend.monthTotal === null ? friend.dayTotal : friend.monthTotal + friend.dayTotal;
          friendsData.push(friend);
        }
        return null;
      }));

      const todayRankings = [...friendsData].sort((a, b) => b.dayTotal - a.dayTotal);
      const thisWeekRankings = [...friendsData].sort((a, b) => b.weekTotal - a.weekTotal);
      const thisMonthRankings = [...friendsData].sort((a, b) => b.monthTotal - a.monthTotal);

      res.send({ success: true, todayRankings, thisWeekRankings, thisMonthRankings });
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    }
  }));
});

Router.get('/today', async (req, res) => {
  try {
    const users = await redisClient.sMembers("allMembers");
    const dayTotal = await Promise.all(users.map(async(userId) => {
      let total = await redisClient.get(`user:${userId}:dayTotal`);
      total = total === null ? 0 : total;
      const user = await userCache(userId);
      return {user: user, total}
    }));

    dayTotal.sort((a, b) => b.total - a.total);
    res.send({ success: true, rankings: dayTotal});
  } catch (err) {
    console.log(err);
    res.send({ success: false, reason: 'err' })
  };
});

module.exports = Router;