const { DateTime } = require("luxon");
const redisClient = require("../model/redis");
const pool = require("../model/pool");

async function extensionManager() {
  try {
    const dateTime =  DateTime.utc()
    const hour = dateTime.get('hour');
    if (hour < 12) {
      dateTime.minus({day: 1});
    } else if (hour > 12) {
      dateTime.plus({day: 1});
    };
    const date = dateTime.toLocaleString(DateTime.DATE_SHORT);
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
      console.log(activity)
      const update = await connection.query(`INSERT INTO activities set ?`, activity);
    });
  } catch (err) {
    console.log(err);
  };
};

module.exports = {
  extensionManager
};