const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');
const crypto = require("crypto");

function hashing(password) {
  let salt = crypto.randomBytes(32).toString('hex')
  return [salt, crypto.pbkdf2Sync(password, salt, 99097, 32, 'sha512').toString('hex')]
}

Router.get("/", async (req, res) => {
  if (req.session.loggedin == true) {
    res.render("group/groups", { loggedin: true });
  } else {
    res.render("group/groups", { loggedin: false });
  }
})

Router.get('/create', (req, res) => {
  if (req.session.loggedin == true) {
    res.render('group/create', { loggedin: true });
  } else {
    res.render('group/create', { loggedin: false });
  }
})

Router.post('/create-validate', async (req, res) => {
  /* if(!req.session.loggedin){
    return res.redirect("/account");
  } */

  function generateGroupId() {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000);
    return `${timestamp}-${randomNum}`;
  }

  const connection = await (await pool).getConnection();
  let hashed = hashing(req.body['password']);
  let group = req.body;
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
    leader: req.session.email,
    members: req.session.email,
    color: group.color,
    goal_hr: group.goal_hr
  };
  res.send(true);

  connection.query(query, values, (error, results, fields) => {
    if (error) throw error;
    console.log(results);
  });

  connection.query(`UPDATE users SET groups = CASE
  WHEN groups IS NULL THEN '${values.group_id}'
  WHEN groups = '' THEN '${values.group_id}'
  ELSE CONCAT(groups, ',', '${values.group_id}')
END
WHERE email = '${req.session.email}'`);

  connection.release();
})

Router.post('/join/:id', async (req, res) => {
  const sessionDataHeader = req.headers['x-session-data'];
  if (sessionDataHeader) {
    const sessionData = JSON.parse(sessionDataHeader);
    if (sessionData.email && sessionData.loggedin) {
      req.session.email = sessionData.email;
      req.session.loggedin = sessionData.loggedin;
    }
  }

  if (req.session.loggedin == true) {
    const groupId = req.params.id;
    const connection = await (await pool).getConnection();
    let userInfo = await connection.query("SELECT groups from users where email = ?", [req.session.email]);
    //userInfo = JSON.parse(userInfo);
    userInfo = userInfo[0];
    if (!userInfo.groups.includes(groupId)) {
      let selectedGroup = await connection.query(`SELECT * FROM groups where group_id = '${groupId}'`);
      selectedGroup = selectedGroup[0];
      if (selectedGroup) {
        if(selectedGroup.visibility == 'public') {
          connection.query(`UPDATE users SET groups = CASE
          WHEN groups IS NULL THEN '${groupId}'
          WHEN groups = '' THEN '${groupId}'
          ELSE CONCAT(groups, ',', '${groupId}')
      END
      WHERE email = '${req.session.email}'`);
  
          connection.query(`UPDATE groups SET members = CASE
          WHEN members IS NULL THEN '${req.session.email}'
          WHEN members = '' THEN '${req.session.email}'
          ELSE CONCAT(members, ',', '${req.session.email}')
      END
      WHERE group_id = '${groupId}'`);
          console.log('inserted')
          res.send({ success: true })
        } else if(crypto.pbkdf2Sync(req.body['group-pw'], selectedGroup.salt, 99097, 32, 'sha512').toString('hex') == selectedGroup.hashed_password){
          connection.query(`UPDATE users SET groups = CASE
          WHEN groups IS NULL THEN '${groupId}'
          WHEN groups = '' THEN '${groupId}'
          ELSE CONCAT(groups, ',', '${groupId}')
      END
      WHERE email = '${req.session.email}'`);
  
          connection.query(`UPDATE groups SET members = CASE
          WHEN members IS NULL THEN '${req.session.email}'
          WHEN members = '' THEN '${req.session.email}'
          ELSE CONCAT(members, ',', '${req.session.email}')
      END
      WHERE group_id = '${groupId}'`);
          console.log('inserted')
          res.send({ success: true })
        } else {
          console.log(req.body['group-pw'], selectedGroup.salt, crypto.pbkdf2Sync(req.body['group-pw'], selectedGroup.salt, 99097, 32, 'sha512').toString('hex'), selectedGroup.hashed_password)
          res.send({success: false, reason: 'password wrong'})
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
      if (sessionData.email && sessionData.loggedin) {
        req.session.email = sessionData.email;
        req.session.loggedin = sessionData.loggedin;
      }
    } */

  if (req.session.loggedin == true) {
    const groupId = req.params.id;
    console.log(groupId)
    const connection = await (await pool).getConnection();
    let userInfo = await connection.query("SELECT groups from users where email = ?", [req.session.email]);
    //userInfo = JSON.parse(userInfo);
    userInfo = userInfo[0];
    console.log([userInfo.groups].includes(groupId), [userInfo.groups], groupId)
    if (userInfo.groups.includes(groupId)) {
      connection.query(`UPDATE users set groups = CONCAT_WS(',', REPLACE(groups, '${groupId},', '')) WHERE email = '${req.session.email}'`);
      connection.query(`UPDATE users set groups = CONCAT_WS(',', REPLACE(groups, '${groupId}', '')) WHERE email = '${req.session.email}'`);
      connection.query(`UPDATE groups set members = CONCAT_WS(',', REPLACE(members, '${req.session.email},', '')) WHERE group_id = '${groupId}'`);
      connection.query(`UPDATE groups set members = CONCAT_WS(',', REPLACE(members, '${req.session.email}', '')) WHERE group_id = '${groupId}'`);
      res.send({ success: true })
      connection.release()
    } else {
      res.send({ success: false })
    }

  } else {
    res.send({ success: false })
  }
})

Router.post('/bring-groups', async (req, res) => {
  const connection = await (await pool).getConnection();
  const groupList = await connection.query("SELECT group_id, name, leader, visibility, explanation, date, members, max_members, tags, color, goal_hr, average_hr, likes FROM GROUPS");
  let groupWithUser = [];
  let likedList = []
  groupList.forEach((group, index) => {
    if(group.members && group.members.includes(req.session.email)) {
      groupWithUser.push(group.group_id);
    }

    if(group.likes && group.likes.includes(req.session.email)){
      likedList.push(group.group_id);
    }
  })
  console.log(likedList)
  res.send([groupList, req.session.email, groupWithUser]);
  connection.release();
})

Router.post('/like/:id', async(req, res) => {
  if(req.session.loggedin) {
    const groupId = req.params.id;
    const connection = await (await pool).getConnection();
    let groupInfo = await connection.query(`SELECT likes from groups where group_id = '${groupId}'`);
    groupInfo = groupInfo[0];
    console.log(groupInfo)
    console.log(groupInfo.likes)
    if(!groupInfo.likes ||!groupInfo.likes.includes(req.session.email)){
      connection.query(`UPDATE groups SET likes = CASE
      WHEN likes IS NULL THEN '${req.session.email}'
      WHEN likes = '' THEN '${req.session.email}'
      ELSE CONCAT(likes, ',', '${req.session.email}')
      END
      WHERE group_id = '${groupId}'`);
      res.send({success: true, state: 'liked'})
    } else {
      connection.query(`UPDATE groups set likes = CONCAT_WS(',', REPLACE(likes, '${req.session.email},', '')) WHERE group_id = '${groupId}'`);
      connection.query(`UPDATE groups set likes = CONCAT_WS(',', REPLACE(likes, '${req.session.email}', '')) WHERE group_id = '${groupId}'`);
      res.send({success: true, state: 'unliked'})
    }
    connection.release();
  }
})

module.exports = Router;