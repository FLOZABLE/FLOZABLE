const { DateTime } = require("luxon");
const pool = require("../model/pool");
const redisClient = require("../model/redis");

async function updateSubjectsTimeline(limit) {
  const connection = pool.promise();

  try {
    const [subjects] = await connection.query(
      `SELECT id, user_id, timeline, created_at, name FROM subjects WHERE updated = 0 LIMIT ?`,
      [limit]
    );
    const now = DateTime.now().toSeconds();
    await Promise.all(
      subjects.map(async (subject) => {
        const parsedTimeline = subject.timeline
          ? JSON.parse(subject.timeline.replace(/^/, "[").replace(/$/, "]"))
          : [];
        const todayTimeline = (
          await redisClient.lrange(
            `user:${subject.user_id}:subject:${subject.id}`,
            0,
            -1
          )
        ).map(JSON.parse);

        subject.timeline = parsedTimeline.concat(todayTimeline);
        //console.log(subject.timeline.length, parsedTimeline.length)
        let timelineSum = 0;
        subject.timeline = subject.timeline.filter((data) => {
          const [start, duration] = data;
          data[0] = start + timelineSum;
          timelineSum += start + duration;

          //filter out future timeline that was generated with err;
          if (data[0] + duration + subject.created_at > now) {
            return false;
          } else {
            return true;
          }
        });
        await connection.query(
          `UPDATE subjects SET timeline = ?, updated = 1 WHERE id = ?`,
          [JSON.stringify(subject.timeline).slice(1, -1), subject.id]
        );
        redisClient.del(`user:${subject.user_id}:subject:${subject.id}`);
        redisClient.del(`user:${subject.user_id}:subjects`);
      })
    );
    console.log("migration complete:", subjects.length);
  } catch (err) {
    console.log(err);
  }
}

async function redisUsersCache() {
  const prevAllMembers = await redisClient.smembers("allMembers");
  redisClient.sadd("day1", prevAllMembers);
  redisClient.sadd("day2", prevAllMembers);

  redisClient.sadd("week1", prevAllMembers);
  redisClient.sadd("week2", prevAllMembers);

  redisClient.sadd("month1", prevAllMembers);
  redisClient.sadd("month2", prevAllMembers);
}

async function activitySettingsMigration() {
  const connection = pool.promise();

  console.log('activity setting migration started', Date.now());
  await connection.query(
    `ALTER TABLE users MODIFY activity_setting VARCHAR(500) DEFAULT "{}";`
  );
  await connection.query(`UPDATE users SET activity_setting = "{}"`);
  console.log('activity setting migration complete', Date.now());
}

async function addStripeId() {
  const connection = pool.promise();
  
  await connection.query(
    `ALTER TABLE users ADD stripe_id VARCHAR(30);`
  );
}

module.exports = {
  updateSubjectsTimeline,
  redisUsersCache,
  activitySettingsMigration,
  addStripeId
};
