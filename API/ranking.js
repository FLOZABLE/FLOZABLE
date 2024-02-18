const express = require("express");
const Router = express.Router();
const pool = require('../model/pool');
const redisClient = require("../model/redis");
const NodeCache = require('node-cache');
const cache = new NodeCache();
const { DateTime } = require('luxon');
const { subjectsCache, userCache, usersCache } = require("../services/redisLoader");
const { promises } = require("fs");
const { autoSignin } = require("../tool");
const { validateInteger, validateStrictString, validateLength, validateISO, validateTimeZone } = require("../validate");


Router.get('/sort', async (req, res) => {
  const {mode, date, timezone} = req.query;

  const dateTime = DateTime.fromISO(date, {zone: timezone});
  const today = DateTime.now().setZone(timezone);
  const timezoneOffset = Math.floor(dateTime.offset / 60).toString();

  console.log(dateTime.toSeconds(), dateTime.get("hour"));
  let rankings = [];
  if (mode === "Daily") {

    //use redis value when its today
    if (dateTime.hasSame(today, "day")) {
      console.log('today')
      //today
      const users = await redisClient.sMembers('allMembers');
      rankings = await todaySorting(users, timezoneOffset);
      rankings = await Promise.all(rankings.map(async(ranking) => {
        const user = await userCache(ranking.userId);
        return {...ranking, ...user}
      }))
    } else {
      //get ranking from database if its not today;
      const connection = pool.promise();
      const [[dailyRanking]] = await connection.query(`SELECT ranking FROM dailyRanking WHERE date = ?`, [dateTime.toSeconds()]);
      if (dailyRanking) {
        rankings = JSON.parse(dailyRanking.ranking);
        rankings = await Promise.all(rankings.map(async(ranking) => {
          const user = await userCache(ranking.u);
          return {...ranking, ...user}
        }))
      } 
    }
  } else if (mode === "Weekly") {

    //use redis value when its same week
    if (today.hasSame(dateTime, "week")) {
      const users = await redisClient.sMembers('allMembers');
      rankings = await thisWeekSorting(users, timezoneOffset);
      rankings = await Promise.all(rankings.map(async(ranking) => {
        const user = await userCache(ranking.userId);
        return {...ranking, ...user}
      }));
    } else {
      //get ranking from database if its not today;
      const connection = pool.promise();
      const [[dailyRanking]] = await connection.query(`SELECT ranking FROM weeklyRanking WHERE date = ?`, [dateTime.toSeconds()]);
      if (dailyRanking) {
        rankings = JSON.parse(dailyRanking.ranking);
        rankings = await Promise.all(rankings.map(async(ranking) => {
          const user = await userCache(ranking.u);
          return {...ranking, ...user}
        }))
      } 
    }
  } else {
    //month

    //use redis value when its same month
    if (today.hasSame(dateTime, "month")) {
      const users = await redisClient.sMembers('allMembers');

      rankings = await thisMonthSorting(users, timezoneOffset);
      rankings = await Promise.all(rankings.map(async(ranking) => {
        const user = await userCache(ranking.userId);
        return {...ranking, ...user}
      }));
    } else {
      //get ranking from database if its not today;
      const connection = pool.promise();
      const [[dailyRanking]] = await connection.query(`SELECT ranking FROM monthlyRanking WHERE date = ?`, [dateTime.toSeconds()]);
      if (dailyRanking) {
        rankings = JSON.parse(dailyRanking.ranking);
        rankings = await Promise.all(rankings.map(async(ranking) => {
          const user = await userCache(ranking.u);
          return {...ranking, ...user}
        }))
      } 
    }
  };

  res.send({ success: true, data: rankings })
});

async function todaySorting (users, timezoneOffset) {
  const filteredUsers = [];
  await Promise.all(users.map(async (userId) => {
    const todayTotal = await redisClient.zScore(`user:${userId}:dayTotal`, timezoneOffset);
    if (todayTotal) {
      filteredUsers.push({userId, t: todayTotal});
    };
  }));

  return filteredUsers.sort((a, b) => b.t - a.t);
};

async function thisWeekSorting (users, timezoneOffset) {
  const filteredUsers = [];

  await Promise.all(users.map(async (userId) => {
    const weekTotal = await redisClient.zScore(`user:${userId}:weekTotal`, timezoneOffset.toString());
    const todayTotal = await redisClient.zScore(`user:${userId}:dayTotal`, timezoneOffset.toString());
    if (weekTotal || todayTotal) {
      const t = weekTotal ? weekTotal : 0 + todayTotal ? todayTotal : 0;
      filteredUsers.push({userId, t});
    };
  }));

  return filteredUsers.sort((a, b) => b.t - a.t);
};

