const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');
const {autoSignin} = require('./account');

Router.get("/", async (req, res) => {
  autoSignin(req, res, (() => res.render('index', {loggedIn: true})), (() => res.render('index', {loggedIn: false})));
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