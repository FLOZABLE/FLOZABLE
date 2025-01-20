const express = require("express");
const { autoSignin } = require("../API/auth");
const Router = express.Router();

Router.get("/sitemap.xmal", (req, res) => {
  try {
    res.render("sitemap.xml");
  } catch (err) {
    console.log(err);
  }
});

module.exports = Router;
