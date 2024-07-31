const { DateTime } = require("luxon");
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { generateRandomId } = require("../Utils/tool");

async function updateRanking() {
  let now = DateTime.now();
  const allTimezones = Intl.supportedValuesOf("timeZone");

  allTimezones.findIndex((timezone) => {
    now = now.setZone(timezone);
    return now.get("hour") === 0;
  });

  console.log("update ranking", now.toSeconds());

  const timezoneOffset = Math.floor(now.offset / 60).toString();

  const rankingDate = now.minus({ day: 1 }).startOf("day").toSeconds();
  await updateDailyRanking(rankingDate, timezoneOffset);

  if (now.weekday === 1) {
    const rankingDate = now.minus({ week: 1 }).startOf("week").toSeconds();
    await updateWeeklyRanking(rankingDate, timezoneOffset);
  }

  if (now.day === 1) {
    const rankingDate = now.minus({ month: 1 }).startOf("month").toSeconds();
    await updateMonthlyRanking(rankingDate, timezoneOffset);
  }
}

async function updateDailyRanking(now, timezoneOffset) {
  try {
    const ranking_id = generateRandomId(10);
    const rankings = [];

    const todayTotal = await redisClient.zrevrange(
      `users:${timezoneOffset}:dayTotal`,
      0,
      -1,
      "WITHSCORES"
    );

    for (let i = 0; i < todayTotal.length; i += 2) {
      const study_time = parseInt(todayTotal[i + 1]);
      if (study_time) {
        const ranking = {
          ranking_id,
          user_id: todayTotal[i],
          rank: Math.floor(i / 2) + 1,
          study_time,
        };
        rankings.push(Object.values(ranking));
      }
    }

    const users = rankings.map((ranking) => ranking[1]);
    if (users.length) {
      redisClient.zrem(`users:${timezoneOffset}:dayTotal`, users);
    }

    const connection = pool.promise();
    const insertInfo = {
      ranking_id,
      date: now,
      timezone: timezoneOffset,
      mode: "day",
      length: rankings.length,
    };
    await connection.query(`INSERT INTO rankings SET ?`, insertInfo);

    if (rankings.length) {
      await connection.query(
        `INSERT IGNORE INTO ranking_details (ranking_id, user_id, rank, study_time) VALUES ?`,
        [rankings]
      );
    }
  } catch (err) {
    console.log(err);
  }
}

async function updateWeeklyRanking(now, timezoneOffset) {
  try {
    const ranking_id = generateRandomId(10);
    const rankings = [];

    const thisWeekTotal = await redisClient.zrevrange(
      `users:${timezoneOffset}:weekTotal`,
      0,
      -1,
      "WITHSCORES"
    );

    for (let i = 0; i < thisWeekTotal.length; i += 2) {
      const study_time = parseInt(thisWeekTotal[i + 1]);
      if (study_time) {
        const ranking = {
          ranking_id,
          user_id: thisWeekTotal[i],
          rank: Math.floor(i / 2) + 1,
          study_time,
        };
        rankings.push(Object.values(ranking));
      }
    }

    const users = rankings.map((ranking) => ranking[1]);
    if (users.length) {
      redisClient.zrem(`users:${timezoneOffset}:weekTotal`, users);
    }

    const connection = pool.promise();
    const insertInfo = {
      ranking_id,
      date: now,
      timezone: timezoneOffset,
      mode: "week",
      length: rankings.length,
    };
    await connection.query(`INSERT INTO rankings SET ?`, insertInfo);

    if (rankings.length) {
      await connection.query(
        `INSERT IGNORE INTO ranking_details (ranking_id, user_id, rank, study_time) VALUES ?`,
        [rankings]
      );
    }
  } catch (err) {
    console.log(err);
  }
}

async function updateMonthlyRanking(now, timezoneOffset) {
  try {
    const ranking_id = generateRandomId(10);
    const rankings = [];

    const thisMonthTotal = await redisClient.zrevrange(
      `users:${timezoneOffset}:monthTotal`,
      0,
      -1,
      "WITHSCORES"
    );

    for (let i = 0; i < thisMonthTotal.length; i += 2) {
      const study_time = parseInt(thisMonthTotal[i + 1]);
      if (study_time) {
        const ranking = {
          ranking_id,
          user_id: thisMonthTotal[i],
          rank: Math.floor(i / 2) + 1,
          study_time,
        };
        rankings.push(Object.values(ranking));
      }
    }

    const users = rankings.map((ranking) => ranking[1]);
    if (users.length) {
      redisClient.zrem(`users:${timezoneOffset}:monthTotal`, users);
    }

    const connection = pool.promise();
    const insertInfo = {
      ranking_id,
      date: now,
      timezone: timezoneOffset,
      mode: "month",
      length: rankings.length,
    };
    await connection.query(`INSERT INTO rankings SET ?`, insertInfo);

    if (rankings.length) {
      await connection.query(
        `INSERT IGNORE INTO ranking_details (ranking_id, user_id, rank, study_time) VALUES ?`,
        [rankings]
      );
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  updateRanking,
};
