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
})

Router.post('/add-subject', async(req, res) => {
  if(req.session.loggedin == true) {
    const connection = await (await pool).getConnection();
    const subject = req.body;
    subject.today = 0;
    subject.total = 0;
    subject.start = 0;
    subject.end = 0;
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
  const connection = await (await pool).getConnection();
  const information = req.body;
  information.start =  new Date().setMilliseconds(0);
  const selectQuery = "SELECT subjects FROM users WHERE email = ?";
  const selectParams = [req.session.email];
  const select = await connection.query(selectQuery, selectParams);
  const subjects = JSON.parse(select[0].subjects || "[]");
  subjects.push(information);
  const updatedJson = JSON.stringify(subjects);
  console.log(information);
  const update = await connection.query( "UPDATE users SET subjects = ? WHERE email = ?", [JSON.stringify(information),req.session.email]);

  connection.release();
})

Router.post('/stop', async(req, res) => {
  const connection = await (await pool).getConnection();

  const information = JSON.stringify(req.body);
  console.log(information);
  connection.release();
})

Router.post('/bring-subjects', async(req, res) => {
  if(req.session.loggedin == true) {
    const connection = await (await pool).getConnection();
    const subjects = await connection.query("SELECT subjects FROM USERS WHERE email = ?", [req.session.email]);
    console.log(subjects[0]);
    res.send(subjects[0].subjects);
  } else {
    res.send("not loggedin");
  }
})

module.exports = Router;