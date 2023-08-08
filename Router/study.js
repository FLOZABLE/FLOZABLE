const express = require("express");
const Router = express.Router();
const pool = require('../model/pool');
const notificationService = require('../services/notification');
const account = require('./account');
const Ajv = require('ajv');
const ajv = new Ajv();
const {DateTime} = require('luxon');

function generateRandomId(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

Router.get("/", async(req, res) => {
  account.autoSignin(req, res, (() => {
    res.render("study", {
      userInfo: req.session.userInfo
    });
  }), (() => {
    res.redirect('/account/signin')
  }))
});

Router.post('/add-subject', async (req, res) => {
  account.autoSignin(req, res, (async() => {

    const connection = await (await pool).getConnection();
    const subject = {
      ...req.body,
      total: 0,
      datum_point: Math.floor(new Date().getTime() / 1000),
      timeline: [],
      id: generateRandomId(10)
    };
  
    const selectQuery = "SELECT subjects FROM users WHERE user_id = ?";
    const selectParams = [req.session.user_id];
    const select = await connection.query(selectQuery, selectParams);
    const subjects = JSON.parse(select[0].subjects || "[]");
    subjects.push(subject);
    const updatedJson = JSON.stringify(subjects);
    const updateQuery = "UPDATE users SET subjects = ? WHERE user_id = ?";
    const updateParams = [updatedJson, req.session.user_id];
    const update = await connection.query(updateQuery, updateParams);
    connection.release();
  
  
    res.send({success: true, id: subject.id});
  }))
});

Router.post('/start', async (req, res) => {
  account.autoSignin(req, res, (async() => {
    const io = req.app.get('socketio');
    const connection = await (await pool).getConnection();
    const subjectId = req.body.id;
  
    const select = await connection.query(`SELECT subjects, daily, weekly, monthly, \`groups\` FROM users WHERE user_id = ?`, [req.session.user_id]);
    const subjects = JSON.parse(select[0].subjects || "[]");
    const groups = select[0].groups ? select[0].groups.split(",") : [];
    const startTime = Math.floor(new Date().getTime() / 1000);
    const subject = subjects.find(subject => subject.id == subjectId);
    const storedTime = startTime - subject.datum_point;
    subject.timeline.push([storedTime]);
    const updatedJson = JSON.stringify(subjects);
    const update = await connection.query("UPDATE users SET subjects = ? WHERE user_id = ?", [updatedJson, req.session.user_id]);
  
    if (groups.length !== 0) {
      io.to(groups).emit('studying', req.session.user_id, groups);
    }
  
    connection.release();
    res.send({ success: true });
  }));
});

Router.post('/stop', async (req, res) => {

  account.autoSignin(req, res, (async() => {
    const io = req.app.get('socketio');
    const connection = await (await pool).getConnection();
    const subjectId = req.body.id;
    const select = await connection.query(`SELECT subjects, daily, weekly, monthly, datum_point, \`groups\` FROM users WHERE user_id = "${req.session.user_id}"`);
    const groups = select[0].groups ? select[0].groups.split(",") : [];
  
    if (groups.length !== 0) {
      io.to(groups).emit('stopstudying', req.session.user_id, groups);
    }
  
    const subjects = JSON.parse(select[0].subjects || "[]");
    const stopTime = Math.floor(new Date().getTime() / 1000);
    const subject = subjects.find(subject => subject.id == subjectId);
    const storedTime = stopTime - subject.datum_point;
    subject.timeline[subject.timeline.length - 1].push(storedTime);
    //subject.total += subject.timeline[subject.timeline.length - 1][1] - subject.timeline[subject.timeline.length - 1][0];
    const timeZone = req.session.userInfo.timeZone;
    const date = new Date();
    date.toLocaleString("en-US", { timeZone });
    date.setHours(0, 0, 0, 0);
    /* 
    const userDateTime = DateTime.now().setZone(timeZone);
    const twelveAmDateTime = userDateTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    const unixTimestamp = twelveAmDateTime.toMillis();
    */
    const datum_point = new Date(select[0].datum_point * 1000);
    datum_point.toLocaleString("en-US", {timeZone});
    datum_point.setHours(0, 0, 0, 0);
    const daily = JSON.parse(select[0].daily);
    const weekly = JSON.parse(select[0].weekly);
    const monthly = JSON.parse(select[0].monthly);
  
    const dayPassed = (date.getTime() - datum_point.getTime()) / (1000 * 60 * 60 * 24);
  
    let dateWeekStart = date.getTime() - date.getDay() * 24 * 60 * 60 * 1000;
    let datum_pointWeekStart = datum_point.getTime() - datum_point.getDay() * 24 * 60 * 60 * 1000;
    const weekPassed = (dateWeekStart - datum_pointWeekStart) / (1000 * 60 * 60 * 24 * 7);
    let monthPassed = 0;
    let datumYear = datum_point.getFullYear();
    let datumMonth = datum_point.getMonth();
    let datumMonthStart = new Date(datumYear, datumMonth, 1).setHours(0, 0, 0, 0);
    const dateMonthStart = new Date(date.getFullYear(), date.getMonth(), 1).setHours(0, 0, 0, 0);
    while(datumMonthStart < dateMonthStart) {
      datumMonth += 1;
      if(datumMonth >= 11) {
        datumMonth = 0;
        datumYear += 1;
      }
      monthPassed += 1;
      datumMonthStart = new Date(datumYear, datumMonth, 1).setHours(0, 0, 0, 0);
    }
  
    let dayDiff = dayPassed - daily.length + 1;
    let weekDiff = weekPassed - weekly.length + 1;
    let monthDiff = monthPassed - monthly.length + 1;
  
    for(let i = 0; i < dayDiff; i++) {
      daily.push(0);
    }
  
    for(let i = 0; i < weekDiff; i++) {
      weekly.push(0);
    }
  
    for(let i = 0; i < monthDiff; i++) {
      monthly.push(0);
    }
  
    const duration =  subject.timeline[subject.timeline.length - 1][1] - subject.timeline[subject.timeline.length - 1][0];
    daily[daily.length - 1] += duration;
    weekly[weekly.length - 1] += duration;
    monthly[monthly.length - 1] += duration;
  
    const updatedJson = JSON.stringify(subjects);
    const updateParams = [updatedJson, JSON.stringify(daily), JSON.stringify(weekly), JSON.stringify(monthly), req.session.user_id];
    const update = await connection.query(`UPDATE users SET subjects = ?, daily = ?, weekly = ?, monthly = ?  WHERE user_id = ?`, updateParams);
  
    res.send({ success: true });
    connection.release();
  }));
});

Router.post('/bring-subjects', async (req, res) => {
  account.autoSignin(req, res, (async() => {
    const connection = await (await pool).getConnection();
    const subjects = await connection.query("SELECT subjects FROM users WHERE user_id = ?", [req.session.user_id]);
    connection.release();
  
    res.send(subjects[0].subjects);
  }));
});

Router.post('/bring-members-info', async (req, res) => {
  account.autoSignin(req, res, (async() => {
    const connection = await (await pool).getConnection();
    const userId = req.session.user_id;
    let userInfo = await connection.query('SELECT \`groups\` FROM users WHERE user_id = ?', [userId]);
    groups = userInfo[0].groups ? userInfo[0].groups.split(',') : null;
    
    if (!groups) {
      return res.send({ success: false, reason: 'no groups' });
    }
    
    const groupsInfo = await connection.query('SELECT group_id, name, leader, visibility, explanation, date, members, max_members, tags, color, goal_hr, average_hr, likes, font FROM \`groups\` WHERE group_id IN (?)', [groups]);
    let membersInfo = [];
    
    await Promise.all(groupsInfo.map(async (group, group_index) => {
      group.members = group.members ? JSON.parse(`[${group.members}]`) : [];
      const membersId = group.members.flat().filter((value, index) => index % 2 === 0);
      const members = await connection.query(`SELECT user_id, name, subjects, timezone from users where user_id in (?)`, [membersId]);
      membersInfo.push(groupsInfo[group_index]);
      membersInfo[group_index].members = [];
    
      await Promise.all(members.map(async (member, member_index) => {
        member.subjects = JSON.parse(member.subjects);
        const date = new Date().toLocaleDateString('en-US', { timeZone: member.timezone });
        const startTime = new Date(`${date} 00:00:00`).getTime();
        const endTime = new Date(`${date} 24:00:00`).getTime();
        let today = 0;
        membersInfo[group_index].members.push({ userId: member.user_id, name: member.name, subjects: member.subjects, timezone: member.timezone, filteredTimeline: [], today: 0 });
        member.subjects = member.subjects ? member.subjects : [];
        await Promise.all(member.subjects.map(async (subject, index) => {
          const datum_point = member.subjects[index].datum_point;
          let study = false;
          const filteredTimeline = subject.timeline.filter((period, index) => {
            let [start, end] = period;
            start = (start + datum_point) * 1000;
            if (end == null) {
              study = true;
            }
            end = (end + datum_point) * 1000;
            if(start >= startTime && end <= endTime){
              today += (end - start);
            }
            return start >= startTime && end <= endTime;
          });
          membersInfo[group_index].members[member_index].today = today;
          membersInfo[group_index].members[member_index].study = study;
          membersInfo[group_index].members[member_index].filteredTimeline.push(filteredTimeline);
        }));
      }));
    }));
    
    res.send([groupsInfo, req.session.user_id, groups, membersInfo]);
    connection.release();
  }))
})

Router.post('/update-members-info', async(req, res) => {
  account.autoSignin(req, res, (async() => {
    const connection = await (await pool).getConnection();
    const userId = req.body.userId;
    
    let member = await connection.query(`SELECT user_id, name, subjects, timezone from users where user_id  = ?`, [userId]);
    member = member[0];
  
    
    member.subjects = member.subjects ? JSON.parse(member.subjects): [];
    const date = new Date().toLocaleDateString('en-US', { timeZone: member.timezone });
    const startTime = new Date(`${date} 00:00:00`).getTime();
    const endTime = new Date(`${date} 24:00:00`).getTime();
  
    if (member.subjects == null) {
      return 0;
    }
  
    member = { userId: member.user_id, name: member.name, subjects: member.subjects, timezone: member.timezone, filteredTimeline: [], today: 0 };
    let today = 0;
    await Promise.all(member.subjects.map(async (subject, index) => {
      const datum_point = member.subjects[index].datum_point;
      let study = false;
      const filteredTimeline = subject.timeline.filter((period, index) => {
        let [start, end] = period;
        start = (start + datum_point) * 1000;
        if (end == null) {
          study = true;
        }
        end = (end + datum_point) * 1000;
        if(start >= startTime && end <= endTime){
          today += (end - start);
        }
        return start >= startTime && end <= endTime;
      });
      member.today = today;
      member.study = study;
      member.filteredTimeline.push(filteredTimeline);
    }));
    connection.release();
    res.send(member);
  }))
})

Router.post('/bring-plans', async(req, res) => {
  account.autoSignin(req, res, (async() => {
    const connection = await (await pool).getConnection();

    let plans = await connection.query(`SELECT * from plans where user_id = ?`, [req.session.user_id]);
    res.send({success: true, plans: plans})
    /* plans = JSON.stringify(`[${plans[0].plan}]`);
    res.send(plans); */
    connection.release();
  }))
});

/* Router.post('/update-plan', async(req, res) => {
  account.autoSignin(req, res, (async() => {
    try {
      const userId = req.session.user_id;
      if (!userId) {
        return res.send({ success: false, reason: 'not auth' });
      }
    
      const connection = await (await pool).getConnection();
      const planInfo = req.body;
      //sanitize
      planInfo.description = encodeURIComponent(planInfo.description);
      try {
        let userInfo = await connection.query(`SELECT plan, notification_setting, notifications, user_id, name, key_salt, iv, subscription, user_id from users where user_id = ?`, [req.session.user_id]);
        userInfo = userInfo[0];
        let plans = JSON.parse(`[${userInfo.plan}]`);
        let plan = plans.find(plan => planInfo.id == plan.id);
        const startTime = (planInfo.date + planInfo.hr * 60 * 60 + planInfo.min * 60) * 1000;
        if (plan) {
          const addPlan = await connection.query(
            'UPDATE users SET plan = CONCAT_WS(",", REPLACE(plan, ?, ?)) WHERE user_id = ?',
            [JSON.stringify(plan), JSON.stringify(planInfo), userId]
          );
          notificationService.removePrevNotification(userId, plan.id)
          notificationService.planNotification(plan, userInfo, startTime);
          res.send({ success: true, type: 'update' });
        } else {
          let notifications = JSON.parse(userInfo.notifications);
          notifications.push(planInfo.id);
          const addPlan = await connection.query(
            'UPDATE users SET plan = CASE WHEN plan = ? THEN ? ELSE CONCAT(plan, ?, ?) END, notifications = ? WHERE user_id = ?',
            [JSON.stringify(planInfo), JSON.stringify(planInfo), ',', JSON.stringify(planInfo), JSON.stringify(notifications), userId]
          );
          notificationService.planNotification(planInfo, userInfo, startTime);
          res.send({ success: true, type: 'add' });
        }
      } catch (error) {
        console.error('MySQL error:', error);
        res.send({ success: false, reason: 'Server Error' });
      }
      connection.release();
    } catch (error) {
      console.error('An error occurred:', error);
      res.send({ success: false, reason: 'An error occurred' });
    }
  }))
}) */

Router.post('/update-plan', async(req, res) => {
  account.autoSignin(req, res, (async() => {
    try {
      const planInfo = req.body;
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 100 },
          id: { type: 'string', minLength: 10, maxLength: 10 },
          date: { type: 'integer'},
          hr: { type: 'integer', minimum: 0, maximum: 24 },
          min: { type: 'integer', minimum: 0, maximum: 60 },
          length: { type: 'integer' },
          repeat: { type: 'string' },
          description: { type: 'string'},
          subject: { type: 'string' },
          notification: { type: 'string'},
          priority: { type: 'integer', minimum: 0, maximum: 100 },
        },
        required: ['name', 'id', 'date', 'hr', 'min', 'length', 'repeat', 'description', 'notification', 'subject', 'priority'],
        additionalProperties: false
      };

      const isValid = isValidJSON(planInfo, schema);
      if (isValid) {
        const connection = await (await pool).getConnection();
        try {
          const {name, id, date, hr, min, length, repeat, description, notification, subject, priority} = planInfo;
          const insertInfo = {
            id: id,
            user_id: req.session.user_id,
            name: name,
            date: date.toString(),
            time: `${hr}:${min}`,
            length: length,
            repeat: repeat,
            description: description,
            notification: notification,
            subject: subject,
            priority: priority
          }
          const deletePrev = await connection.query(`DELETE FROM plans WHERE user_id = ? AND id = ?`, [req.session.user_id, id]);
          if (!deletePrev.affectedRows) {
            notificationService.removePrevNotification(req.session.user_id, planInfo.id);
          }
          const userInfo = await connection.query(`SELECT user_id, name, email, notification_setting, key_salt, iv, subscription from users where user_id = ?`, [req.session.user_id]);
          const startTime = (planInfo.date + planInfo.hr * 60 * 60 + planInfo.min * 60) * 1000;
          notificationService.planNotification(insertInfo, userInfo[0], startTime)
          const insert = connection.query(`INSERT INTO plans SET ?`, insertInfo);
          res.send({success: true})
        } catch (error) {
          res.send({ success: false, reason: 'An error occurred' });
          console.log('Mysql Err', error);
        } finally {
          connection.release();
        }
      }
    } catch (error) {
      console.error('An error occurred:', error);
      res.send({ success: false, reason: 'An error occurred' });
    }
  }))
})

function isValidJSON(data, schema) {
  const validate = ajv.compile(schema);
  const isValid = validate(data);

  if (!isValid) {
    return false;
  } else {
    return true;
  }
}

module.exports = Router;