const redisClient = require("../model/redis");
const pool = require("../model/pool");
const { getMidnightTimezones } = require("../Utils/tool");
const { DateTime } = require("luxon");

async function timerUpdate() {
  const midnightTimezones = getMidnightTimezones();
  const connection = pool.promise();

  if (process.env.NODE_ENV === "development") {
    midnightTimezones.push("America/Los_Angeles");
  }
  const now = DateTime.now().minus({ hours: 8 }).toSeconds();
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
            -1
          )
        ).map(JSON.parse);

        const lastActivity = todayTimeline.length
          ? todayTimeline[todayTimeline.length - 1]
          : null;

        /**
         * it means user is still studying
         * requirements: valid last activity, start should be less than 8 hours from now, duration should be 0
         */
        if (lastActivity && lastActivity[0] > now && lastActivity[1] === 0) {
          redisClient.ltrim(`user:${user_id}:subject:${subject_id}`, -1, -1);
          todayTimeline.pop();
        } else {
          redisClient.del(`user:${user_id}:subject:${subject_id}`);
        }

        const subjectTimelines = todayTimeline.map((timeline) => {
          return [subject_id, timeline[0], timeline[1]];
        });
        insertInfo.push(...subjectTimelines);
      })
    );

    if (insertInfo.length) {
      await connection.query(
        `INSERT IGNORE INTO subject_timelines (subject_id, start_time, duration) VALUES ?`,
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
