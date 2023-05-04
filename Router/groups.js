const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');
const axios = require("axios")

Router.get("/", async (req, res) => {
  if(req.session.loggedin == true){
    res.render("groups", {loggedin: true});
  } else {
    res.render("groups", {loggedin: false});
  }
})

Router.get('/create', (req, res) => {
  if(req.session.loggedin == true) {
    res.render('create', {loggedin: true});
  } else {
    res.render('create', {loggedin: false});
  }
})

module.exports = Router;