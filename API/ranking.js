const express = require("express");
const Router = express.Router();
const pool = require('../model/pool');
const redisClient = require("../model/redis");
const NodeCache = require('node-cache');
const cache = new NodeCache();
const { DateTime } = require('luxon');
const { subjectsCache } = require("../services/redisLoader");
const { promises } = require("fs");

/* Router.post("/", async (req, res) => {
  const connection = pool.promise();
  const users = await connection.query(`SELECT datum_point, daily, weekly, monthly, name, user_id from users`);

  const dailyRanking = [];
  const weeklyRanking = [];
  const monthlyRanking = [];

  const timeZone = req.session.userInfo.timeZone;
  const userDateTime = DateTime.now().setZone(timeZone);
  const twelveAmDateTime = userDateTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  const unixTimestamp = twelveAmDateTime.toMillis();
  const cachedDate = new Date(unixTimestamp);  

  if(twelveAmDateTime.minute < 30) {
    cachedDate.setMinutes(0);
  } else {
    cachedDate.setMinutes(30);
  }
  const cachedData = cache.get(cachedDate.getTime());
  if (cachedData) {
    return res.send(cachedData);
  }
  
  const date = DateTime.now().setZone(timeZone).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

  const usersInfo = users.map(user => {
    const datum_point = DateTime.fromMillis(user.datum_point * 1000).setZone(timeZone).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    const daily = JSON.parse(user.daily);
    const weekly = JSON.parse(user.weekly);
    const monthly = JSON.parse(user.monthly);

    let missingDay = (date.toMillis() - datum_point.toMillis()) / (1000 * 60 * 60 * 24) - daily.length + 1;

    let dateWeekStart = date.toMillis() - date.toMillis() * 24 * 60 * 60 * 1000;
    const day = datum_point.weekday == 7 ? 0 : datum_point.weekday;
    let datum_pointWeekStart = datum_point.toMillis() - day * 24 * 60 * 60 * 1000;
    let missingWeek = (dateWeekStart - datum_pointWeekStart) / (1000 * 60 * 60 * 24 * 7) - weekly.length + 1;
    let missingMonth = 0 - monthly.length + 1;
    let datumYear = datum_point.year;
    let datumMonth = datum_point.month;
    //let datumMonthStart = new Date(datumYear, datumMonth, 1).setHours(0, 0, 0, 0);
    let datumMonthStart = DateTime.local(datumYear, datumMonth, 1, {zone: timeZone}).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    //const dateMonthStart = new Date(date.getFullYear(), date.getMonth(), 1).setHours(0, 0, 0, 0);
    const dateMonthStart = DateTime.local(date.year, date.month, 1, {zone: timeZone}).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    while(datumMonthStart < dateMonthStart) {
      datumMonth += 1;
      if(datumMonth >= 11) {
        datumMonth = 0;
        datumYear += 1;
      }
      missingMonth += 1;
      //datumMonthStart = new Date(datumYear, datumMonth, 1).setHours(0, 0, 0, 0);
      datumMonthStart = DateTime.local(datumYear, datumMonth, 1, {zone: timeZone}).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    }
    for(let i = 0; i < missingDay; i++) {
      daily.push(0);
    }

    for(let i = 0; i < missingWeek; i++) {
      weekly.push(0);
    }

    for(let i = 0; i < missingMonth; i++) {
      monthly.push(0);
    }

    daily.reverse();
    weekly.reverse();
    monthly.reverse();

    daily.map((day, index) => {
      if(!dailyRanking[index]) {
        dailyRanking.push([]);
      }
      dailyRanking[index].push({name: user.name, user_id: user.user_id, day: day})
    })

    weekly.map((week, index) => {
      if(!weeklyRanking[index]) {
        weeklyRanking.push([]);
      }
      weeklyRanking[index].push({name: user.name, user_id: user.user_id, week: week})
    })

    monthly.map((month, index) => {
      if(!monthlyRanking[index]) {
        monthlyRanking.push([]);
      }
      monthlyRanking[index].push({name: user.name, user_id: user.user_id, month: month})
    })

    return {userId: user.user_id, name: user.name, daily: daily, weekly: weekly, monthly: monthly, datumPoint: user.datum_point}
  })


  //sort ranking
  dailyRanking.map(dayRanking => {
    dayRanking.sort((a, b) => {
      return b.day - a.day;
    })
  })

  weeklyRanking.map(weekRanking => {
    weekRanking.sort((a, b) => {
      return b.week - a.week;
    })
  })

  monthlyRanking.map(monthRanking => {
    monthRanking.sort((a, b) => {
      return b.month - a.month;
    })
  })

  const result = {success: true, dailyRanking: dailyRanking, weeklyRanking: weeklyRanking, monthlyRanking: monthlyRanking, usersInfo: usersInfo};
  res.send(result);
  console.log(result)
  cache.set(cachedDate.getTime(), result);
  pool.releaseConnection(connection);
})
 */

