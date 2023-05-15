const express = require('express');
const Router = express.Router();
const pool = require('../model/pool');
const crypto = require("crypto");

function hashing(password) {
  let salt = crypto.randomBytes(32).toString('hex')
  return [salt, crypto.pbkdf2Sync(password, salt, 99097, 32, 'sha512').toString('hex')]
}

Router.get('/', (req, res) => {
  if(typeof req.session.error_msg != "undefined"){
    console.log(req.session.error_msg)
  } else {
    req.session.error_msg = ""
  }
  if(req.session.loggedin == true){
    res.render("account/account", {loggedin: "true", error_msg: req.session.error_msg});
  } else {
    res.render("account/account", {loggedin: "false", error_msg: req.session.error_msg});
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
    req.session.error_msg = 'INVALID WORD DETECTED';
    res.send({status: 400});
    return 0;
  }

  const connection = await (await pool).getConnection();

  const matching_email = await connection.query('SELECT * FROM users WHERE email = ?', email);

  connection.release();
  
  if (typeof matching_email[0] == 'undefined') {
    console.log("no email")
    req.session.error_msg = 'NO SUCH USER';
    res.send({status: 200});
    return 0;
  }


  if (crypto.pbkdf2Sync(password, matching_email[0].salt, 99097, 32, 'sha512').toString('hex') == matching_email[0].hashed_password) {
    res.cookie("names", email, {
      maxAge: 1000 * 60 * 10,
      secure: true,
      httpOnly: true,
      signed: true,
      authorized: true,
      httpOnly: true,
    });
    req.session.email = email;
    req.session.loggedin = true;
    console.log("login success");
    console.log(req.session.email, req.session.loggedin)
    res.send({status: 200})
    return 0;
  }
  else {
    req.session.error_msg = 'NO SUCH USER';
    res.send({status: 400})
    return 0;
  }
})



Router.post('/signup-authentication', async (req, res, next) => {
  let email = req.body.email;
  let name = req.body.name;
  let password = req.body.password;
  let redirectUrl = req.body.redirectUrl;

  let newEmail = email.replace(/[^a-z 0-9 ! ? @ .]/gi,'');
  let newName = name.replace(/[^a-z 0-9 ! ? @ .]/gi,'');
  let newPassword = password.replace(/[^a-z 0-9 ! ? @ .]/gi,'');

  if(email != newEmail || name != newName || password != newPassword){
    req.session.r_error_msg = 'INVALID WORD DETECTED';
    res.send({status: 400});
    return 0;
  }
  
  let hashed = hashing(password);
  console.log(hashed, hashed[0], hashed[1]);

  const connection = await (await pool).getConnection();

  let email_exist = false
  let check_email = await connection.query("SELECT * FROM users WHERE email = ?", email);

  if(typeof check_email[0] != 'undefined') {
    console.log("not new");
    req.session.r_error_msg = 'ALREADY EXIST';
    connection.release();
    res.send({status: 400});
  } else {
    console.log("new");
    var user = {
      name: name,
      email: email,
      hashed_password: hashed[1],
      salt: hashed[0],
    }
    connection.query('INSERT INTO users SET ?', user);
    connection.release();
    req.session.email = email;
    req.session.loggedin = true;
    res.send({status: 200});
  }
})

Router.get('/signup', function (req, res) {
  req.session.error_msg = "";

  if (req.session.loggedin) {
    res.render('account/register', {
      title: 'Registration Page',
      name: '',
      email: '',
      password: '',
      button: "SIGN IN",
      path: "/account",
      error: req.session.r_error_msg,
    })
  } else {
    res.render('account/register', {
      title: 'Registration Page',
      name: '',
      email: '',
      password: '',
      button: "SIGN IN",
      path: "/account",
      error: req.session.r_error_msg,
    })
  }
})

Router.get('/logout', function (req, res) {
  req.session.destroy();
  res.cookie('names', '', { maxAge: 0 });
  res.redirect('/');
});

module.exports = Router;