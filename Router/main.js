const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');
const { autoSignin } = require("../tool");

Router.get("/", async (req, res) => {
  autoSignin(req, res, (() => res.render('index', {loggedIn: true})), (() => res.render('index', {loggedIn: false})));
})

Router.get('/privacy-policy', async(req, res) => {
  autoSignin(req, res, (() => res.render('privacy-policy', {loggedIn: true})), (() => res.render('privacy-policy', {loggedIn: false})));
})

Router.get('/terms', async(req, res) => {
  autoSignin(req, res, (() => res.render('terms', {loggedIn: true})), (() => res.render('terms', {loggedIn: false})));
})

Router.get('/cookies', async(req, res) => {
  autoSignin(req, res, (() => res.render('cookies', {loggedIn: true})), (() => res.render('cookies', {loggedIn: false})));
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