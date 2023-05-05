const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');

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
  const connection = await (await pool).getConnection();
  console.log(req.body)
  /* var group = {
    name: req.body,
    email: email,
    hashed_password: hashed[1],
    salt: hashed[0],
  } */
  //connection.query('INSERT INTO groups SET ?', user);
})

Router.get('/join', (req, res) => {
  if(req.session.loggedin == true) {
    res.render('group/create', {loggedin: true});
  } else {
    res.render('group/create', {loggedin: false});
  }
})

module.exports = Router;