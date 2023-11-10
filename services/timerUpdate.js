const redisClient = require("../model/redis");
const NodeCache = require('node-cache');
const cache = new NodeCache();
const { DateTime } = require('luxon');
const crypto = require("crypto");
const pool = require("../model/pool");
const { io, userIdToSocketIdMap } = require("../socket");
const cron = require("node-cron");
const { activeSubjectCache, subjectsCache } = require("./redisLoader");

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
    const [usersInfo] = await connection.query(`SELECT name, user_id, timezone FROM users where timezone IN (?)`, [midnightTimezones]);
    usersInfo.map(async ({ user_id }) => {
      const userId = user_id;
      const now = Math.floor(new Date().getTime() / 1000);
      const subjects = await subjectsCache(userId, false, ['id', 'timeline_sum']);
      const activeSubject = await activeSubjectCache(userId);
      //user is studying
      /* if (activeSubject.id) {
        const activeSubjectInfo = subjects.find(subject => {return subject.id === activeSubject.id});
        const activity = JSON.parse(await redisClient.rPop(`user:${userId}:subject:${activeSubject.id}`));
        if (activity) {
          const start = activity[0];
          const stop = now - activeSubjectInfo.datum_point - activeSubjectInfo.timeline_sum;
          redisClient.rPush(`user:${userId}:subject:${activeSubject.id}`, `[${start},${start - stop}]`);
          redisClient.rPush(`user:${userId}:subject:${activeSubject.id}`, `[0,0]`);
        }
      }; */
      subjects.map(async({id, timeline_sum}) => {
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
      })
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
timerUpdate();

cron.schedule('0 * * * *', () => {
  timerUpdate();
});

module.exports = {
  timerUpdate: timerUpdate
};