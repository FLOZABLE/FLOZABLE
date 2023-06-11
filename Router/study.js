const express = require("express");
const Router = express.Router();
const pool = require('../model/pool');

Router.get("/", async(req, res) => {
  res.render("study/study", {
    loggedin: req.session.loggedin || false,
  });
});

Router.post('/add-subject', async (req, res) => {
  if (!req.session.loggedin) {
    return res.sendStatus(401);
  }

  const connection = await (await pool).getConnection();
  const subject = {
    ...req.body,
    today: 0,
    total: 0,
    datum_point: Math.floor(new Date().getTime() / 1000),
    timeline: [],
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

  console.log(`Updated ${update.affectedRows} row(s)`);

  res.sendStatus(200);
});

Router.post('/start', async (req, res) => {
  if (!req.session.loggedin) {
    return res.send({ success: false, reason: 'not auth' });
  }

  const io = req.app.get('socketio');
  const connection = await (await pool).getConnection();
  const index = req.body.index;

  const selectQuery = "SELECT subjects, groups FROM users WHERE user_id = ?";
  const selectParams = [req.session.user_id];
  const select = await connection.query(selectQuery, selectParams);
  const subjects = JSON.parse(select[0].subjects || "[]");
  const groups = select[0].groups ? select[0].groups.split(",") : [];
  const startTime = Math.floor(new Date().getTime() / 1000);
  const storedTime = startTime - subjects[index].datum_point;
  subjects[index].timeline.push([storedTime]);
  const updatedJson = JSON.stringify(subjects);
  const updateQuery = "UPDATE users SET subjects = ? WHERE user_id = ?";
  const updateParams = [updatedJson, req.session.user_id];
  const update = await connection.query(updateQuery, updateParams);

  if (groups.length !== 0) {
    console.log(`send signals to ${groups}`)
    io.to(groups).emit('studying', req.session.user_id, groups);
  }

  connection.release();
  res.send({ success: true });
});

Router.post('/stop', async (req, res) => {
  if (!req.session.loggedin) {
    return res.send({ success: false, reason: 'not auth' });
  }

  const io = req.app.get('socketio');
  const connection = await (await pool).getConnection();
  const index = req.body.index;

  const selectQuery = "SELECT subjects, groups FROM users WHERE user_id = ?";
  const selectParams = [req.session.user_id];
  const select = await connection.query(selectQuery, selectParams);
  const groups = select[0].groups ? select[0].groups.split(",") : [];

  if (groups.length !== 0) {
    io.to(groups).emit('stopstudying', req.session.user_id, groups);
  }

  const subjects = JSON.parse(select[0].subjects || "[]");
  const stopTime = Math.floor(new Date().getTime() / 1000);
  const storedTime = stopTime - subjects[index].datum_point;
  subjects[index].timeline[subjects[index].timeline.length - 1].push(storedTime);
  subjects[index].today += subjects[index].timeline[subjects[index].timeline.length - 1][1] - subjects[index].timeline[subjects[index].timeline.length - 1][0];
  subjects[index].total += subjects[index].today;
  const updatedJson = JSON.stringify(subjects);
  const updateQuery = "UPDATE users SET subjects = ? WHERE user_id = ?";
  const updateParams = [updatedJson, req.session.user_id];
  const update = await connection.query(updateQuery, updateParams);

  res.send({ success: true });
  connection.release();
});

Router.post('/bring-subjects', async (req, res) => {
  if (!req.session.loggedin) {
    return res.send("not loggedin");
  }

  const connection = await (await pool).getConnection();
  const subjects = await connection.query("SELECT subjects FROM users WHERE user_id = ?", [req.session.user_id]);
  connection.release();

  res.send(subjects[0].subjects);
});

Router.post('/bring-members-info', async (req, res) => {
  if (!req.session.loggedin) {
    return res.send({ success: false, reason: 'not auth' });
  }
  
  const connection = await (await pool).getConnection();
  const userId = req.session.user_id;
  let groups = await connection.query('SELECT groups FROM users WHERE user_id = ?', [userId]);
  groups = groups[0].groups;
  
  if (!groups) {
    return res.send({ success: false, reason: 'no groups' });
  }
  
  const groupsInfo = await connection.query('SELECT group_id, name, leader, visibility, explanation, date, members, max_members, tags, color, goal_hr, average_hr, likes, font FROM groups WHERE group_id IN (?)', [groups]);
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
  
      if (member.subjects == null) {
        return 0;
      }
      console.log(membersInfo[group_index].members)
  
      membersInfo[group_index].members.push({ userId: member.user_id, name: member.name, subjects: member.subjects, timezone: member.timezone, filteredTimeline: [], today: 0 });
  
      await Promise.all(member.subjects.map(async (subject, index) => {
        const datum_point = member.subjects[index].datum_point;
        let today = 0;
        let study = false;
        const filteredTimeline = subject.timeline.filter((period, index) => {
          let [start, end] = period;
          start = (start + datum_point) * 1000;
          if (end == null) {
            console.log('studying');
            study = true;
          }
          end = (end + datum_point) * 1000;
          if(start >= startTime && end <= endTime){
            today += (end - start);
          }
          return start >= startTime && end <= endTime;
        });
        console.log('filtered time', filteredTimeline, membersInfo[group_index]);
        membersInfo[group_index].members[member_index].today = today;
        membersInfo[group_index].members[member_index].study = study;
        membersInfo[group_index].members[member_index].filteredTimeline.push(filteredTimeline);
      }));
    }));
  }));
  
  console.log('mem info', membersInfo);
  res.send([groupsInfo, req.session.user_id, groups, membersInfo]);
  
})

