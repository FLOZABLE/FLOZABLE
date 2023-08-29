const express = require("express");
const Router = express.Router();
const pool = require('../../model/pool');
const notificationService = require('../../services/notification');
const account = require('../account');
const Ajv = require('ajv');
const ajv = new Ajv();
const {DateTime} = require('luxon');

Router.post('/accountinfo', (req, res) => {
  account.autoSignin(req, res, (async() => {
    const connection = await (await pool).getConnection();
    const [userInfo] = await connection.query("SELECT user_id, name, email, language, groups FROM users WHERE user_id = ?", [req.session.user_id]);
    connection.release();
    res.send({success: true, userInfo: userInfo});
  }));
});

Router.post('/bring-subjects', async (req, res) => {
  console.log('test')
  account.autoSignin(req, res, (async() => {
    const connection = await (await pool).getConnection();
    let userInfo = await connection.query("SELECT subjects FROM users WHERE user_id = ?", [req.session.user_id]);
    connection.release();
    userInfo = userInfo[0];
    res.send({success: true, subjects: userInfo.subjects});
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
    const timeZone = req.session.timeZone;
    await Promise.all(groupsInfo.map(async (group, group_index) => {
      group.members = group.members ? JSON.parse(`[${group.members}]`) : [];
      const membersId = group.members.flat().filter((value, index) => index % 2 === 0);
      const members = await connection.query(`SELECT user_id, name, subjects, timezone from users where user_id in (?)`, [membersId]);
      membersInfo.push(groupsInfo[group_index]);
      membersInfo[group_index].members = [];
    
      await Promise.all(members.map(async (member, member_index) => {
        member.subjects = JSON.parse(member.subjects);
        //const date = new Date().toLocaleDateString('en-US', { timeZone: member.timezone });
        const date = DateTime.now().setZone(timeZone).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
        const startTime = date.startOf('day').toMillis();
        const endTime = date.endOf('day').toMillis();
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