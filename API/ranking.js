const express = require("express");
const Router = express.Router();
const pool = require('../model/pool');
const redisClient = require("../model/redis");
const NodeCache = require('node-cache');
const cache = new NodeCache();
const { DateTime } = require('luxon');
const { subjectsCache } = require("../services/redisLoader");

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
    await Promise.all(users.map(async (user) => {
      const {user_id} = user;
      const [subjects] = await connection.query(`SELECT datum_point, timeline, id FROM subjects WHERE user_id = ?`, [user_id]);
      user.total = 0;
      user.focus = 0;
      subjects.map(async({ timeline, datum_point, id }) => {
        let timelineSum = 0;
        const prevTimeline = timeline === "" ? [[]] : JSON.parse(timeline.replace(/^/, "[").replace(/$/, "]")); //wrapping the string with "[]"
        const todayTimeline = (await redisClient.lRange(`user:${user_id}:subject:${id}`, 0, -1)).map(JSON.parse);
        const totalTimeline  = prevTimeline.concat(todayTimeline);
        //console.log(totalTimeline, user_id, id);
        totalTimeline.find(([start, duration]) => {
          const startUnix = datum_point + start + 0;
          const stopUnix = startUnix + duration;
          timelineSum += start + duration;
          if (startTime <= startUnix && stopUnix <= stopTime) {
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
    }));

    //sort
    users.sort((a, b) => b.total - a.total);
    res.send({ success: true, data: users })
  } catch (err) {
    console.log(err);
    res.send({ success: false });
  }
})

/* Router.post('/daily', async(req, res) => {
  const {startUnix, stopUnix} = req.body;
  const usersSorted = [];
  try {
    const connection = pool.promise();
    const [users] = await connection.query(`SELECT datum_point, name, user_id from users`);
    await Promise.all(users.map(async({user_id, datum_point, name}) => {
      const [subjects] = await connection.query(`SELECT id, name, datum_point, timeline FROM subjects WHERE user_id = ?`, [user_id]);
      let studySum = 0; //total time studied in seconds

      for (const subject of subjects){

        let prevTimeline = subject.timeline === "" ? [[]] :  JSON.parse(subject.timeline.replace(/^/,"[").replace(/$/,"]")); //wrapping the string with "[]"
        const todayTimeline = (await redisClient.lRange(`user:${user_id}:subject:${subject.id}`, 0, -1)).map(JSON.parse);
        subject.timeline = prevTimeline.concat(todayTimeline);

        let currentSum = subject.datum_point;
        console.log(currentSum);

        await Promise.all(subject.timeline.map( async([start, duration]) => {
          if (!!start){ //check if null (this is a temporary fix to another problem - delete later)
            let startUnix = currentSum + start; //start time in unix
            let endUnix = startUnix + duration; //end time in unix
            currentSum = endUnix;
            
            // check if current [startUnix, endUnix] lies within daily range
            if (endUnix < date || startUnix > date + 86400){
              //this means that the current timeline does not intersect with the range
            }
            else{
              //so this means it does
              let realStart = Math.max(startUnix, date);
              let realEnd = Math.min(endUnix, date + 86400);
              let realDuration = realEnd - realStart; // in seconds
              studySum += realDuration;
            }
          }
        }));
      }

      //add to list
      usersSorted.push({name: name, id: user_id, total: studySum});
    }));
    usersSorted.sort((a, b) => {a.total - b.total});
    usersSorted.reverse();
    console.log(usersSorted)
    res.send({success: true, data: usersSorted}) //return {id: __, total: __}

  } catch (err) {
    console.log(err);
  }
});
 */
Router.post('/weekly', async (req, res) => {
  const { date } = req.body; //date = unix, mode = "day"/"week"/"month";
  console.log("Weekly Date", date);
  let usersSorted = [];
  try {
    const connection = pool.promise();
    const [users] = await connection.query(`SELECT datum_point, name, user_id from users`);
    await Promise.all(users.map(async ({ user_id, datum_point, name }) => {
      const [subjects] = await connection.query(`SELECT id, name, timeline_sum, datum_point, timeline FROM subjects WHERE user_id = ?`, [user_id]);
      let studySum = 0;

      for (const subject of subjects) {

        let prevTimeline = subject.timeline === "" ? [[]] : JSON.parse(subject.timeline.replace(/^/, "[").replace(/$/, "]")); //wrapping the string with "[]"
        const todayTimeline = (await redisClient.lRange(`user:${user_id}:subject:${subject.id}`, 0, -1)).map(JSON.parse);
        subject.timeline = prevTimeline.concat(todayTimeline);

        let currentSum = subject.datum_point;

        await Promise.all(subject.timeline.map(async ([start, duration]) => {
          if (!!start) { //check if null (this is a temporary fix to another problem - delete later)
            let startUnix = currentSum + start; //start time in unix
            let endUnix = startUnix + duration; //end time in unix
            currentSum = endUnix;

            // check if current [startUnix, endUnix] lies within daily range
            if (endUnix < date || startUnix > date + 86400 * 7) { }
            else {
              //so this means it does
              let realStart = Math.max(startUnix, date);
              let realEnd = Math.min(endUnix, date + 86400 * 7);
              let realDuration = realEnd - realStart; // in seconds
              studySum += realDuration;
            }
          }
        }));
      }

      usersSorted.push({ name: name, id: user_id, total: studySum });
    }));

    usersSorted.sort((a, b) => { a.total - b.total });
    usersSorted.reverse();
    console.log('weeky', usersSorted)
    res.send({ success: true, data: usersSorted }) //return {id: __, total: __}

  } catch (err) {
    console.log(err);
  }
})

Router.post('/monthly', async (req, res) => {
  const { date, monthEnd } = req.body; //date = unix, mode = "day"/"week"/"month";
  console.log("Monthly Date", date);
  let usersSorted = [];
  try {
    const connection = pool.promise();
    const [users] = await connection.query(`SELECT datum_point, name, user_id from users`);
    await Promise.all(users.map(async ({ user_id, datum_point, name }) => {
      const [subjects] = await connection.query(`SELECT id, name, timeline_sum, datum_point, timeline FROM subjects WHERE user_id = ?`, [user_id]);
      let studySum = 0;

      for (const subject of subjects) {

        let prevTimeline = subject.timeline === "" ? [[]] : JSON.parse(subject.timeline.replace(/^/, "[").replace(/$/, "]")); //wrapping the string with "[]"
        const todayTimeline = (await redisClient.lRange(`user:${user_id}:subject:${subject.id}`, 0, -1)).map(JSON.parse);
        subject.timeline = prevTimeline.concat(todayTimeline);

        let currentSum = subject.datum_point;

        await Promise.all(subject.timeline.map(async ([start, duration]) => {
          if (!!start) { //check if null (this is a temporary fix to another problem - delete later)
            let startUnix = currentSum + start; //start time in unix
            let endUnix = startUnix + duration; //end time in unix
            currentSum = endUnix;

            // check if current [startUnix, endUnix] lies within daily range
            if (endUnix < date || startUnix > monthEnd) { }
            else {
              //so this means it does
              let realStart = Math.max(startUnix, date);
              let realEnd = Math.min(endUnix, monthEnd);
              let realDuration = realEnd - realStart; // in seconds
              studySum += realDuration;
            }
          }
        }));
      }

      usersSorted.push({ name: name, id: user_id, total: studySum });
    }));

    usersSorted.sort((a, b) => { a.total - b.total });
    usersSorted.reverse();
    res.send({ success: true, data: usersSorted }) //return {id: __, total: __}

  } catch (err) {
    console.log(err);
  }
})

module.exports = Router;