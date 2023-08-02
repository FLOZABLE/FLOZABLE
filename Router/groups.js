const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');
const crypto = require("crypto");
const account  = require('./account');

function hashing(password) {
  let salt = crypto.randomBytes(32).toString('hex')
  return [salt, crypto.pbkdf2Sync(password, salt, 99097, 32, 'sha512').toString('hex')]
}

function generateGroupId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 8;
  let groupId = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    groupId += characters.charAt(randomIndex);
  }

  return groupId;
}


Router.get("/", async (req, res) => {
  account.autoSignin(req, res, (() => {
    res.render("group/groups");
  }), (() => {
    res.redirect('/account/signin');
  }))
})

Router.get('/create', (req, res) => {
  account.autoSignin(req, res, (() => {
    res.render("group/create");
  }), (() => {
    res.redirect('/account/signin');
  }))
})

Router.get('/:id', async(req, res) => {
  const groupId = req.params.id;
})

Router.post('/create/retriveProgress', (req, res) => {
  res.send({ retrivedProgress: req.session.retrivedProgress });
})

Router.post('/create-validate', async (req, res) => {
  account.autoSignin(req, res, (async() => {
    const connection = await (await pool).getConnection();
    let hashed = hashing(req.body['password']);
    let group = req.body;
    if(!group.name || !group.explanation){
      console.log('null');
      res.send({success: false, reason: 'err', msg: 'Fill out the form'})
      return 0
    }
  
    const query = 'INSERT INTO groups SET ?';
    const values = {
      name: group.name,
      explanation: group.explanation,
      tags: JSON.stringify(group.tags),
      max_members: group.max_people,
      visibility: group.visibility,
      hashed_password: hashed[1],
      salt: hashed[0],
      date: new Date().getTime(),
      group_id: generateGroupId(),
      leader: req.session.user_id,
      members: JSON.stringify([req.session.user_id, req.session.name]),
      color: group.color,
      goal_hr: group.goal_hr,
      font: group.font
    };
  
    const query1 = await connection.query(query, values);
    const query2 = await connection.query(`UPDATE users SET groups = CASE
    WHEN groups IS NULL THEN '${values.group_id}'
    WHEN groups = '' THEN '${values.group_id}'
    ELSE CONCAT(groups, ',', '${values.group_id}')
    END
    WHERE user_id = '${req.session.user_id}'`);
    if (query1.affectedRows + query2.affectedRows >= 1) {
      res.send({ success: true });
      delete req.session.retrivedProgress;
      req.session.save();
      console.log(req.session, 'affected')
    } else {
      res.send({ success: false });
    }
  
    connection.release();
  }), (() => {
    req.session.retrivedProgress = req.body;
    res.send({ success: false, reason: 'not autenticated' });
  }))
})

Router.post('/join/:id', async (req, res) => {
  const sessionDataHeader = req.headers['x-session-data'];
  if (sessionDataHeader) {
    const sessionData = JSON.parse(sessionDataHeader);
    if (sessionData.user_id && sessionData.loggedin) {
      req.session.user_id = sessionData.user_id;
      req.session.loggedin = sessionData.loggedin;
    }
  }

  if (req.session.loggedin == true) {
    const groupId = req.params.id;
    const connection = await (await pool).getConnection();
    let userInfo = await connection.query("SELECT groups from users where user_id = ?", [req.session.user_id]);
    //userInfo = JSON.parse(userInfo);
    userInfo = userInfo[0];
    if (!userInfo.groups || !userInfo.groups.includes(groupId)) {
      let selectedGroup = await connection.query(`SELECT * FROM groups where group_id = '${groupId}'`);
      selectedGroup = selectedGroup[0];
      if (selectedGroup) {
        if (selectedGroup.visibility == 'public' || (crypto.pbkdf2Sync(req.body['group-pw'], selectedGroup.salt, 99097, 32, 'sha512').toString('hex') == selectedGroup.hashed_password)) {
          connection.query(`UPDATE users SET groups = CASE
          WHEN groups IS NULL THEN '${groupId}'
          WHEN groups = '' THEN '${groupId}'
          ELSE CONCAT(groups, ',', '${groupId}')
      END
      WHERE user_id = '${req.session.user_id}'`);

          connection.query(`UPDATE groups SET members = CASE
          WHEN members IS NULL THEN '${JSON.stringify([req.session.user_id, req.session.name])}'
          WHEN members = '' THEN '${JSON.stringify([req.session.user_id, req.session.name])}'
          ELSE CONCAT(members, ',', '${JSON.stringify([req.session.user_id, req.session.name])}')
      END
      WHERE group_id = '${groupId}'`);
          console.log('inserted')
          const io = req.app.get('socketio');
          io.emit('addUser', groupId, req.session.user_id)
          res.send({ success: true })
        } else {
          console.log(req.body['group-pw'], selectedGroup.salt, crypto.pbkdf2Sync(req.body['group-pw'], selectedGroup.salt, 99097, 32, 'sha512').toString('hex'), selectedGroup.hashed_password)
          res.send({ success: false, reason: 'password wrong' })
        }
      } else {
        res.send({ success: false, reason: 'no such room' })
      }

    } else {
      res.send({ success: false, reason: 'already joined' })
    }
    connection.release()

  } else {
    res.send({ success: false, reason: 'no session' })
  }
})

