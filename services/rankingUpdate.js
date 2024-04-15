const { DateTime } = require('luxon');
const schedule = require('node-schedule');
const pool = require('../model/pool');
const redisClient = require('../model/redis');
const { getActiveUsers } = require('./redisLoader');

async function updateRanking() {
  console.log("update ranking")

  let now = DateTime.now();
  const allTimezones = Intl.supportedValuesOf('timeZone');

  allTimezones.findIndex(timezone => {
    now = now.setZone(timezone);
    return now.get("hour") === 0;
  });

  const timezoneOffset = Math.floor(now.offset / 60).toString();
  const dailyUsers = await getActiveUsers('day');
  const weeklyUsers = await getActiveUsers('week');
  const monthlyUsers = await getActiveUsers('month');

  const rankingDate = now.minus({ day: 1 }).startOf("day").toSeconds();
  await updateDailyRanking(rankingDate, dailyUsers, timezoneOffset);

  if (now.weekday === 1) {
    const rankingDate = now.minus({ week: 1 }).startOf("week").toSeconds();
    await updateWeeklyRanking(rankingDate, weeklyUsers, timezoneOffset);
  };

  if (now.day === 1) {
    const rankingDate = now.minus({ month: 1 }).startOf("month").toSeconds();
    await updateMonthlyRanking(rankingDate, monthlyUsers, timezoneOffset);
  };
}

