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
    const [usersInfo] = await connection.query(`SELECT subjects, user_id, daily, weekly, monthly FROM users where timezone IN (?)`, [midnightTimezones]);
    usersInfo.map(async (userInfo) => {
      if (userInfo.subjects) {
        userInfo.subjects = userInfo.subjects.split(`,`);
        userInfo.subjects.map(async (subject) => {
          const todayTimeline = (await redisClient.lRange(`user:${userInfo.user_id}:subject:${subject}`, 0, -1)).map(JSON.parse);
          if (todayTimeline.length) {
            const insertTimeline = await connection.query(`UPDATE subjects SET timeline = JSON_ARRAY_APPEND(timeline, '$', ?) WHERE id = ?`, [JSON.stringify(todayTimeline), subject])
          };
          redisClient.del(`user:${userInfo.user_id}:subject:${subject}`);
        });
      };
      const socketId = userIdToSocketIdMap.get(userInfo.user_id);
      if (socketId) {
        io.to(socketId).emit('reset');
      };
      //const todayTimeline = (await redisClient.lRange(`user:${userInfo.user_id}:subject:${subject.id}`, 0, -1)).map(JSON.parse);
      //console.log(todayTimeline);
    });
    //console.log(subjects);
  } catch (err) {
    console.log(err);
  } finally {
    connection.releaseConnection();
  };
};

cron.schedule('*/5 * * * * *', () => {
  timerUpdate();
});

module.exports = {
  timerUpdate: timerUpdate
};