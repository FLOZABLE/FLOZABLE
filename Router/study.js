const express = require("express");
const Router = express.Router();
const pool = require('../model/pool');

Router.get("/", async(req, res) => {
  res.render("study/study", {
    loggedin: req.session.loggedin || false,
  });
});

Router.post('/add-subject', async (req, res) => {
  if (!req.session.loggedin) {
    return res.sendStatus(401);
  }

  const connection = await (await pool).getConnection();
  const subject = {
    ...req.body,
    today: 0,
    total: 0,
    datum_point: Math.floor(new Date().getTime() / 1000),
    timeline: [],
  };

  const selectQuery = "SELECT subjects FROM users WHERE user_id = ?";
  const selectParams = [req.session.user_id];
  const select = await connection.query(selectQuery, selectParams);
  const subjects = JSON.parse(select[0].subjects || "[]");
  subjects.push(subject);
  const updatedJson = JSON.stringify(subjects);

  const updateQuery = "UPDATE users SET subjects = ? WHERE user_id = ?";
  const updateParams = [updatedJson, req.session.user_id];
  const update = await connection.query(updateQuery, updateParams);
  connection.release();

  console.log(`Updated ${update.affectedRows} row(s)`);

  res.sendStatus(200);
});

Router.post('/start', async (req, res) => {
  if (!req.session.loggedin) {
    return res.send({ success: false, reason: 'not auth' });
  }

  const io = req.app.get('socketio');
  const connection = await (await pool).getConnection();
  const index = req.body.index;

  const selectQuery = "SELECT subjects, groups FROM users WHERE user_id = ?";
  const selectParams = [req.session.user_id];
  const select = await connection.query(selectQuery, selectParams);
  const subjects = JSON.parse(select[0].subjects || "[]");
  const groups = select[0].groups ? select[0].groups.split(",") : [];
  const startTime = Math.floor(new Date().getTime() / 1000);
  const storedTime = startTime - subjects[index].datum_point;
  subjects[index].timeline.push([storedTime]);
  const updatedJson = JSON.stringify(subjects);
  const updateQuery = "UPDATE users SET subjects = ? WHERE user_id = ?";
  const updateParams = [updatedJson, req.session.user_id];
  const update = await connection.query(updateQuery, updateParams);

  if (groups.length !== 0) {
    console.log(`send signals to ${groups}`)
    io.to().emit('studying', req.session.user_id, groups);
  }

  connection.release();
  res.send({ success: true });
});

Router.post('/stop', async (req, res) => {
  if (!req.session.loggedin) {
    return res.send({ success: false, reason: 'not auth' });
  }

  const io = req.app.get('socketio');
  const connection = await (await pool).getConnection();
  const index = req.body.index;

  const selectQuery = "SELECT subjects, groups FROM users WHERE user_id = ?";
  const selectParams = [req.session.user_id];
  const select = await connection.query(selectQuery, selectParams);
  const groups = select[0].groups ? select[0].groups.split(",") : [];

  if (groups.length !== 0) {
    io.to(groups).emit('stopstudying', req.session.user_id, groups);
  }

  const subjects = JSON.parse(select[0].subjects || "[]");
  const stopTime = Math.floor(new Date().getTime() / 1000);
  const storedTime = stopTime - subjects[index].datum_point;
  subjects[index].timeline[subjects[index].timeline.length - 1].push(storedTime);
  subjects[index].today += subjects[index].timeline[subjects[index].timeline.length - 1][1] - subjects[index].timeline[subjects[index].timeline.length - 1][0];
  subjects[index].total += subjects[index].today;
  const updatedJson = JSON.stringify(subjects);
  const updateQuery = "UPDATE users SET subjects = ? WHERE user_id = ?";
  const updateParams = [updatedJson, req.session.user_id];
  const update = await connection.query(updateQuery, updateParams);

  res.send({ success: true });
  connection.release();
});

Router.post('/bring-subjects', async (req, res) => {
  if (!req.session.loggedin) {
    return res.send("not loggedin");
  }

  const connection = await (await pool).getConnection();
  const subjects = await connection.query("SELECT subjects FROM users WHERE user_id = ?", [req.session.user_id]);
  connection.release();

  res.send(subjects[0].subjects);
});

module.exports = Router;