async function thisMonthSorting (users, timezoneOffset) {
  const filteredUsers = [];

  await Promise.all(users.map(async (userId) => {
    const monthTotal = await redisClient.zScore(`user:${userId}:monthTotal`, timezoneOffset.toString());
    const todayTotal = await redisClient.zScore(`user:${userId}:dayTotal`, timezoneOffset.toString());
    if (monthTotal || todayTotal) {
      const t = monthTotal ? monthTotal : 0 + todayTotal ? todayTotal : 0;
      filteredUsers.push({userId, t});
    };
  }));

  return filteredUsers.sort((a, b) => b.t - a.t);
};

Router.post('/sort', async (req, res) => {
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
});

const LENGTH = 7;
/** get ranking change of user for each period */
Router.get('/user', async (req, res) => {
  try {
    const { userId, date, mode, timezone } = req.query;

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

    const isValidTimezone = validateTimeZone(timezone);

    if (!isValidTimezone.isValid) {
      return res.send({success: false, reason: isValidTimezone.reason});
    };

    if (!userId) {
      return res.send({ success: false, reason: 'userid required' })
    }

    const connection = pool.promise();
    let rankings = [];

    if (mode === 'day' || mode === 'daily') {
      rankings = await userDailySorting(userId, date, timezone, LENGTH);
    } else if (mode === 'week' || mode === 'weekly') {
      rankings = await userWeeklySorting(userId, date, timezone, LENGTH);
    } else {
      rankings = await userMonthlySorting(userId, date, timezone, LENGTH);
    };
    const [[usersLength]] = await connection.query(`SELECT COUNT(*) FROM users`);
    res.send({ success: true, rankings: { data: rankings, maxLength: Object.values(usersLength)[0] } });
  } catch (err) {
    console.log(err);
    res.send({ success: false, reason: 'err' })
  };
});
/* Router.get('/user', async (req, res) => {
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
}); */

async function userDailySorting(userId, date, timezone, length) {
  const rankings = [];
  let dateStart = DateTime.fromISO(date, { zone: timezone });
  //this prevents from displaying future ranking
  const today = DateTime.now().setZone(timezone).startOf('day');
  const timezoneOffset = Math.floor(today.offset / 60).toString();
  let diff = today.diff(dateStart, 'days').toObject().days;
  while (diff < length) {
    dateStart = dateStart.plus({ days: -1 });
    diff += 1;
  };
  const connection = pool.promise();
  for (let i = 0; i < length; i++) {
    const date = dateStart.plus({ days: i + 1 }).toSeconds();
    const [[dailyRanking]] = await connection.query(`SELECT ranking FROM dailyRanking WHERE date = ?`, [date]);
    if (dailyRanking) {
      const parsedRanking = JSON.parse(dailyRanking.ranking);
      const rankingIndex = parsedRanking.findIndex(info => {
        return info.u === userId;
      })
      rankings.push({ date, ranking: rankingIndex });
    } else if (date === today.toSeconds()) {
      const users = await redisClient.sMembers('allMembers');
      const rankingVal = await todaySorting(users, timezoneOffset);
      const rankingIndex = rankingVal.findIndex(ranking => {
        return ranking.userId === userId;
      });
      rankings.push({ date, ranking: rankingIndex });
    } else {
      rankings.push({ date, ranking: -1 });
    }
  };
  return rankings;
};

async function userWeeklySorting(userId, date, timezone, length) {
  const rankings = [];
  let weekStart =  DateTime.fromISO(date, { zone: timezone }).startOf("week");
  //this prevents from displaying future ranking
  const thisWeek = DateTime.now().setZone(timezone).startOf('week');
  const timezoneOffset = Math.floor(thisWeek.offset / 60).toString();
  let diff = thisWeek.diff(weekStart, 'weeks').toObject().weeks;
  while (diff < length) {
    weekStart = weekStart.plus({ weeks: -1 });
    diff += 1;
  };
  const connection = pool.promise();
  for (let i = 0; i < length; i++) {
    const date = weekStart.plus({ weeks: i + 1 }).toSeconds();
    const [[weeklyRanking]] = await connection.query(`SELECT ranking FROM weeklyRanking WHERE date = ?`, [date]);
    if (weeklyRanking) {
      const parsedRanking = JSON.parse(weeklyRanking.ranking);
      const rankingIndex = parsedRanking.findIndex(info => {
        return info.u === userId;
      })
      rankings.push({ date, ranking: rankingIndex });
    } else if (date === thisWeek.toSeconds()) {
      const users = await redisClient.sMembers('allMembers');
      const rankingVal = await thisWeekSorting(users, timezoneOffset);
      const rankingIndex = rankingVal.findIndex(ranking => {
        return ranking.userId === userId;
      });
      rankings.push({ date, ranking: rankingIndex });
    } else {
      rankings.push({ date, ranking: -1 });
    };
  };
  return rankings;
};

