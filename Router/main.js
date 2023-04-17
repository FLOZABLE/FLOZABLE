const express = require("express");
const Router = express.Router();
const fs = require("fs");

Router.get("/", async (req, res) => {
  
  res.render('index')
})

Router.get("/about", async (req, res) => {
  
  res.render('about')
})


Router.post("/subscribe/:email", async (req, res) => {
  const connection = await (await pool).getConnection();
  const email = req.params.email;
  console.log(email)
  let subscibe = await connection.query("INSERT INTO subscribers set ?", [{email: email}])
})

Router.get('/about-us', async(req, res) => {
  res.render("about");
})

Router.get('/work', async(req, res) => {
  res.render("work");
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