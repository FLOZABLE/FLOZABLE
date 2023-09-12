const express = require("express");
const Router = express.Router();
const pool = require('../../model/pool');
const NodeCache = require('node-cache');
const cache = new NodeCache();
const {DateTime} = require('luxon');

Router.post("/", async (req, res) => {
  const connection = pool.promise();
  try {
    const users = await connection.query(`SELECT datum_point, daily, weekly, monthly, name, user_id from users`);
  
    const dailyRanking = [];
    const weeklyRanking = [];
    const monthlyRanking = [];
  
    //const timeZone = req.session.userInfo.timeZone;
    const timeZone = 'America/Los_Angeles';
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
  
      let dateWeekStart = date.startOf('week').toMillis();
      const day = datum_point.weekday == 7 ? 0 : datum_point.weekday;
      let datum_pointWeekStart = datum_point.startOf('week').toMillis();
      let missingWeek = (dateWeekStart - datum_pointWeekStart) / (1000 * 60 * 60 * 24 * 7) - weekly.length + 1;
      let missingMonth = 0 - monthly.length + 1;
      let datumYear = datum_point.year;
      let datumMonth = datum_point.month;
      let datumMonthStart = DateTime.local(datumYear, datumMonth, 1, {zone: timeZone}).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      const dateMonthStart = DateTime.local(date.year, date.month, 1, {zone: timeZone}).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      while(datumMonthStart < dateMonthStart) {
        datumMonth += 1;
        if(datumMonth >= 11) {
          datumMonth = 0;
          datumYear += 1;
        }
        missingMonth += 1;
        datumMonthStart = DateTime.local(datumYear, datumMonth, 1, {zone: timeZone}).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      };

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
    });
  
  
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
  
    const result = {success: true, ranking: {dailyRanking: dailyRanking, weeklyRanking: weeklyRanking, monthlyRanking: monthlyRanking, usersInfo: usersInfo}};
    res.send(result);
    cache.set(cachedDate.getTime(), result);
  } catch (error) {
    console.log(error);
    res.send({success: false, reason: 'error'});
  } finally {
    pool.releaseConnection(connection);
  };
});

module.exports = Router;