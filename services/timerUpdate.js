const redisClient = require("../model/redis");
const pool = require("../model/pool");
const { getMidnightTimezones } = require("../Utils/tool");

async function timerUpdate() {
  const midnightTimezones = getMidnightTimezones();
  const connection = pool.promise();

  midnightTimezones.push("America/Los_Angeles");
  try {
    const [subjects] = await connection.query(
      `SELECT s.subject_id, s.user_id FROM subjects s JOIN users u ON u.timezone IN (?)`,
      [midnightTimezones]
    );
    const insertInfo = [];
    await Promise.all(
      subjects.map(async ({ subject_id, user_id }) => {
        const todayTimeline = (
          await redisClient.lrange(
            `user:${user_id}:subject:${subject_id}`,
            0,
            -2
          )
        ).map(JSON.parse);
        const subjectTimelines = todayTimeline.map((timeline) => {
          return [subject_id, timeline[0], timeline[1]];
        });
        redisClient.ltrim(`user:${user_id}:subject:${subject_id}`, -1, -1);
        insertInfo.push(...subjectTimelines);
      })
    );

    if (insertInfo.length) {
      await connection.query(
        `INSERT INTO subject_timelines (subject_id, start_time, duration) VALUES ?`,
        [insertInfo]
      );
    }
    console.log("timer updated");
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  timerUpdate,
};
