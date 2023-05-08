const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');
const axios = require("axios")

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
    
    // convert the object to a JSON string
    const subjectJson = JSON.stringify(subject);
    
    // prepare the select statement to get the existing JSON array
    const selectQuery = "SELECT subjects FROM users WHERE email = ?";
    const selectParams = [req.session.email];
    
    // execute the select statement and get the existing JSON array
    const select = await connection.query(selectQuery, selectParams);
    const subjects = JSON.parse(select[0].subjects || "[]");
    
    // add the new JSON object to the existing array
    subjects.push(subject);
    
    // convert the updated array back to a JSON string
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