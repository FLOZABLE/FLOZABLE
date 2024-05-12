const redisClient = require("../model/redis");
const pool = require("../model/pool");
const { activeSubjectCache, subjectsCache, timerCache } = require("./redisLoader");
const { getMidnightTimezones } = require("../tool");
const { mainIo } = require("../sockets/mainIo");
const { MAX_STUDY_TIME } = require("../Constants");

async function timerUpdate() {
  const now = Math.floor(new Date().getTime() / 1000);
  const midnightTimezones = getMidnightTimezones();
  const connection = pool.promise();
  try {
    const [usersInfo] = await connection.query(`SELECT name, user_id, timezone FROM users where timezone IN (?)`, [midnightTimezones]);
    //const [usersInfo] = await connection.query(`SELECT name, user_id, timezone FROM users`);
    usersInfo.map(async ({ user_id }) => {
      const userId = user_id;
      const subjects = await subjectsCache(userId);
      const activeSubject = await activeSubjectCache(userId);
      //user is studying
      let activity = false;
      if (activeSubject && activeSubject.id !== "0") {
        activity = JSON.parse(await redisClient.rPop(`user:${userId}:subject:${activeSubject.id}`));
      };
      await Promise.all(subjects.map(async ({ id, timeline_sum }) => {
        let todayTimeline = (await redisClient.lRange(`user:${userId}:subject:${id}`, 0, -1)).map(JSON.parse);
        if (todayTimeline.length) {
          //const insertTimeline = await connection.query(`UPDATE subjects SET timeline = JSON_ARRAY_APPEND(timeline, '$', ?) WHERE id = ?`, [JSON.stringify(todayTimeline), subject])
          //this changes from [[39102,39104],[39105,39109],[39109,39112]] to [39102,39104],[39105,39109],[39109,39112]
          const modifiedTimeline = JSON.stringify(todayTimeline).slice(1, -1);
          console.log(modifiedTimeline);
          connection.query(`
          UPDATE subjects
          SET timeline = CASE
            WHEN timeline = '' THEN ?
            ELSE CONCAT(timeline, ',', ?)
          END
          WHERE id = ?
        `, [
            modifiedTimeline,
            modifiedTimeline,
            id
          ]);
        };
        await redisClient.lTrim(`user:${userId}:subject:${id}`, 1, 0);
        //removeTimeline(userId, now);
      }));
      mainIo.to(userId).emit('reset');
      if (activity) {
        const start = activity[0];
        const activeSubjectInfo = subjects.find(subject => {return subject.id === activeSubject.id});
        if (!activeSubjectInfo) return;
        const duration = now - activeSubjectInfo.datum_point - start;
        await redisClient.rPush(`user:${userId}:subject:${activeSubject.id}`, `[${start},${duration}]`);
        redisClient.rPush(`user:${userId}:subject:${activeSubject.id}`, `[0,0]`);
        //redisClient.incrBy(`user:${userId}:dayTotal`, duration);

        if (duration > MAX_STUDY_TIME) {
          console.log('max study exceeded: ', duration);
          return;
        };

        for (let i = -12; i < 12; i++) {
          redisClient.zIncrBy(`user:${userId}:dayTotal`, duration, i.toString());
        };
      }
    });
  } catch (err) {
    console.log(err);
  };
};

module.exports = {
  timerUpdate
};