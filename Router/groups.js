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
  console.log(req.body);
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
    members: JSON.stringify([req.session.email]),
    color: group.color,
    goal_hr: group.goal_hr
  };
  
  connection.query(query, values, (error, results, fields) => {
    if (error) throw error;
    console.log(results);
  });
  
  
  connection.release();
})

Router.get('/join/:id', async(req, res) => {
  if(req.session.loggedin == true) {
    const groupId = req.params.id;
    const connection = await (await pool).getConnection();
    let userInfo = await connection.query("SELECT groups from users where email = ?", [req.session.email]);
    //userInfo = JSON.parse(userInfo);
    userInfo = userInfo[0];
    console.log(userInfo, userInfo.groups)
    if (!userInfo.groups || !userInfo.groups.includes(groupId)) {
      console.log("asdasdsa")
      connection.query(`UPDATE users SET groups = CASE
                      WHEN groups IS NULL THEN '${groupId}'
                      WHEN groups = '' THEN '${groupId}'
                      ELSE CONCAT(groups, ',', '${groupId}')
                  END
                  WHERE email = '${req.session.email}'`);

    }
    
  } else {
    res.render('group/create', {loggedin: false});
  }
})

Router.post('/bring-groups', async(req, res) => {
  const connection = await (await pool).getConnection();
  const groupList = await connection.query("SELECT group_id, name, leader, visibility, explanation, date, members, max_members, tags, color, goal_hr FROM GROUPS");

  res.send(groupList);
  connection.release();
})

module.exports = Router;