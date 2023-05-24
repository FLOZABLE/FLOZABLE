const express = require('express');
const Router = express.Router();
const pool = require('../model/pool');
const crypto = require("crypto");

function hashing(password) {
  let salt = crypto.randomBytes(32).toString('hex')
  return [salt, crypto.pbkdf2Sync(password, salt, 99097, 32, 'sha512').toString('hex')]
}

function generateId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 15;
  let groupId = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    groupId += characters.charAt(randomIndex);
  }

  return groupId;
}

Router.get('/', (req, res) => {
  if(req.session.loggedin == true){
    res.render("account/account", {loggedin: "true"});
  } else {
    res.render("account/account", {loggedin: "false"});
  }
})

Router.post('/signin-authentication', async(req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;
  let newEmail = email.replace(/[^a-z 0-9 ! ? @ .]/gi,'');
  let newPassword = password.replace(/[^a-z 0-9 ! ? @ .]/gi,'');

  console.log(email, newEmail,password, newPassword)

  //filter invalid words
  if(password != newPassword || email != newEmail){
    res.send({success: false, signin_err_msg: 'INVALID WORD', signup_err_msg: ""});
    return 0;
  }

  const connection = await (await pool).getConnection();

  const matching_email = await connection.query('SELECT * FROM users WHERE email = ?', email);

  connection.release();
  
  if (typeof matching_email[0] == 'undefined') {
    console.log("no email")
    res.send({success: false, signin_err_msg: "NO SUCH USERS", signup_err_msg: ""});
    return 0;
  }


  if (crypto.pbkdf2Sync(password, matching_email[0].salt, 99097, 32, 'sha512').toString('hex') == matching_email[0].hashed_password) {
    res.cookie("userId", matching_email[0].user_id, {
      maxAge: 1000 * 60 * 10,
      secure: true,
      httpOnly: true,
      signed: true,
      authorized: true,
      httpOnly: true,
    });
    req.session.user_id = matching_email[0].user_id;
    req.session.name = matching_email[0].name;
    req.session.loggedin = true;
    console.log("login success");
    console.log(req.session.user_id, req.session.loggedin)
    res.send({success: true})
    return 0;
  }
  else {
    res.send({success: false, signin_err_msg: "NO SUCH USERS", signup_err_msg: ""})
    return 0;
  }
})



Router.post('/signup-authentication', async (req, res, next) => {
  let email = req.body.email;
  let name = req.body.name;
  let password = req.body.password;

  let newEmail = email.replace(/[^a-z 0-9 ! ? @ .]/gi,'');
  let newName = name.replace(/[^a-z 0-9 ! ? @ .]/gi,'');
  let newPassword = password.replace(/[^a-z 0-9 ! ? @ .]/gi,'');

  if(email != newEmail || name != newName || password != newPassword){
    res.send({success: false, signup_err_msg: "INVALID WORD DETECTED", signin_err_msg: ""});
    return 0;
  }
  
  let hashed = hashing(password);
  console.log(hashed, hashed[0], hashed[1]);

  const connection = await (await pool).getConnection();

  let check_email = await connection.query("SELECT * FROM users WHERE email = ?", email);

  if(typeof check_email[0] != 'undefined') {
    console.log("not new");
    res.send({success: false, signup_err_msg: "EMAIL ALREADY IN USE", signin_err_msg: ""});
  } else {
    console.log("new");
    const userId = generateId();
    var user = {
      name: name,
      email: email,
      hashed_password: hashed[1],
      salt: hashed[0],
      user_id: userId
    }
    connection.query('INSERT INTO users SET ?', user);
    req.session.user_id = userId;
    req.session.loggedin = true;
    res.send({success: true});
    req.session.name = name;
  }
  connection.release();
})

Router.get('/signup', function (req, res) {

  if (req.session.loggedin) {
    res.render('account/register', {
      title: 'Registration Page',
      name: '',
      email: '',
      password: '',
      button: "SIGN IN",
      path: "/account",
    })
  } else {
    res.render('account/register', {
      title: 'Registration Page',
      name: '',
      email: '',
      password: '',
      button: "SIGN IN",
      path: "/account",
    })
  }
})

Router.get('/logout', function (req, res) {
  req.session.destroy();
  res.cookie('names', '', { maxAge: 0 });
  res.redirect('/');
});

module.exports = Router;