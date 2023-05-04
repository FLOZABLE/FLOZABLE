const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');
const axios = require("axios")

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

module.exports = Router;