Router.post('/leave/:id', async (req, res) => {
  /*   const sessionDataHeader = req.headers['x-session-data'];
    if (sessionDataHeader) {
      const sessionData = JSON.parse(sessionDataHeader);
      if (sessionData.user_id && sessionData.loggedin) {
        req.session.user_id = sessionData.user_id;
        req.session.loggedin = sessionData.loggedin;
      }
    } */

  if (req.session.loggedin == true) {
    const groupId = req.params.id;
    console.log(groupId)
    const connection = await (await pool).getConnection();
    let userInfo = await connection.query("SELECT groups, name from users where user_id = ?", [req.session.user_id]);
    //userInfo = JSON.parse(userInfo);
    userInfo = userInfo[0];
    console.log([userInfo.groups].includes(groupId), [userInfo.groups], groupId)
    if (userInfo.groups.includes(groupId)) {
      connection.query(`UPDATE users set groups = CONCAT_WS(',', REPLACE(groups, '${groupId},', '')) WHERE user_id = '${req.session.user_id}'`);
      connection.query(`UPDATE users set groups = CONCAT_WS(',', REPLACE(groups, '${groupId}', '')) WHERE user_id = '${req.session.user_id}'`);
      connection.query(`UPDATE groups SET members = CONCAT_WS(',', REPLACE(members, '[\\"${req.session.user_id}\\",\\"${userInfo.name}\\"],', '')) WHERE group_id = '${groupId}'`);
      connection.query(`UPDATE groups SET members = CONCAT_WS(',', REPLACE(members, '[\\"${req.session.user_id}\\",\\"${userInfo.name}\\"]', '')) WHERE group_id = '${groupId}'`);
      res.send({ success: true })
      connection.release();
      const io = req.app.get('socketio');
      io.emit('removeUser', groupId, req.session.user_id)
    } else {
      res.send({ success: false })
    }

  } else {
    res.send({ success: false })
  }
})

Router.post('/bring-groups', async (req, res) => {
  const connection = await (await pool).getConnection();
  const groupList = await connection.query("SELECT group_id, name, leader, visibility, explanation, date, members, max_members, tags, color, goal_hr, average_hr, likes, font FROM GROUPS");
  let groupWithUser = [];
  let likedList = [];
  groupList.forEach((group, index) => {
    if (group.members && group.members.includes(req.session.user_id)) {
      groupWithUser.push(group.group_id);
    }

    if (group.likes && group.likes.includes(req.session.user_id)) {
      likedList.push(group.group_id);
    }
  });
  console.log([groupList, req.session.user_id, groupWithUser])
  res.send([groupList, req.session.user_id, groupWithUser]);
  connection.release();
})

Router.post('/like/:id', async (req, res) => {
  if (req.session.loggedin) {
    const groupId = req.params.id;
    const connection = await (await pool).getConnection();
    let groupInfo = await connection.query(`SELECT likes from groups where group_id = '${groupId}'`);
    groupInfo = groupInfo[0];
    console.log(groupInfo)
    console.log(groupInfo.likes)
    if (!groupInfo.likes || !groupInfo.likes.includes(req.session.user_id)) {
      const query1 = await connection.query(`UPDATE groups SET likes = CASE
      WHEN likes IS NULL THEN '${req.session.user_id}'
      WHEN likes = '' THEN '${req.session.user_id}'
      ELSE CONCAT(likes, ',', '${req.session.user_id}')
      END
      WHERE group_id = '${groupId}'`);
      if (query1.affectedRows >= 1) {
        res.send({ state: 'liked' })
      }
    } else if (groupInfo.likes && groupInfo.likes.includes(req.session.user_id)) {
      const query1 = await connection.query(`UPDATE groups set likes = CONCAT_WS(',', REPLACE(likes, '${req.session.user_id},', '')) WHERE group_id = '${groupId}'`);
      const query2 = await connection.query(`UPDATE groups set likes = CONCAT_WS(',', REPLACE(likes, '${req.session.user_id}', '')) WHERE group_id = '${groupId}'`);
      /* if(query.affectedRows) */
      if (query1.affectedRows + query2.affectedRows >= 1) {
        res.send({ state: 'unliked' })
      }
      console.log(query1.affectedRows, query2.affectedRows);
    } else {
      res.send({ state: 'fail' })
    }
    connection.release();
  }
})

module.exports = Router;