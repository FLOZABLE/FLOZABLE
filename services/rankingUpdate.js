const { DateTime } = require('luxon');
const schedule = require('node-schedule');
const pool = require('../model/pool');
const redisClient = require('../model/redis');

async function updateRanking() {
  console.log("update ranking")
  /* //this means week start + month start => week value, month value should be waited by using await incrby
  if (now.weekday === 1 && now.day === 1) {
    updateWeeklyRanking();
  } */
  const timezoneOffset = DateTime.utc().get('hour');
  const now = DateTime.now().set({minute: 0, second: 0, millisecond: 0}).toSeconds();
  const users = await redisClient.sMembers(`allMembers`);
  console.log(users)
  await updateDailyRanking(now, users, timezoneOffset.toString());
  if (now.weekday === 1) {
    updateWeeklyRanking(now, users, timezoneOffset.toString());
  };
  if (now.day === 1) {
    updateMonthlyRanking(now, users, timezoneOffset.toString());
    redisClient.del(`allMembers`);
  };
}

async function updateDailyRanking(now, users, timezoneOffset) {
  try {
    const filteredUsers = [];
    await Promise.all(users.map(async(userId) => {
      const todayTotal = await redisClient.zRem(`user:${userId}:dayTotal`, timezoneOffset);
      //update week total, month total
      if (todayTotal) {
        filteredUsers.push({u: userId, t: todayTotal});
        /* await redisClient.incrBy(`user:${userId}:weekTotal`, todayTotal);
        await redisClient.incrBy(`user:${userId}:monthTotal`, todayTotal); */
        for (let i = -12; i < 12; i++) {
          redisClient.zIncrBy(`user:${userId}:weekTotal`, todayTotal, i.toString());
          redisClient.zIncrBy(`user:${userId}:monthTotal`, todayTotal, i.toString());
        };
      };
      //redisClient.del(`user:${userId}:dayTotal`);
      return null;
    }));

    const ranking = filteredUsers.sort((a, b) => b.t - a.t);
    const stringlifiedRanking = JSON.stringify(ranking);
    const connection = pool.promise();
    const insertInfo = {
      date: now,
      ranking: stringlifiedRanking
    };
    connection.query(`INSERT INTO dailyRanking SET ?`, insertInfo);
  } catch (err) {
    console.log(err);
  };
};

async function updateWeeklyRanking(now, users, timezoneOffset) {
  try {
    const filteredUsers = [];
    await Promise.all(users.map(async(userId) => {
      //const thisWeekTotal = await redisClient.get(`user:${userId}:weekTotal`);
      const thisWeekTotal = await redisClient.zRem(`user:${userId}:weekTotal`, timezoneOffset);
      if (thisWeekTotal) {
        filteredUsers.push({u: userId, t: thisWeekTotal});
      };
      //redisClient.del(`user:${userId}:weekTotal`);
      return null;
    }));

    const ranking = filteredUsers.sort((a, b) => b.t - a.t);
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

async function updateMonthlyRanking(now, users, timezoneOffset) {
  try {
    const filteredUsers = [];
    await Promise.all(users.map(async(userId) => {
      //const thisMonthTotal = await redisClient.get(`user:${userId}:monthTotal`);
      const thisMonthTotal = await redisClient.zRem(`user:${userId}:monthTotal`, timezoneOffset);
      if (thisMonthTotal) {
        filteredUsers.push({u: userId, t: thisMonthTotal});
      }
      //redisClient.del(`user:${userId}:monthTotal`);
      return null;
    }));

    const ranking = filteredUsers.sort((a, b) => b.t - a.t);
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

//rankingSort();

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

/* function rankingManager() {
  //sec(optional), min, hr, day of month, month, day of week
  //this runs every hour
  const dailyRule = new schedule.RecurrenceRule();
  dailyRule.hour = 0;
  dailyRule.minute = 0;
  dailyRule.tz = 'Etc/UTC';
  schedule.scheduleJob(dailyRule, () => { rankingSort() });
} */

module.exports = {
  updateRanking,
}