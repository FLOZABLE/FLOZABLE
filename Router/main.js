const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');

Router.get("/", async (req, res) => {
  if (req.session.loggedin) {
    res.render("index", {loggedIn: true});
  } else if (req.signedCookies.userId) {
    const connection = await (await pool).getConnection();
    let userInfo = await connection.query('SELECT name, email, myinfo FROM users where user_id = ?', [req.signedCookies.userId]);
    connection.release();
    userInfo = userInfo[0];
    if (userInfo) {
      req.session.user_id = req.signedCookies.userId;
      req.session.name = userInfo.name;
      req.session.loggedin = true;
      req.session.userInfo = {userId: req.signedCookies.userId, name: userInfo.name, loggedin: true, email: userInfo.email, myinfo: userInfo.myinfo};
      res.render('index', {loggedIn: true});
    } else {
      res.render('index', {loggedIn: false});
    }
  } else {
    res.render("index", {loggedIn: false});
  }
})

Router.get('/privacy-policy', async(req, res) => {
  res.render("privacy-policy");
})

Router.get('/terms-of-use', async(req, res) => {
  res.render("terms-of-use");
})

Router.get('/contact', async(req, res) => {
  res.render("contact", {});
})
Router.get('/robots.txt', (req, res) => {
  res.render("robots.txt");
});

Router.get('/sitemap.xmal', (req, res) => {
  res.render('sitemap.xml');
});

Router.get('/ads.txt', (req, res) => {
  res.render('ads.txt');
});

module.exports = Router;