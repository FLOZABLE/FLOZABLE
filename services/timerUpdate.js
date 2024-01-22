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
      if (activeSubject.id) {
        activity = JSON.parse(await redisClient.rPop(`user:${userId}:subject:${activeSubject.id}`));
      };
      subjects.map(async ({ id, timeline_sum }) => {
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
        redisClient.lTrim(`user:${userId}:subject:${id}`, 1, 0);
        //removeTimeline(userId, now);
      });
      io.to(userId).emit('reset');
      if (activity) {
        const start = activity[0];
        const activeSubjectInfo = subjects.find(subject => {return subject.id === activeSubject.id});
        if (!activeSubjectInfo) return;
        const stop = now - activeSubjectInfo.datum_point - activeSubjectInfo.timeline_sum;
        activeSubjectInfo.timeline_sum += start - stop;
        redisClient.hSet(`user:${userId}:subjects`, activeSubject.id, JSON.stringify(activeSubjectInfo));
        await redisClient.rPush(`user:${userId}:subject:${activeSubject.id}`, `[${start},${start - stop}]`);
        redisClient.rPush(`user:${userId}:subject:${activeSubject.id}`, `[0,0]`);
        redisClient.incrBy(`user:${userId}:dayTotal`, start - stop);
      }
    });
  } catch (err) {
    console.log(err);
  };
};

const MAX_SAVING = 60 * 60 * 24 * 2;//save for 2 days;
/** removes old timeline from the redis
 * 
 * 
 */
async function removeTimeline(userId, time) {
  try {
    const timer = await redisClient.lRange(`user:${userId}:timer`, 0, -1);
    const timerInfo = await timerCache(userId, time);
    const { dp, ts } = timerInfo;

    const lastStopUnix = dp + ts;
    let timelineSum = 0;

    let trimIndex = 0;
    timer.find(([start, duration], i) => {
      const startUnix = dp + start + timelineSum;
      timelineSum += start + duration;
      if (lastStopUnix - startUnix > MAX_SAVING) {
        trimIndex = i;
        return true;
      };
    });

    console.log('trim index', trimIndex);
    if (trimIndex) {
      redisClient.lTrim(`user:${userId}:timer`, 0, trimIndex);

      timerInfo.dp = dp;
      timerInfo.ts = ts - timelineSum;
  
      redisClient.hSet(`user:${userId}:timerInfo`, JSON.stringify(timerInfo));
    };
  } catch (err) {
    console.log(err);
  };
}
//timerUpdate();

cron.schedule('0 * * * *', () => {
  timerUpdate();
});

module.exports = {
  timerUpdate: timerUpdate
};