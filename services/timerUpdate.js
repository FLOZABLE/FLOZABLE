const redisClient = require("../model/redis");
const NodeCache = require('node-cache');
const cache = new NodeCache();
const { DateTime } = require('luxon');
const crypto = require("crypto");
const pool = require("../model/pool");
const { io, userIdToSocketIdMap } = require("../socket");
const cron = require("node-cron");
const { activeSubjectCache } = require("./redisLoader");

async function timerUpdate() {
  const now = DateTime.utc();
  const allTimezones = Intl.supportedValuesOf('timeZone');
  const midnightTimezones = ['America/Los_Angeles'];
  allTimezones.forEach(zone => {
    const dtInZone = now.setZone(zone);
    if (dtInZone.hour === 0) {
      midnightTimezones.push(zone);
    }
  });
  const connection = pool.promise();
  try {
    const [usersInfo] = await connection.query(`SELECT subjects, name, user_id, timezone FROM users where timezone IN (?)`, [midnightTimezones]);
    usersInfo.map(async ({subjects, user_id, timeline_sum, }) => {
      const userId = user_id;
      const now = Math.floor(new Date().getTime() / 1000);
      const activeSubject = activeSubjectCache(userId);
      if (activeSubject) {
        console.log("study interupt")
        const activity = JSON.parse(await redisClient.rPop(`user:${userId}:subject:${activeSubject.id}`));
        //const subjectInfo = await redisClient.hG
        if (activity) {
          const start = activity[0];
          const stop = now - activeSubject.datum_point - activeSubject.timeline_sum;
          redisClient.rPush(`user:${userId}:subject:${activeSubject.id}`, `[${start},${start - stop}]`);
          redisClient.rPush(`user:${userId}:subject:${activeSubject.id}`, `[0,0]`);
        }
      };
      if (subjects) {
        subjects = subjects.split(`,`);
        subjects.map(async(subject) => {
          let todayTimeline = (await redisClient.lRange(`user:${userId}:subject:${subject}`, 0, -1)).map(JSON.parse);
          if (todayTimeline.length) {
            const timelineSum = timeline_sum;
            todayTimeline = todayTimeline.map(([start, duration], i) => {
              return [start + (i + 1) * timelineSum, duration];
            });
            //const insertTimeline = await connection.query(`UPDATE subjects SET timeline = JSON_ARRAY_APPEND(timeline, '$', ?) WHERE id = ?`, [JSON.stringify(todayTimeline), subject])
            //this changes from [[39102,39104],[39105,39109],[39109,39112]] to [39102,39104],[39105,39109],[39109,39112]
            const modifiedTimeline = JSON.stringify(todayTimeline).slice(1, -1);
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
              subject
            ]);
          };
          redisClient.lTrim(`user:${userId}:subject:${subject}`, 1, 0);
        })
      };
      const socketId = userIdToSocketIdMap.get(userId);
      if (socketId) {
        io.to(socketId).emit('reset');
      };
    });
  } catch (err) {
    console.log(err);
  } finally {
    connection.releaseConnection();
  };
};

/** removes old timeline from the redis
 * because every users need t
 * 
 */
async function removeTimeline() {

}
//timerUpdate();

cron.schedule('0 * * * *', () => {
  timerUpdate();
});

module.exports = {
  timerUpdate: timerUpdate
};