Router.post('/update-members-info', async(req, res) => {
  if (!req.session.loggedin) {
    return res.send({ success: false, reason: 'not auth' });
  }
  
  const connection = await (await pool).getConnection();
  const userId = req.body.userId;
  
  let member = await connection.query(`SELECT user_id, name, subjects, timezone from users where user_id  = ?`, [userId]);
  member = member[0];
  console.log(member, userId, req.body)

  
  member.subjects = member.subjects ? JSON.parse(member.subjects): [];
  const date = new Date().toLocaleDateString('en-US', { timeZone: member.timezone });
  const startTime = new Date(`${date} 00:00:00`).getTime();
  const endTime = new Date(`${date} 24:00:00`).getTime();

  if (member.subjects == null) {
    return 0;
  }

  member = { userId: member.user_id, name: member.name, subjects: member.subjects, timezone: member.timezone, filteredTimeline: [], today: 0 };

  await Promise.all(member.subjects.map(async (subject, index) => {
    const datum_point = member.subjects[index].datum_point;
    let today = 0;
    let study = false;
    const filteredTimeline = subject.timeline.filter((period, index) => {
      let [start, end] = period;
      start = (start + datum_point) * 1000;
      if (end == null) {
        console.log('studying');
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

res.send(member);
})

Router.post('/add-plan', async(req, res) => {
  try {
    const userId = req.session.user_id;
    if (!userId) {
      return res.send({ success: false, reason: 'not auth' });
    }
  
    console.log(req.body);
  
    const connection = await (await pool).getConnection();
    const plan = JSON.stringify(req.body);
    
    try {
      const addPlan = await connection.query(`UPDATE users SET plan = CASE
        WHEN plan IS NULL THEN '${plan}'
        WHEN plan = '' THEN '${plan}'
        ELSE CONCAT(plan, ',', '${plan}')
        END
        WHERE user_id = '${userId}'`);
      res.send({ success: true });
    } catch (error) {
      console.error('MySQL error:', error);
      res.send({ success: false, reason: 'MySQL error' });
    }
  } catch (error) {
    console.error('An error occurred:', error);
    res.send({ success: false, reason: 'An error occurred' });
  }
})
module.exports = Router;