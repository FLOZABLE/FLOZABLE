const { DateTime } = require('luxon');
const schedule = require('node-schedule');
const pool = require('../model/pool');
const redisClient = require('../model/redis');

async function rankingSort() {
  /* //this means week start + month start => week value, month value should be waited by using await incrby
  if (now.weekday === 1 && now.day === 1) {
    updateWeeklyRanking();
  } */
  const now = DateTime.utc().set({hour: 0, minute: 0, millisecond: 0}).toSeconds();
  const users = await redisClient.sMembers(`allMembers`);
  await updateDailyRanking(now, users);
  if (now.weekday === 1) {
    updateWeeklyRanking(now, users);
  }
  if (now.day === 1) {
    updateMonthlyRanking(now, users);
  }
}

async function updateDailyRanking(now, users) {
  try {
    const userPromises = users.map(async(userId) => {
      const todayTotal = await redisClient.get(`user:${userId}:dayTotal`);
      //update week total, month total
      if (todayTotal) {
        await redisClient.incrBy(`user:${userId}:weekTotal`, todayTotal);
        await redisClient.incrBy(`user:${userId}:monthTotal`, todayTotal);
      };
      redisClient.del(`user:${userId}:dayTotal`);
      return {u: userId, t: todayTotal};
    });

    const userTime = await Promise.all(userPromises);
    const ranking = userTime.sort((a, b) => b.t - a.t);
    const stringlifiedRanking = JSON.stringify(ranking);
    const connection = pool.promise();
    const insertInfo = {
      date: now,
      ranking: stringlifiedRanking
    }
    connection.query(`INSERT INTO dailyRanking SET ?`, insertInfo);
  } catch (err) {
    console.log(err);
  };
};

async function updateWeeklyRanking(now, users) {
  try {
    const userPromises = users.map(async(userId) => {
      const thisWewekTotal = await redisClient.get(`user:${userId}:weekTotal`);
      redisClient.del(`user:${userId}:weekTotal`);
      return {u: userId, t: thisWewekTotal};
    });

    const userTime = await Promise.all(userPromises);
    const ranking = userTime.sort((a, b) => b.t - a.t);
    const stringlifiedRanking = JSON.stringify(ranking);
    const connection = pool.promise();
    const insertInfo = {
      date: now,
      ranking: stringlifiedRanking
    }
    connection.query(`INSERT INTO weeklyRanking SET ?`, insertInfo);
  } catch (err) {
    console.log(err);
  };
};

async function updateMonthlyRanking(now, users) {
  try {
    const userPromises = users.map(async(userId) => {
      const thisMonthTotal = await redisClient.get(`user:${userId}:monthTotal`);
      redisClient.del(`user:${userId}:monthTotal`);
      return {u: userId, t: thisMonthTotal};
    });

    const userTime = await Promise.all(userPromises);
    const ranking = userTime.sort((a, b) => b.t - a.t);
    const stringlifiedRanking = JSON.stringify(ranking);
    const connection = pool.promise();
    const insertInfo = {
      date: now,
      ranking: stringlifiedRanking
    }
    connection.query(`INSERT INTO monthlyRanking SET ?`, insertInfo);
  } catch (err) {
    console.log(err);
  };
};

/* function rankingManager() {
  //sec(optional), min, hr, day of month, month, day of week
  //this runs every hour
  const dailyRule = new schedule.RecurrenceRule();
  dailyRule.hour = 0;
  dailyRule.minute = 0;
  dailyRule.tz = 'Etc/UTC';
  schedule.scheduleJob(dailyRule, () => { updateDailyRanking() });

  //this runs every week start, every hour (monday)
  const weeklyRule = new schedule.RecurrenceRule();
  weeklyRule.dayOfWeek = 1;
  weeklyRule.hour = 0;
  weeklyRule.minute = 0;
  dailyRule.tz = 'Etc/UTC';
  schedule.scheduleJob(weeklyRule, () => { updateWeeklyRanking() });

  //this runs every month start, every hour
  const monthlyRule = new schedule.RecurrenceRule();
  monthlyRule.month = 1;
  monthlyRule.hour = 0;
  monthlyRule.minute = 0;
  dailyRule.tz = 'Etc/UTC';
  schedule.scheduleJob(monthlyRule, () => { updateMonthlyRanking() });
};
 */

function rankingManager() {
  //sec(optional), min, hr, day of month, month, day of week
  //this runs every hour
  const dailyRule = new schedule.RecurrenceRule();
  dailyRule.hour = 0;
  dailyRule.minute = 0;
  dailyRule.tz = 'Etc/UTC';
  schedule.scheduleJob(dailyRule, () => { rankingSort() });
}

module.exports = {
  rankingManager,
}