const express = require('express');
const Router = express.Router();
const connection = require("../model/pool");
const crypto = require("crypto");


function hashing(password) {
  let salt = crypto.randomBytes(32).toString('hex')
  return [salt, crypto.pbkdf2Sync(password, salt, 99097, 32, 'sha512').toString('hex')]
}

Router.get('/login', function (req, res, next) {
  req.session.r_error_msg = "";
  if (req.session.loggedin) {
    res.render('login', {
      title: 'Login',
      email: '',
      password: '',
      path: '/account/logout',
      button: 'LOGOUT',
      error: req.session.error_msg,
    })
  } else {
    res.render('login', {
      title: 'Login',
      email: '',
      password: '',
      path: '/account/login',
      button: 'SIGN IN',
      error: req.session.error_msg,
    })
  }
})

Router.post('/authentication', function (req, res, next) {
  let name = req.body.name;
  let password = req.body.password;
  let newName = name.replace(/[^a-z 0-9 ! ? @ .]/gi,'');
  let newPassword = password.replace(/[^a-z 0-9 ! ? @ .]/gi,'');

  console.log(name, newName,password, newPassword)

  //filter invalid words
  if(password != newPassword || name != newName){
    req.session.error_msg = 'INVALID WORD DETECTED';
    res.redirect('/account/login');
    return 0;
  }
  connection.query('SELECT * FROM users WHERE name = ?', name, function (err, rows, fields) {
    //check if user exist
    if (typeof rows[0] == 'undefined') {
      req.session.error_msg = 'NO SUCH USER';
      res.redirect('/account/login');
      return 0;
    }

    if (crypto.pbkdf2Sync(password, rows[0].salt, 99097, 32, 'sha512').toString('hex') == rows[0].password) {
      res.cookie("names", name, {
        maxAge: 1000 * 60 * 10,
        secure: true,
        httpOnly: true,
        signed: true,
        authorized: true,
        httpOnly: true,
      });
      req.session.userId = name;
      req.session.loggedin = true;
      res.redirect('/');
      return 0;
    }
    else {
      req.session.error_msg = 'NO SUCH USER';
      res.redirect('/account/login');
      return 0;
    }
  })
})

Router.get('/register', function (req, res) {
  req.session.error_msg = "";

  if (req.session.loggedin) {
    res.render('register', {
      title: 'Registration Page',
      name: '',
      email: '',
      password: '',
      button: "SIGN IN",
      path: "/account/login",
      error: req.session.r_error_msg,
    })
  } else {
    res.render('register', {
      title: 'Registration Page',
      name: '',
      email: '',
      password: '',
      button: "SIGN IN",
      path: "/account/login",
      error: req.session.r_error_msg,
    })
  }
})


Router.post('/post-register', function (req, res, next) {
  let email = req.body.email;
  let name = req.body.name;
  let password = req.body.password;

  let newEmail = email.replace(/[^a-z 0-9 ! ? @ .]/gi,'');
  let newName = name.replace(/[^a-z 0-9 ! ? @ .]/gi,'');
  let newPassword = password.replace(/[^a-z 0-9 ! ? @ .]/gi,'');

  if(email != newEmail || name != newName || password != newPassword){
    req.session.r_error_msg = 'INVALID WORD DETECTED';
    res.redirect('/account/register');
    return 0;
  }

  let hashed = hashing(password);
  console.log(hashed, hashed[0], hashed[1]);

  //check email
  connection.query("SELECT * FROM users WHERE email = ?", email, function (err, rows, field) {
    if (typeof rows[0] == 'undefined') {
      //check name
      connection.query("SELECT * FROM users WHERE name = ?", name, function (err, rows, field) {
        if (typeof rows[0] == 'undefined') {
          console.log("new");
          var user = {
            name: req.sanitize('name').escape().trim(),
            email: req.sanitize('email').escape().trim(),
            password: hashed[1],
            salt: hashed[0],
          }
          console.log(hashing(password));
          console.log("passwd");
          connection.query('INSERT INTO users SET ?', user);
          res.redirect('/account/login');
          return 0;
        } else {
          req.session.r_error_msg = 'ALREADY EXIST';
          console.log('not new');
          res.redirect('/account/register');
        }
      })
      return 0;
    } else {
      console.log("not new");
      req.session.r_error_msg = 'ALREADY EXIST';
      res.redirect('/account/register');
    }
  });
  console.log(email);
})

Router.get('/logout', function (req, res) {
  req.session.destroy();
  res.cookie('names', '', { maxAge: 0 });
  res.redirect('/');
});

module.exports = Router;