const { DateTime } = require("luxon");
const redisClient = require("../model/redis");
const pool = require("../model/pool");
const { getMidnightTimezones } = require("../tool");

async function extensionManager() {
  try {
    const dateTime =  DateTime.now();
    const [midnightTimezone] = getMidnightTimezones();
    dateTime.setZone(midnightTimezone);
    const hour = dateTime.get('hour');
    const date = dateTime.toFormat("M/d/yyyy");
    const users = await redisClient.zRange(`extensionUsers`, hour, hour);
    const connection = pool.promise();
    users.map(async(user) => {
      const websitesUsage = await redisClient.zRangeWithScores(`user:${user}:tabs:usage`, 0, -1);
      const websitesTimer = await redisClient.zRangeWithScores(`user:${user}:tabs:timer`, 0, -1);
      //console.log(websitesUsage, websitesTimer);
      const websiteStats = websitesTimer.map(({value, score}) => {
        let v = 0;
        const websiteUsage = websitesUsage.find(website => {return website.value === value});
        if (websiteUsage) {
          v = websiteUsage.score;
        }
        return JSON.stringify({d: value, t: score, v});
      });
      const activity = {
        user_id: user,
        date,
        data: websiteStats.join(',')
      };
      const update = await connection.query(`INSERT INTO activities set ?`, activity);
      redisClient.del(`user:${user}:tabs:usage`);
      redisClient.del(`user:${user}:tabs:timer`);
    });
  } catch (err) {
    console.log(err);
  };
};

module.exports = {
  extensionManager
};