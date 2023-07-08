const express = require('express');
const Router = express.Router();
const pool = require('../model/pool');
const crypto = require("crypto");

function hashing(password) {
  let salt = crypto.randomBytes(32).toString('hex');
  return [salt, crypto.pbkdf2Sync(password, salt, 99097, 32, 'sha512').toString('hex')];
}

function generateId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 15;
  let groupId = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    groupId += characters.charAt(randomIndex);
  }

  return groupId;
}

Router.get('/signin', (req, res) => {
  if (req.session.loggedin) {
    res.render("authentication/signin/illustration", { loggedin: true });
  } else {
    res.render("authentication/signin/illustration", { loggedin: false });
  }
});

Router.post('/signin-authentication', async (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;

  // Sanitize inputs
  let sanitizedEmail = email.replace(/[^a-z0-9!?@.]/gi, '');
  let sanitizedPassword = password.replace(/[^a-z0-9!?@.]/gi, '');

  const connection = await (await pool).getConnection();

  const matching_email = await connection.query('SELECT * FROM users WHERE email = ?', sanitizedEmail);

  connection.release();

  if (matching_email.length === 0) {
    console.log("no email");
    res.send({ success: false, signin_err_msg: "NO SUCH USER", signup_err_msg: "" });
    return;
  }

  const hashedPassword = crypto.pbkdf2Sync(sanitizedPassword, matching_email[0].salt, 99097, 32, 'sha512').toString('hex');

  if (hashedPassword === matching_email[0].hashed_password) {
    const userId = matching_email[0].user_id;

    // Generate a new session ID
    req.session.regenerate((err) => {
      if (err) {
        console.log("Error regenerating session ID:", err);
        res.send({ success: false, signin_err_msg: "SESSION ERROR", signup_err_msg: "" });
        return;
      }

      req.session.user_id = userId;
      req.session.name = matching_email[0].name;
      req.session.loggedin = true;
      req.session.userInfo = {userId: userId, name: matching_email[0].name, loggedin: true, email: email, myinfo: matching_email[0].myinfo};
      console.log("login success");
      console.log(req.session.user_id, req.session.loggedin);

      res.cookie("userId", userId, {
        maxAge: 1000 * 60 * 10,
        secure: true,
        httpOnly: true,
        signed: true,
      });

      res.send({ success: true });
    });
  } else {
    res.send({ success: false, signin_err_msg: "INVALID PASSWORD", signup_err_msg: "" });
  }
});

Router.post('/signup-authentication', async (req, res, next) => {
  let email = req.body.email;
  let name = req.body.name;
  let password = req.body.password;
  const timezone = req.body.timezone;

  // Sanitize inputs
  let sanitizedEmail = email.replace(/[^a-z0-9!?@.]/gi, '');
  let sanitizedName = name.replace(/[^a-z0-9!?@.]/gi, '');
  let sanitizedPassword = password.replace(/[^a-z0-9!?@.]/gi, '');

  const connection = await (await pool).getConnection();

  let check_email = await connection.query("SELECT * FROM users WHERE email = ?", sanitizedEmail);

  if (check_email.length !== 0) {
    console.log("not new");
    res.send({ success: false, signup_err_msg: "EMAIL ALREADY IN USE", signin_err_msg: "" });
    return;
  }

  let hashed = hashing(sanitizedPassword);

  const userId = generateId();
  var user = {
    name: sanitizedName,
    email: sanitizedEmail,
    hashed_password: hashed[1],
    salt: hashed[0],
    user_id: userId,
    timezone: timezone
  };

  connection.query('INSERT INTO users SET ?', user);

  req.session.regenerate((err) => {
    if (err) {
      console.log("Error regenerating session ID:", err);
      res.send({ success: false, signup_err_msg: "SESSION ERROR", signin_err_msg: "" });
      return;
    }

    req.session.user_id = userId;
    req.session.loggedin = true;
    req.session.name = sanitizedName;
    req.session.userInfo = {userId: userId, name: sanitizedName, loggedin: true, email: email}

    res.send({ success: true });
    console.log(req.session)
  });

  connection.release();
});

Router.get('/signup', function (req, res) {
  if (req.session.loggedin) {
    res.render('authentication/signup/illustration', {
      title: 'Registration Page',
      name: '',
      email: '',
      password: '',
      button: "SIGN IN",
      path: "/account",
    });
  } else {
    res.render('authentication/signup/illustration', {
      title: 'Registration Page',
      name: '',
      email: '',
      password: '',
      button: "SIGN IN",
      path: "/account",
    });
  }
});

Router.get('/logout', function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error destroying session:", err);
    }
    res.clearCookie('userId');
    res.redirect('/');
  });
});

Router.post('/bring-my-info', async(req, res) => {
  if(!req.session.loggedin) {
    return res.send({success: false, reason: 'no session'})
  }

  const connection = await (await pool).getConnection();

  let userInfo = await connection.query(`SELECT name, myinfo, groups, user_id, plan, subjects from users WHERE user_id = "${req.session.user_id}"`);
  userInfo = userInfo[0];
  let base64Image;
  let binaryData = userInfo.profile_picture;

  if(binaryData){
    base64Image = binaryData.toString('base64');
    userInfo.profile_picture = base64Image;
  }
  res.send({success: true, userInfo: userInfo});
  connection.release();
})
module.exports = Router;
