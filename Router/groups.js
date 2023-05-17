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
  if(req.session.loggedin == true){
    res.render("group/groups", {loggedin: true});
  } else {
    res.render("group/groups", {loggedin: false});
  }
})

Router.get('/create', (req, res) => {
  if(req.session.loggedin == true) {
    res.render('group/create', {loggedin: true});
  } else {
    res.render('group/create', {loggedin: false});
  }
})

Router.post('/create-validate', async(req, res) => {
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
    hashed_password:  hashed[1],
    salt:  hashed[1],
    date: new Date().getTime(),
    group_id: generateGroupId(),
    leader: req.session.email,
    members: req.session.email,
    color: group.color,
    goal_hr: group.goal_hr
  };
  res.send(200);
  
  connection.query(query, values, (error, results, fields) => {
    if (error) throw error;
    console.log(results);
  });
  
  connection.query(`UPDATE users set groups = '${values.group_id}'`);
  
  connection.release();
})

Router.post('/join/:id', async(req, res) => {
  const sessionDataHeader = req.headers['x-session-data'];
  if (sessionDataHeader) {
    const sessionData = JSON.parse(sessionDataHeader);
    if (sessionData.email && sessionData.loggedin) {
      req.session.email = sessionData.email;
      req.session.loggedin = sessionData.loggedin;
    }
  }
  
  if(req.session.loggedin == true) {
    const groupId = req.params.id;
    const connection = await (await pool).getConnection();
    let userInfo = await connection.query("SELECT groups from users where email = ?", [req.session.email]);
    //userInfo = JSON.parse(userInfo);
    userInfo = userInfo[0];
    if (!userInfo.groups || !userInfo.groups.includes(groupId)) {
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
      res.send({status: 200})

    } else {
      res.send({status: 400})
    }
    
  } else {
    res.send({status: 400})
  }
})

Router.post('/leave/:id', async(req, res) => {
/*   const sessionDataHeader = req.headers['x-session-data'];
  if (sessionDataHeader) {
    const sessionData = JSON.parse(sessionDataHeader);
    if (sessionData.email && sessionData.loggedin) {
      req.session.email = sessionData.email;
      req.session.loggedin = sessionData.loggedin;
    }
  } */
  
  if(req.session.loggedin == true) {
    const groupId = req.params.id;
    console.log(groupId)
    const connection = await (await pool).getConnection();
    let userInfo = await connection.query("SELECT groups from users where email = ?", [req.session.email]);
    //userInfo = JSON.parse(userInfo);
    userInfo = userInfo[0];
    console.log([userInfo.groups].includes(groupId), [userInfo.groups], groupId)
    if ([userInfo.groups].includes(groupId)) {
      console.log('includes')
      connection.query(`UPDATE users set groups = CONCAT_WS(',', REPLACE(groups, '${groupId}', '')) WHERE email = '${req.session.email}'`);
      connection.query(`UPDATE groups set members = CONCAT_WS(',', REPLACE(members, '${req.session.email}', '')) WHERE group_id = '${groupId}'`);
      console.log('inserted')
      res.send({status: 200})

    } else {
      res.send({status: 400})
    }
    
  } else {
    res.send({status: 400})
  }
})

Router.post('/bring-groups', async(req, res) => {
  const connection = await (await pool).getConnection();
  const groupList = await connection.query("SELECT group_id, name, leader, visibility, explanation, date, members, max_members, tags, color, goal_hr, average_hr FROM GROUPS");
  let groupWithUser = [];
  groupList.forEach((group, index) => {
    if(group.members && group.members.includes(req.session.email)) {
      groupWithUser.push(group.group_id);
    }
  })
  console.log(groupWithUser)
  res.send([groupList, req.session.email, groupWithUser]);
  connection.release();
})

module.exports = Router;