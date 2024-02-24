const redisClient = require("../model/redis");
const NodeCache = require('node-cache');
const cache = new NodeCache();
const { DateTime } = require('luxon');
const crypto = require("crypto");
const pool = require("../model/pool");
const { io } = require("../socket");
const cron = require("node-cron");
const { activeSubjectCache, subjectsCache, timerCache } = require("./redisLoader");

async function timerUpdate() {
  const now = DateTime.utc();
  const allTimezones = Intl.supportedValuesOf('timeZone');
  const midnightTimezones = [];
  allTimezones.forEach(zone => {
    const dtInZone = now.setZone(zone);
    if (dtInZone.hour === 0) {
      midnightTimezones.push(zone);
    }
  });
  const connection = pool.promise();
  try {
    //const [usersInfo] = await connection.query(`SELECT name, user_id, timezone FROM users where timezone IN (?)`, [midnightTimezones]);
    const [usersInfo] = await connection.query(`SELECT name, user_id, timezone FROM users`);
    usersInfo.map(async ({ user_id }) => {
      const userId = user_id;
      const now = Math.floor(new Date().getTime() / 1000);
      const subjects = await subjectsCache(userId);
      const activeSubject = await activeSubjectCache(userId);
      //user is studying
      let activity = false;
      if (activeSubject && activeSubject.id) {
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
          END,
          timeline_sum = ?
          WHERE id = ?
        `, [
            modifiedTimeline,
            modifiedTimeline,
            timeline_sum,
            id
          ]);
        };
        await redisClient.lTrim(`user:${userId}:subject:${id}`, 1, 0);
        //removeTimeline(userId, now);
      }));
      io.to(userId).emit('reset');
      if (activity) {
        const start = activity[0];
        const activeSubjectInfo = subjects.find(subject => {return subject.id === activeSubject.id});
        if (!activeSubjectInfo) return;
        const duration = now - activeSubjectInfo.datum_point - activeSubjectInfo.timeline_sum;
        activeSubjectInfo.timeline_sum += duration;
        redisClient.hSet(`user:${userId}:subjects`, activeSubject.id, JSON.stringify(activeSubjectInfo));
        await redisClient.rPush(`user:${userId}:subject:${activeSubject.id}`, `[${start},${duration}]`);
        redisClient.rPush(`user:${userId}:subject:${activeSubject.id}`, `[0,0]`);
        //redisClient.incrBy(`user:${userId}:dayTotal`, duration);
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