const redisClient = require("../model/redis");
const pool = require("../model/pool");
const {
  activeSubjectCache,
  subjectsCache,
  timerCache,
} = require("./redisLoader");
const { getMidnightTimezones } = require("../Utils/tool");
const { mainIo } = require("../sockets/mainIo");
const { MAX_STUDY_TIME } = require("../Constant");

async function timerUpdate() {
  const now = Math.floor(new Date().getTime() / 1000);
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
            -1
          )
        ).map(JSON.parse);
        const subjectTimelines = todayTimeline.map((timeline) => {
          return {
            subject_id,
            start_time: timeline[0],
            duration: timeline[1],
          };
        });
        redisClient.ltrim(`user:${user_id}:subject:${subject_id}`, 1, 0);
        insertInfo.push(...subjectTimelines);
      })
    );

    if (insertInfo.length) {
      await connection.query(`INSERT INTO subject_timelines SET ?`, insertInfo);
    }
    console.log("timer updated");
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  timerUpdate,
};