Router.post('/sort', async (req, res) => {
  const { startTime, stopTime } = req.body;
  try {
    const connection = pool.promise();
    const [users] = await connection.query(`SELECT name, user_id from users`);
    const subjectPromises = users.map(async (user) => {
      const {user_id} = user;
      const [subjects] = await connection.query(`SELECT datum_point, timeline, id FROM subjects WHERE user_id = ?`, [user_id]);
      user.total = 0;
      user.focus = 0;
      const timelinePromises = subjects.map(async({ timeline, datum_point, id }) => {
        let timelineSum = 0;
        const prevTimeline = timeline === "" ? [[]] : JSON.parse(timeline.replace(/^/, "[").replace(/$/, "]")); //wrapping the string with "[]"
        const todayTimeline = (await redisClient.lRange(`user:${user_id}:subject:${id}`, 0, -1)).map(JSON.parse);
        const totalTimeline  = prevTimeline.concat(todayTimeline);
        //console.log(totalTimeline, user_id, id);
        totalTimeline.find(([start, duration]) => {
          const startUnix = datum_point + start + 0;
          const stopUnix = startUnix + duration;
          timelineSum += start + duration;
          if (startTime / 1000 <= startUnix && stopUnix <= stopTime / 1000) {
            user.total += duration;
            user.focus = Math.max(user.focus, duration);
          } else if (startTime <= stopUnix) {
            //this is the case when time range is between the starttime and stop time
            //console.log(stopUnix, startUnix, timelineSum)
            //user.total += stopUnix - startTime;
          } else if (startTime <= startUnix) {
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

const DAYTOSEC = 60 * 60 * 24;

/** get ranking change of user for each period */
Router.get('/user', async (req, res) => {
  try {
    const {userId, date, mode} = req.query;
    const dateTime = DateTime.fromISO(date, {zone: 'utc'});
    if (!userId) {
      return res.send({success: false, reason: 'userid required'})
    }
    const connection = pool.promise();
    const rankings = [];
    if (mode.toLowerCase === 'day' || mode === 'daily') {
      const date = dateTime.toSeconds();
      const [[dailyRanking]] = await connection.query(`SELECT ranking FROM dailyRanking WHERE date = ?`, [date]);
      if (dailyRanking) {
        const parsedRanking = JSON.parse(dailyRanking.ranking);
        const rankingIndex = parsedRanking.findIndex(info => {
          return info.u === userId;
        })
        rankings.push({date, ranking: rankingIndex});
      } else {
        rankings.push({date, ranking: -1});
      };
    } else if (mode === 'week' || mode === 'weekly') {
      const weekStart = dateTime.startOf('week').toSeconds();
      for(let i = 0; i < 7; i++) {
        const date = weekStart + DAYTOSEC * i * 7;
        const [[weeklyRanking]] = await connection.query(`SELECT ranking FROM weeklyRanking WHERE date = ?`, [date]);
        if (weeklyRanking) {
          const parsedRanking = JSON.parse(weeklyRanking.ranking);
          const rankingIndex = parsedRanking.findIndex(info => {
            return info.u === userId;
          })
          rankings.push({date, ranking: rankingIndex});
        } else {
          rankings.push({date, ranking: -1});
        };
      };
    } else {
      const monthLength = dateTime.daysInMonth;
      const monthStart = dateTime.startOf('month');
      for(let i = 0; i < monthLength; i++) {
        const date = monthStart.set({month: monthStart.month + i});
        const [[monthlyRanking]] = await connection.query(`SELECT ranking FROM monthlyRanking WHERE date = ?`, [date]);
        if (monthlyRanking) {
          const parsedRanking = JSON.parse(monthlyRanking);
          const rankingIndex = parsedRanking.findIndex(info => {
            return info.u === userId;
          })
          rankings.push({date, ranking: rankingIndex});
        } else {
          rankings.push({date, ranking: -1});
        };
      };
    };
    res.send({success: true, rankings});
  } catch (err) {
    console.log(err);
    res.send({success: false, reason: 'err'})
  };
});

module.exports = Router;