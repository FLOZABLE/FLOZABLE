const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');
const account = require('./account');
const path = require('path');

/* Router.get("/stats", async(req, res) => {
  res.sendFile(path.join(__dirname, '..', 'app/build', 'index.html'));
}) */

Router.get("/*", (req, res) => {
  console.log(req.session.loggedin, req.signedCookies)
  account.autoSignin(req, res, (() => {
    res.sendFile(path.join(__dirname, 'app/build', 'index.html'));
  })
  );
})

Router.get("/stats", async (req, res) => {
  account.autoSignin(req, res, (() => {
    res.render("dashboards/stats.ejs", { userInfo: req.session.userInfo });
  }),
    (() => {
      res.redirect('/account/signin');
    })
  );
})

Router.get("/groups", async (req, res) => {
  account.autoSignin(req, res, (() => {
    res.render("dashboards/groups.ejs", { userInfo: req.session.userInfo });
  }), (() => {
    res.redirect('/account/signin');
  }))
})

Router.get("/groups/create", async (req, res) => {
  account.autoSignin(req, res, (() => {
    res.render("dashboards/groups-create.ejs", { userInfo: req.session.userInfo });
  }), (() => {
    res.redirect('/account/signin');
  }))
})

/* Router.get("/leaderboard", async (req, res) => {
  account.autoSignin(req, res, (() => {
    res.render("dashboards/analytics.ejs", {userInfo: req.session.userInfo});
  }), (() => {
    res.redirect('/account/signin');
  }))
}) */

Router.get("/planner", async (req, res) => {
  account.autoSignin(req, res, (() => {
    res.render("dashboards/planner.ejs", { userInfo: req.session.userInfo });
  }), (() => {
    res.redirect('/account/signin');
  }))
})

module.exports = Router;