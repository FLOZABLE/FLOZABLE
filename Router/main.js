const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require("../model/pool");
const { autoSignin } = require("../tool");

Router.get("/", async (req, res) => {
  autoSignin(
    req,
    res,
    () => res.render("index", { loggedIn: true }),
    () => res.render("index", { loggedIn: false })
  );
});

Router.get("/privacy-policy", async (req, res) => {
  autoSignin(
    req,
    res,
    () => res.render("privacy-policy", { loggedIn: true }),
    () => res.render("privacy-policy", { loggedIn: false })
  );
});

Router.get("/terms", async (req, res) => {
  autoSignin(
    req,
    res,
    () => res.render("terms", { loggedIn: true }),
    () => res.render("terms", { loggedIn: false })
  );
});

Router.get("/cookies", async (req, res) => {
  autoSignin(
    req,
    res,
    () => res.render("cookies", { loggedIn: true }),
    () => res.render("cookies", { loggedIn: false })
  );
});

Router.get("/release-notes", async (req, res) => {
  autoSignin(
    req,
    res,
    () => res.render("release-notes", { loggedIn: true }),
    () => res.render("release-notes", { loggedIn: false })
  );
});

Router.get("/contact", async (req, res) => {
  res.render("contact", {});
});
Router.get("/robots.txt", (req, res) => {
  res.render("robots.txt");
});

Router.get("/sitemap.xmal", (req, res) => {
  res.render("sitemap.xml");
});

Router.get("/ads.txt", (req, res) => {
  res.render("ads.txt");
});

Router.get("/reset-password", (req, res) => {
  autoSignin(
    req,
    res,
    () => res.render("reset-password", { loggedIn: true }),
    () => res.render("reset-password", { loggedIn: false })
  );
});

Router.get("/google-signin", (req, res) => {
  autoSignin(
    req,
    res,
    () => res.render("google-signin", { loggedIn: true }),
    () => res.render("google-signin", { loggedIn: false })
  );
});

Router.get("/verify-by-link", (req, res) => {
  autoSignin(
    req,
    res,
    () => res.render("verify-email", { loggedIn: true }),
    () => res.render("verify-email", { loggedIn: false })
  );
});

module.exports = Router;
