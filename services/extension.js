const { DateTime } = require("luxon");
const redisClient = require("../model/redis");
const pool = require("../model/pool");
const { getMidnightTimezones } = require("../Utils/tool");
const { getActiveUsers } = require("./redisLoader");
const { extensionIo } = require("../sockets/extensionIo");

async function extensionManager() {
  try {
    const dateTime =  DateTime.now();
    const midnightTimezones = getMidnightTimezones();
    dateTime.setZone(midnightTimezones[0]);
    const date = dateTime.toFormat("M/d/yyyy");
    const users = await getActiveUsers('day');
    const connection = pool.promise();

    if (!users.length) return;

    const [filteredUsers] = await connection.query(`SELECT user_id FROM users where timezone IN (?) AND user_id IN (?)`, [midnightTimezones, users]);
    filteredUsers.map(async({user_id}) => {
      const websitesUsage = await redisClient.zrangewithscores(`user:${user_id}:tabs:usage`, 0, -1);
      const websitesTimer = await redisClient.zrangewithscores(`user:${user_id}:tabs:timer`, 0, -1);
      //console.log(websitesUsage, websitesTimer);
      if (!websitesUsage.length && !websitesTimer.length) return;

      const websiteStats = websitesTimer.map(({value, score}) => {
        let v = 0;
        const websiteUsage = websitesUsage.find(website => {return website.value === value});
        if (websiteUsage) {
          v = websiteUsage.score;
        }
        return JSON.stringify({d: value, t: score, v});
      });
      const activity = {
        user_id,
        date,
        data: websiteStats.join(',')
      };
      const update = await connection.query(`INSERT INTO activities set ?`, activity);
      redisClient.del(`user:${user_id}:tabs:usage`);
      redisClient.del(`user:${user_id}:tabs:timer`);
      extensionIo.to(user_id).emit('reset');
    });
  } catch (err) {
    console.log(err);
  };
};

module.exports = {
  extensionManager
};