const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');

Router.get("/", async (req, res) => {
  if(req.session.loggedin == true){
    const connection = await (await pool).getConnection();
    let user_info = await connection.query('SELECT * FROM users WHERE email = ?', req.session.email);
    user_info = user_info[0]
    res.render("myaccount", {loggedin: true, account: {name: user_info.name, email: user_info.email, myinfo: user_info.myinfo, picture: user_info.profile_picture}});
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
  } else {
    res.redirect("/account")
  }
})

Router.post("/update", async (req, res) => {
  if(req.session.loggedin == true){
    const connection = await (await pool).getConnection();
    const { picture } = req.body;
    const binaryData = Buffer.from(picture, 'base64');
    console.log(binaryData)
    // insert the image data into the database
    /* const sql = 'INSERT INTO profile_pics (user_id, picture) VALUES (?, ?)';
    const values = [userId, binaryData]; */
    const updateProfile = await connection.query("UPDATE users SET profile_picture = ? WHERE email = ?", [binaryData, req.session.email]);

  } else {
    res.redirect("/account")
  }
})

module.exports = Router;