async function updateDailyRanking(now, users, timezoneOffset) {
  try {
    const filteredUsers = [];
    await Promise.all(users.map(async (userId) => {
      const todayTotal = await redisClient.zScore(`user:${userId}:dayTotal`, timezoneOffset);
      //update week total, month total
      if (todayTotal) {
        filteredUsers.push({ u: userId, t: todayTotal });
        await redisClient.zIncrBy(`user:${userId}:weekTotal`, todayTotal, timezoneOffset);
        await redisClient.zIncrBy(`user:${userId}:monthTotal`, todayTotal, timezoneOffset);
      };
      redisClient.zRem(`user:${userId}:dayTotal`, timezoneOffset);
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
    await Promise.all(users.map(async (userId) => {
      //const thisWeekTotal = await redisClient.get(`user:${userId}:weekTotal`);
      const thisWeekTotal = await redisClient.zScore(`user:${userId}:weekTotal`, timezoneOffset);
      if (thisWeekTotal) {
        filteredUsers.push({ u: userId, t: thisWeekTotal });
      };
      //redisClient.del(`user:${userId}:weekTotal`);
      redisClient.zRem(`user:${userId}:weekTotal`, timezoneOffset);
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
    await Promise.all(users.map(async (userId) => {
      //const thisMonthTotal = await redisClient.get(`user:${userId}:monthTotal`);
      const thisMonthTotal = await redisClient.zScore(`user:${userId}:monthTotal`, timezoneOffset);
      if (thisMonthTotal) {
        filteredUsers.push({ u: userId, t: thisMonthTotal });
      }
      //redisClient.del(`user:${userId}:monthTotal`);
      redisClient.zRem(`user:${userId}:monthTotal`, timezoneOffset);
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

async function createRankings(offset) {
  try {

    const now = DateTime.now();
    const allTimezones = Intl.supportedValuesOf('timeZone');
  
    const zone = allTimezones.find(timezone => {
      return now.setZone(timezone).offset / 60 === offset;
    });

    console.log('zone: ', zone);

    if (!zone) {
      return;
    };

    const connection = pool.promise();

    const [subjects] = await connection.query(`SELECT id, user_id, timeline, datum_point FROM subjects`);
    console.log(subjects.length, zone);

    const dailyRankings = {};
    const weeklyRankings = {};
    const monthlyRankings = {};

    await Promise.all(subjects.map(async(subject) => {
      let parsedTimeline = subject.timeline ? JSON.parse(subject.timeline.replace(/^/, "[").replace(/$/, "]")) : [];
      const todayTimeline = (await redisClient.lRange(`user:${subject.user_id}:subject:${subject.id}`, 0, -1)).map(JSON.parse);
      parsedTimeline = parsedTimeline.concat(todayTimeline);

      let timelineSum = 0;
      parsedTimeline.map(([start, duration]) => {
        const startDateTime = DateTime.fromSeconds(subject.datum_point + start + timelineSum).setZone(zone);
        const stopDateTime = DateTime.fromSeconds(startDateTime.toSeconds() + duration).setZone(zone);
        timelineSum += start + duration;

        //if date change orrcured, cut it
        /* if (!startDateTime.hasSame(stopDateTime, 'day')) {

          if (!dailyRankings[startDateTime.startOf('day').toSeconds()]) {
            dailyRankings[startDateTime.startOf('day').toSeconds()] = {};
          };

          if (!dailyRankings[startDateTime.startOf('day')][subject.user_id]) {
            dailyRankings[startDateTime.startOf('day')][subject.user_id] = startDateTime.endOf('day').toSeconds() - startDateTime.toSeconds();
          } else {
            dailyRankings[startDateTime.startOf('day')][subject.user_id] += startDateTime.endOf('day').toSeconds() - startDateTime.toSeconds();
          }

          //next day
          if (!dailyRankings[stopDateTime.startOf('day').toSeconds()]) {
            dailyRankings[stopDateTime.startOf('day').toSeconds()] = {};
          };

          if (!dailyRankings[stopDateTime.startOf('day')][subject.user_id]) {
            dailyRankings[stopDateTime.startOf('day')][subject.user_id] = stopDateTime.toSeconds() - stopDateTime.startOf('day').toSeconds();
          } else {
            dailyRankings[stopDateTime.startOf('day')][subject.user_id] = stopDateTime.toSeconds() - stopDateTime.startOf('day').toSeconds();
          }
        }; */

        //day
        if (!dailyRankings[startDateTime.startOf('day').toSeconds()]) {
          dailyRankings[startDateTime.startOf('day').toSeconds()] = {};
        };

        if (!dailyRankings[startDateTime.startOf('day').toSeconds()][subject.user_id]) {
          dailyRankings[startDateTime.startOf('day').toSeconds()][subject.user_id] = stopDateTime.toSeconds() - startDateTime.toSeconds();
        } else {
          dailyRankings[startDateTime.startOf('day').toSeconds()][subject.user_id] += stopDateTime.toSeconds() - startDateTime.toSeconds();
        }

        //week
        if (!weeklyRankings[startDateTime.startOf('week').toSeconds()]) {
          weeklyRankings[startDateTime.startOf('week').toSeconds()] = {};
        };

        if (!weeklyRankings[startDateTime.startOf('week').toSeconds()][subject.user_id]) {
          weeklyRankings[startDateTime.startOf('week').toSeconds()][subject.user_id] = stopDateTime.toSeconds() - startDateTime.toSeconds();
        } else {
          weeklyRankings[startDateTime.startOf('week').toSeconds()][subject.user_id] += stopDateTime.toSeconds() - startDateTime.toSeconds();
        };

        //month
        if (!monthlyRankings[startDateTime.startOf('month').toSeconds()]) {
          monthlyRankings[startDateTime.startOf('month').toSeconds()] = {};
        };

        if (!monthlyRankings[startDateTime.startOf('month').toSeconds()][subject.user_id]) {
          monthlyRankings[startDateTime.startOf('month').toSeconds()][subject.user_id] = stopDateTime.toSeconds() - startDateTime.toSeconds();
        } else {
          monthlyRankings[startDateTime.startOf('month').toSeconds()][subject.user_id] += stopDateTime.toSeconds() - startDateTime.toSeconds();
        };

      })
    }));

    console.log('gd')
    //format rankings

    //daily
    await Promise.all(Object.keys(dailyRankings).map(async(date) => {
      const entries = Object.entries(dailyRankings[date]);
      entries.sort((a, b) => b[1] - a[1]);

      dailyRankings[date] = Object.fromEntries(entries);

      const formatted = Object.keys(dailyRankings[date]).map(userId => {
        return {u: userId, t: dailyRankings[date][userId]}
      });

      console.log(DateTime.fromSeconds(parseInt(date)).toFormat('M/d'), formatted)
      //prevent today's ranking gen
      if (parseInt(date) >= DateTime.now().setZone(zone).startOf('day').toSeconds()) {
        return;
      }

      await connection.query(`DELETE FROM dailyRanking WHERE date = ?`, [parseInt(date)]);
      await connection.query(`INSERT INTO dailyRanking SET date = ?, ranking = ?`, [parseInt(date), JSON.stringify(formatted)]);
    }));

    //weekly
    await Promise.all(Object.keys(weeklyRankings).map(async(date) => {
      const entries = Object.entries(weeklyRankings[date]);
      entries.sort((a, b) => b[1] - a[1]);

      weeklyRankings[date] = Object.fromEntries(entries);

      const formatted = Object.keys(weeklyRankings[date]).map(userId => {
        return {u: userId, t: weeklyRankings[date][userId]}
      });

      //prevent this week ranking gen
      if (parseInt(date) >= DateTime.now().setZone(zone).startOf('week').startOf('day').toSeconds()) {
        return;
      }

      await connection.query(`DELETE FROM weeklyRanking WHERE date = ?`, [parseInt(date)]);
      await connection.query(`INSERT INTO weeklyRanking SET date = ?, ranking = ?`, [parseInt(date), JSON.stringify(formatted)]);
    }));

    //monthly
    await Promise.all(Object.keys(monthlyRankings).map(async(date) => {
      const entries = Object.entries(monthlyRankings[date]);
      entries.sort((a, b) => b[1] - a[1]);

      monthlyRankings[date] = Object.fromEntries(entries);

      const formatted = Object.keys(monthlyRankings[date]).map(userId => {
        return {u: userId, t: monthlyRankings[date][userId]}
      });

      //prevent today's ranking gen
      if (parseInt(date) >= DateTime.now().setZone(zone).startOf('month').startOf('day').toSeconds()) {
        return;
      }

      await connection.query(`DELETE FROM monthlyRanking WHERE date = ?`, [parseInt(date)]);
      await connection.query(`INSERT INTO monthlyRanking SET date = ?, ranking = ?`, [parseInt(date), JSON.stringify(formatted)]);
    }));

    console.log(`ranking generation for ${zone} finished ${Object.keys(dailyRankings).length} ${Object.keys(weeklyRankings).length} ${Object.keys(monthlyRankings).length} `)
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  updateRanking,
  createRankings
}