const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { autoSignin } = require("../Utils/tool");

Router.get("/ranking/user", async (req, res) => {
  try {
    const {userId, mode, date} = req.query;
    console.log(userId, mode, date, 'gdddd');
    const connection = pool.promise();

    //const [userRankings] = await connection.query(`SELECT `)
    res.send({success: false})
  } catch (err) {
    console.log(err);
  }
});

module.exports = Router;
