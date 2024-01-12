const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");

Router.get("/bring-rooms", async (req, res) => {
  autoSignin(req, res, (async () => {
    const userId = req.session.user_id;
    res.send({ success: true, rooms, readStatus })
  }));
});

module.exports = Router;