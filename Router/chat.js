const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');

module.exports = function(io) { // accept io instance as a parameter
  Router.get("/", async (req, res) => {
    if (req.session.loggedin == true) {
      const connection = await (await pool).getConnection();
      let user_info = await connection.query('SELECT * FROM users WHERE email = ?', req.session.email);
      user_info = user_info[0]
      res.render("chat", { loggedin: true });
      connection.release();
    } else {
      res.redirect("/account");
    }
  });

  io.on("connection", (socket) => { // use io instance to handle socket.io connections
    console.log("a user connected");

    // Handle incoming messages
    socket.on("chat message", (msg) => {
      console.log("message: " + msg);

      // Broadcast the message to all connected clients
      io.emit("chat message", msg);
    });

    // Handle disconnects
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });

  return Router;
};
