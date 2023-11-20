const { DateTime } = require('luxon');
const schedule = require('node-schedule');
const pool = require('../model/pool');

async function updateDailyRanking() {
  const offset = Math.floor(DateTime.now().offset / 60);
  const connection = pool.promise();
  const [users] = await connection.query(`SELECT user_id FROM users`);
  users.map(async(user) => {
    const {user_id} = user;
    const subjects = await connection.query(`SELECT datum_point, timeline_sum, timeline FROM subjects WHERE user_id = ?`, [user_id]);
    
  })
};

console.log(DateTime.now().offset)

function updateWeeklyRanking() {

};

function updateMonthlyRanking() {

};

function rankingManager() {
  //sec(optional), min, hr, day of month, month, day of week
  //this runs every hour
  const dailyRule = new schedule.RecurrenceRule();
  dailyRule.minute = 0;
  dailyRule.tz = 'Etc/UTC';
  schedule.scheduleJob(dailyRule, () => { updateDailyRanking() });

  //this runs every week start, every hour (monday)
  const weeklyRule = new schedule.RecurrenceRule();
  weeklyRule.dayOfWeek = 1;
  weeklyRule.minute = 0;
  dailyRule.tz = 'Etc/UTC';
  schedule.scheduleJob(weeklyRule, () => { updateWeeklyRanking() });

  //this runs every month start, every hour
  const monthlyRule = new schedule.RecurrenceRule();
  monthlyRule.month = 1;
  monthlyRule.minute = 0;
  dailyRule.tz = 'Etc/UTC';
  schedule.scheduleJob(monthlyRule, () => { updateMonthlyRanking() });
};


module.exports = {
  rankingManager,
}