async function userMonthlySorting(userId, date, timezone, length) {
  const rankings = [];
  let monthStart = DateTime.fromISO(date, { zone: timezone }).startOf('month');
  //this prevents from displaying future ranking
  const thisMonth = DateTime.now().setZone(timezone).startOf('month');
  const timezoneOffset = Math.floor(thisMonth.offset / 60).toString();
  let diff = thisMonth.diff(monthStart, 'months').toObject().months;
  while (diff < length) {
    monthStart = monthStart.plus({ months: -1 });
    diff += 1;
  };
  const connection = pool.promise();
  for (let i = 0; i < length; i++) {
    const date = monthStart.plus({ months: i + 1 }).toSeconds();
    const [[monthlyRanking]] = await connection.query(`SELECT ranking FROM monthlyRanking WHERE date = ?`, [date]);
    if (monthlyRanking) {
      const parsedRanking = JSON.parse(monthlyRanking.ranking);
      const rankingIndex = parsedRanking.findIndex(info => {
        return info.u === userId;
      })
      rankings.push({ date, ranking: rankingIndex });
    } else if (date === thisMonth.toSeconds()) {
      const users = await redisClient.sMembers('allMembers');
      const rankingVal = await thisMonthSorting(users, timezoneOffset);
      const rankingIndex = rankingVal.findIndex(ranking => {
        return ranking.userId === userId;
      });
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
  autoSignin(req, res, (async (userId, timezone) => {
    try {
      const userInfo = await userCache(userId);
      if (!userInfo) return res.send({ success: false, reason: 'no user found' });
      let { friends } = userInfo;
      friends = friends === "" ? [] : friends.split(',');

      const today = DateTime.now().setZone(timezone);
      const timezoneOffset = Math.floor(today.offset / 60).toString();

      userInfo.dayTotal = await redisClient.zScore(`user:${userId}:dayTotal`, timezoneOffset);
      userInfo.weekTotal = await redisClient.zScore(`user:${userId}:weekTotal`, timezoneOffset);
      userInfo.monthTotal = await redisClient.zScore(`user:${userId}:monthTotal`, timezoneOffset);

      //remove nulls
      userInfo.dayTotal = userInfo.dayTotal === null ? 0 : userInfo.dayTotal;
      userInfo.weekTotal = userInfo.weekTotal === null ? userInfo.dayTotal : userInfo.weekTotal + userInfo.dayTotal;
      userInfo.monthTotal = userInfo.monthTotal === null ? userInfo.dayTotal : userInfo.monthTotal + userInfo.dayTotal;
      const friendsData = [userInfo];
      await Promise.all(friends.map(async (friend) => {
        friend = await userCache(friend);
        if (friend) {
          const userId = friend.user_id;
          friend.dayTotal = await redisClient.zScore(`user:${userId}:dayTotal`, timezoneOffset);
          friend.weekTotal = await redisClient.zScore(`user:${userId}:weekTotal`, timezoneOffset);
          friend.monthTotal = await redisClient.zScore(`user:${userId}:monthTotal`, timezoneOffset);
    
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
    const {timezone} = req.query;
    const today = DateTime.now().setZone(timezone);
    const timezoneOffset = Math.floor(today.offset / 60).toString();

    const users = await redisClient.sMembers('allMembers');
    let rankings = await todaySorting(users, timezoneOffset);
    rankings = await Promise.all(rankings.map(async(ranking) => {
      const user = await userCache(ranking.userId);
      return {...ranking, user}
    }))

    res.send({success: true, rankings});
  } catch (err) {
    console.log(err);
    res.send({ success: false, reason: 'err' })
  };
});

module.exports = Router;