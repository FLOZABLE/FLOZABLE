const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');

Router.get("/", async (req, res) => {
  if(req.session.loggedin == true){
    res.render("index", {loggedin: true});
  } else {
    res.render("index", {loggedin: false});
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