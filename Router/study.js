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
    subject.datum_point = new Date().getTime();
    subject.timeline = [];
    const selectQuery = "SELECT subjects FROM users WHERE email = ?";
    const selectParams = [req.session.email];
    const select = await connection.query(selectQuery, selectParams);
    const subjects = JSON.parse(select[0].subjects || "[]");
    subjects.push(subject);
    const updatedJson = JSON.stringify(subjects);
    
    // prepare the update statement to update the subjects column
    const updateQuery = "UPDATE users SET subjects = ? WHERE email = ?";
    const updateParams = [updatedJson, req.session.email];
    
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
  const selectQuery = "SELECT subjects, groups FROM users WHERE email = ?";
  const selectParams = [req.session.email];
  let select = await connection.query(selectQuery, selectParams);
  select = select[0];
  const subjects = JSON.parse(select.subjects || "[]");
  const groups = select.groups ? select.groups.split(",") : [];
  const startTime = new Date().getTime();
  const previousTimeline = subjects[index].timeline[subjects[index].timeline.length - 1];
  const datumPoint = previousTimeline ? previousTimeline[1]: subjects[index].datum_point;
  console.log(startTime, datumPoint)
  subjects[index].timeline.push([startTime - datumPoint]);
  console.log(subjects[index].timeline[subjects[index].timeline.length - 1]);
  //subjects[index].stop = null;
  const updatedJson = JSON.stringify(subjects);
  const update = await connection.query( "UPDATE users SET subjects = ? WHERE email = ?", [updatedJson,req.session.email]);
  groups.length != 0 && io.to(groups).emit('studying', req.session.email);
  connection.release();
  res.send({success: true})
})

Router.post('/stop', async(req, res) => {
  const connection = await (await pool).getConnection();
  const index = req.body.index;
  const selectQuery = "SELECT subjects FROM users WHERE email = ?";
  const selectParams = [req.session.email];
  let select = await connection.query(selectQuery, selectParams);
  select = select[0];
  const subjects = JSON.parse(select.subjects || "[]");
  const stopTime = new Date().getTime();
  const previousTimeline = subjects[index].timeline[subjects[index].timeline.length - 1];
  const datumPoint = previousTimeline[1] ? previousTimeline[1]: subjects[index].datum_point;
  subjects[index].timeline[subjects[index].timeline.length - 1].push(stopTime - datumPoint);
  subjects[index].today = subjects[index].today + subjects[index].timeline[subjects[index].timeline.length - 1][1] - subjects[index].timeline[subjects[index].timeline.length - 1][0];
  subjects[index].total = subjects[index].total + subjects[index].today;
  //subjects[index].start = null
  const updatedJson = JSON.stringify(subjects);
  const update = await connection.query( "UPDATE users SET subjects = ? WHERE email = ?", [updatedJson,req.session.email]);

  connection.release();
})

Router.post('/bring-subjects', async(req, res) => {
  if(req.session.loggedin == true) {
    const connection = await (await pool).getConnection();
    const subjects = await connection.query("SELECT subjects FROM USERS WHERE email = ?", [req.session.email]);
    console.log(subjects[0]);
    connection.release();
    res.send(subjects[0].subjects);
  } else {
    res.send("not loggedin");
  }
})

module.exports = Router;