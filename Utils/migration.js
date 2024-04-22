const { DateTime } = require('luxon');
const pool = require('../model/pool');
const redisClient = require('../model/redis');

async function updateSubjectsTimeline(limit) {
  const connection = pool.promise();
  
  try {
    const [subjects] = await connection.query(`SELECT id, user_id, timeline, datum_point, name FROM subjects WHERE updated = 0 LIMIT ?`, [limit]);
    const now = DateTime.now().toSeconds();
    await Promise.all(subjects.map(async(subject) => {
      const parsedTimeline = subject.timeline ? JSON.parse(subject.timeline.replace(/^/, "[").replace(/$/, "]")) : [];
      const todayTimeline = (await redisClient.lRange(`user:${subject.user_id}:subject:${subject.id}`, 0, -1)).map(JSON.parse);

      subject.timeline = parsedTimeline.concat(todayTimeline);
      //console.log(subject.timeline.length, parsedTimeline.length)
      let timelineSum = 0;
      subject.timeline = subject.timeline.filter((data) => {
        const [start, duration] = data;
        data[0] = start + timelineSum;
        timelineSum += start + duration;

        //filter out future timeline that was generated with err;
        if (data[0] + duration + subject.datum_point > now) {
          return false;
        } else {
          return true;
        }
      });
      await connection.query(`UPDATE subjects SET timeline = ?, updated = 1 WHERE id = ?`, [JSON.stringify(subject.timeline).slice(1, -1), subject.id]);
      redisClient.del(`user:${subject.user_id}:subject:${subject.id}`);
      redisClient.del(`user:${subject.user_id}:subjects`);
    }));
    console.log('migration complete:', subjects.length);
  } catch (err) {
    console.log(err);
  };
};

async function redisUsersCache() {
  const prevAllMembers = await redisClient.sMembers('allMembers');
  redisClient.sAdd('day1', prevAllMembers);
  redisClient.sAdd('day2', prevAllMembers);

  redisClient.sAdd('week1', prevAllMembers);
  redisClient.sAdd('week2', prevAllMembers);

  redisClient.sAdd('month1', prevAllMembers);
  redisClient.sAdd('month2', prevAllMembers);
};

module.exports = {
  updateSubjectsTimeline
}