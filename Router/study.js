const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');
const axios = require("axios");
const { stringify } = require("querystring");

Router.get("/", async (req, res) => {
  if(req.session.loggedin == true){
    res.render("study/study", {
      loggedin: true, 
    });
  } else {
    res.render("study/study", {
      loggedin: false, 
    });
  }
});

Router.get("/", async (req, res) => {
  if(req.session.loggedin == true){
    res.render("study/study", {
      loggedin: true, 
    });
  } else {
    res.render("study/study", {
      loggedin: false, 
    });
  }
});


Router.post('/add-subject', async(req, res) => {
  if(req.session.loggedin == true) {
    const connection = await (await pool).getConnection();
    const subject = req.body;
    subject.today = 0;
    subject.total = 0;
    subject.datum_point = Math.floor(new Date().getTime() / 1000);
    subject.timeline = [];
    const selectQuery = "SELECT subjects FROM users WHERE user_id = ?";
    const selectParams = [req.session.user_id];
    const select = await connection.query(selectQuery, selectParams);
    const subjects = JSON.parse(select[0].subjects || "[]");
    subjects.push(subject);
    const updatedJson = JSON.stringify(subjects);
    
    // prepare the update statement to update the subjects column
    const updateQuery = "UPDATE users SET subjects = ? WHERE user_id = ?";
    const updateParams = [updatedJson, req.session.user_id];
    
    // execute the update statement
    const update = await connection.query(updateQuery, updateParams);
    connection.release();
    
    console.log(`Updated ${update.affectedRows} row(s)`);
  }
  res.sendStatus(200);
});

Router.post('/start', async(req, res) => {
  if(req.session.loggedin != true){
    return res.send({success: false, reason: 'not auth'});
  }
  const io = req.app.get('socketio');
  const connection = await (await pool).getConnection();
  const index = req.body.index;
  const selectQuery = "SELECT subjects, groups FROM users WHERE user_id = ?";
  const selectParams = [req.session.user_id];
  let select = await connection.query(selectQuery, selectParams);
  select = select[0];
  const subjects = JSON.parse(select.subjects || "[]");
  const groups = select.groups ? select.groups.split(",") : [];
  const startTime = Math.floor(new Date().getTime() / 1000);
  const previousTimeline = subjects[index].timeline[subjects[index].timeline.length - 1];
  const storedTime = startTime - subjects[index].datum_point;
  console.log(startTime, storedTime)
  subjects[index].timeline.push([storedTime]);
  console.log(subjects[index].timeline[subjects[index].timeline.length - 1]);
  //subjects[index].stop = null;
  const updatedJson = JSON.stringify(subjects);
  const update = await connection.query( "UPDATE users SET subjects = ? WHERE user_id = ?", [updatedJson,req.session.user_id]);
  groups.length != 0 && io.to(groups).emit('studying', req.session.user_id, groups);
  connection.release();
  res.send({success: true})
})

Router.post('/stop', async(req, res) => {
  if(req.session.loggedin != true){
    return res.send({success: false, reason: 'not auth'});
  }
  const io = req.app.get('socketio');
  const connection = await (await pool).getConnection();
  const index = req.body.index;
  const selectQuery = "SELECT subjects, groups FROM users WHERE user_id = ?";
  const selectParams = [req.session.user_id];
  let select = await connection.query(selectQuery, selectParams);
  select = select[0];
  const groups = select.groups ? select.groups.split(",") : [];
  groups.length != 0 && io.to(groups).emit('stopstudying', req.session.user_id, groups);
  const subjects = JSON.parse(select.subjects || "[]");
  const stopTime = Math.floor(new Date().getTime() / 1000);
  const previousTimeline = subjects[index].timeline[subjects[index].timeline.length - 1];
  const storedTime = stopTime - subjects[index].datum_point;
  console.log(storedTime, stopTime, subjects[index].datum_point)
  subjects[index].timeline[subjects[index].timeline.length - 1].push(storedTime);
  subjects[index].today = subjects[index].today + subjects[index].timeline[subjects[index].timeline.length - 1][1] - subjects[index].timeline[subjects[index].timeline.length - 1][0];
  subjects[index].total = subjects[index].total + subjects[index].today;
  //subjects[index].start = null
  const updatedJson = JSON.stringify(subjects);
  const update = await connection.query( "UPDATE users SET subjects = ? WHERE user_id = ?", [updatedJson,req.session.user_id]);
  res.send({success: true})
  connection.release();
})

Router.post('/bring-subjects', async(req, res) => {
  if(req.session.loggedin == true) {
    const connection = await (await pool).getConnection();
    const subjects = await connection.query("SELECT subjects FROM USERS WHERE user_id = ?", [req.session.user_id]);
    console.log(subjects[0]);
    connection.release();
    res.send(subjects[0].subjects);
  } else {
    res.send("not loggedin");
  }
})

module.exports = Router;