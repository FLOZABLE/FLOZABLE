const redisClient = require("../model/redis");
const NodeCache = require('node-cache');
const cache = new NodeCache();
const { DateTime } = require('luxon');
const crypto = require("crypto");
const pool = require("../model/pool");
const { io, userIdToSocketIdMap } = require("../socket");
const cron = require("node-cron");

async function timerUpdate() {
  const now = DateTime.utc();
  const allTimezones = Intl.supportedValuesOf('timeZone');
  const midnightTimezones = ["America/Los_Angeles"];
  allTimezones.forEach(zone => {
    const dtInZone = now.setZone(zone);
    if (dtInZone.hour === 0) {
      midnightTimezones.push(zone);
    }
  });
  const connection = pool.promise();
  try {
    const [usersInfo] = await connection.query(`SELECT subjects, name, user_id, daily, weekly, monthly FROM users where timezone IN (?)`, [midnightTimezones]);
    usersInfo.map(async (userInfo) => {
      const userId = userInfo.user_id;
      const studyInfo = await redisClient.hGet(`user:${userId}`, `timerInfo`);
      const now = Math.floor(new Date().getTime() / 1000);
      let activeSubject = -1;
      if (studyInfo && JSON.parse(studyInfo).study) {
        console.log("study interupt")
        activeSubject = JSON.parse(await redisClient.hGet(`user:${userId}`, 'ActiveSubject'));
        const activity = JSON.parse(await redisClient.rPop(`user:${userId}:subject:${activeSubject.id}`));
        const start = activity[0];
        const stop = now - activeSubject.datum_point;
        await redisClient.rPush(`user:${userId}:subject:${activeSubject.id}`, `[${start},${stop}]`);
      };
      if (userInfo.subjects) {
        userInfo.subjects = userInfo.subjects.split(`,`);
        for (const subject of userInfo.subjects) {
          const todayTimeline = (await redisClient.lRange(`user:${userId}:subject:${subject}`, 0, -1)).map(JSON.parse);
          if (todayTimeline.length) {
            const insertTimeline = await connection.query(`UPDATE subjects SET timeline = JSON_ARRAY_APPEND(timeline, '$', ?) WHERE id = ?`, [JSON.stringify(todayTimeline), subject])
          };
          await redisClient.lTrim(`user:${userId}:subject:${subject}`, 1, 0);
        }
      };
      if (activeSubject !== -1) {
        const start = now - activeSubject.datum_point;
        const push = await redisClient.rPush(`user:${userId}:subject:${activeSubject.id}`, `[${start},${start}]`);
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

cron.schedule('*/60 * * * * *', () => {
  timerUpdate();
});

module.exports = {
  timerUpdate: timerUpdate
};