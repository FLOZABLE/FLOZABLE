const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');

Router.get("/stats", async (req, res) => {
  /* if(!req.session.loggedin) {
    return res.redirect('/myaccount');
  } */
  res.render("dashboards/stats.ejs", {userInfo: req.session.userInfo});
})

Router.get("/groups", async (req, res) => {
  /* if(!req.session.loggedin) {
    return res.redirect('/myaccount');
  } */
  res.render("dashboards/groups.ejs", {userInfo: req.session.userInfo});
})

Router.get("/planner", async (req, res) => {
  /* if(!req.session.loggedin) {
    return res.redirect('/myaccount');
  } */
  res.render("dashboards/analytics.ejs", {userInfo: req.session.userInfo});
})

Router.get("/leaderboard", async (req, res) => {
  /* if(!req.session.loggedin) {
    return res.redirect('/myaccount');
  } */
  res.render("dashboards/analytics.ejs", {userInfo: req.session.userInfo});
})

Router.get("/analytics", async (req, res) => {
  /* if(!req.session.loggedin) {
    return res.redirect('/myaccount');
  } */
  res.render("dashboards/analytics.ejs", {userInfo: req.session.userInfo});
})

Router.get("/analytics", async (req, res) => {
  /* if(!req.session.loggedin) {
    return res.redirect('/myaccount');
  } */
  res.render("dashboards/analytics.ejs", {userInfo: req.session.userInfo});
})

Router.get("/analytics", async (req, res) => {
  /* if(!req.session.loggedin) {
    return res.redirect('/myaccount');
  } */
  res.render("dashboards/analytics.ejs", {userInfo: req.session.userInfo});
})

Router.get("/analytics", async (req, res) => {
  /* if(!req.session.loggedin) {
    return res.redirect('/myaccount');
  } */
  res.render("dashboards/analytics.ejs", {userInfo: req.session.userInfo});
})

Router.get("/analytics", async (req, res) => {
  /* if(!req.session.loggedin) {
    return res.redirect('/myaccount');
  } */
  res.render("dashboards/analytics.ejs", {userInfo: req.session.userInfo});
})

Router.get("/groups", async (req, res) => {
  if(!req.session.loggedin) {
    return res.redirect('/myaccount');
  }
  res.render("dashboard/groups", {userInfo: req.session.userInfo});
})

Router.get("/myaccount", async (req, res) => {
  if(!req.session.loggedin) {
    return res.redirect('/myaccount');
  }
  const connection = await (await pool).getConnection();
  let userInfo = await connection.query(`SELECT user_id, myinfo, name, email from users where user_id = "${req.session.user_id}"`)
  userInfo = userInfo[0];
  console.log(userInfo);
  res.render("dashboard/myaccount", {userInfo: req.session.userInfo});
})

Router.get("/myaccount/edit", async(req, res) => {
  if(!req.session.loggedin) {
    return res.redirect('/myaccount');
  }
  const connection = await (await pool).getConnection();
  let userInfo = await connection.query(`SELECT user_id, myinfo, name, email from users where user_id = "${req.session.user_id}"`)
  userInfo = userInfo[0];
  console.log(userInfo);
  res.render("dashboard/edit", {userInfo: req.session.userInfo});
})

module.exports = Router;