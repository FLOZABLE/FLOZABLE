const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');

Router.get("/", async (req, res) => {
  if(req.session.loggedin == true){
    const connection = await (await pool).getConnection();
    let user_info = await connection.query('SELECT * FROM users WHERE email = ?', req.session.email);
    user_info = user_info[0]
    let binaryData = user_info.profile_picture
    let base64Image
    console.log(binaryData, typeof binaryData)
    if(binaryData === null){
      console.log("null detected")
      binaryData = fs.readFileSync('./public/img/default_profile.jpg');
    }

    base64Image = binaryData.toString('base64');

    res.render("myaccount", {loggedin: true, account: {name: user_info.name, email: user_info.email, myinfo: user_info.myinfo, image: base64Image}});

    connection.release();
  } else {
    res.redirect("/account")
  }
})

Router.get("/edit", async (req, res) => {
  if(req.session.loggedin == true){
    const connection = await (await pool).getConnection();
    let user_info = await connection.query('SELECT * FROM users WHERE email = ?', req.session.email);
    user_info = user_info[0]
    let binaryData = user_info.profile_picture
    let base64Image
    console.log(binaryData, typeof binaryData)
    if(binaryData === null){
      console.log("null detected")
      binaryData = fs.readFileSync('./public/img/default_profile.jpg');
    }

    base64Image = binaryData.toString('base64');

    res.render("edit", {loggedin: true, account: {name: user_info.name, email: user_info.email, myinfo: user_info.myinfo, image: base64Image}});
    connection.release();
  } else {
    res.redirect("/account")
  }
})

Router.post("/update", async (req, res) => {
  if(req.session.loggedin == true){
    const connection = await (await pool).getConnection();
    const picture = req.body.picture;
    let binaryData;
    if(picture != null){
      binaryData = Buffer.from(picture, 'base64');
    }
    const name = req.body.name
    const email = req.body.email
    const aboutme = req.body.aboutme
    const programming_skills = JSON.stringify(req.body.programming_skills);
    const programming_lang_skills = JSON.stringify(req.body.programming_lang_skills);
    console.log(name, email, aboutme, programming_skills, programming_lang_skills)
    const update_info = [{name: name, email: email, myinfo: aboutme, profile_picture: binaryData, programming_skills: programming_skills, programming_language_skills: programming_lang_skills}, req.session.email];
    const updateProfile = await connection.query("UPDATE users SET ? WHERE email=?", update_info);
    
    connection.release();
  } else {
    res.redirect("/account")
  }
})

Router.post("/skills", async (req, res) => {
  if(req.session.loggedin == true){
    const connection = await (await pool).getConnection();
    let user_info = await connection.query('SELECT * FROM users WHERE email = ?', req.session.email);
    user_info = user_info[0]
    res.send({programming_skills: user_info.programming_skills, programming_language_skills: user_info.programming_language_skills});
    connection.release();
  } else {
    res.redirect("/account")
  }
})

Router.get("/chat", async (req, res) => {
  if(req.session.loggedin == true){
    const connection = await (await pool).getConnection();
    let user_info = await connection.query('SELECT * FROM users WHERE email = ?', req.session.email);
    user_info = user_info[0]
    res.render("chat", {loggedin: true});
    connection.release();
  } else {
    res.redirect("/account")
  }
})
module.exports = Router;