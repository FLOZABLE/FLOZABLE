const express = require("express");
const Router = express.Router();

Router.post('/dashboard-header', (req, res) => {
  res.render('elements/dashboard-header', {userInfo: req.session.userInfo});
});

Router.post('/sidebar', (req, res) => {
  res.render('elements/sidebar', {userInfo: req.session.userInfo});
  console.log(req.session.userInfo)
});

module.exports = Router;