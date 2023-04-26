const express = require("express");
const Router = express.Router();
const passport = require("passport");
const GitHubStrategy = require("passport-github").Strategy;
const pool = require("../model/pool");
const axios = require("axios");

Router.use(passport.initialize());
Router.use(passport.session());

// Serialize and deserialize user
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/github/auth/callback",
      passReqToCallback: true
    },
    async function(req, accessToken, refreshToken, profile, done) {
      const connection = await (await pool).getConnection();
      connection.query('UPDATE users SET github_access_token = ? WHERE email = ?',[accessToken, req.session.email]);
      connection.release();
      done(null, profile);
    }
  )
);


Router.get("/auth", (req, res, next) => {
  if (req.session.loggedin) {
    passport.authenticate("github", {
      scope: ["repo", "user"],
      state: req.session.state,
      successRedirect: "/",
      failureRedirect: "/",
    })(req, res, next);
  } else {
    res.redirect("/account");
  }
});


Router.get(
  "/auth/callback",
  passport.authenticate("github", {
    failureRedirect: "/account",
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log("success");
    res.redirect("/myaccount");
  }
);

Router.post("/user", async(req, res) => {
  if(req.session.loggedin == true) {
    const connection = await (await pool).getConnection();
    const user_info = connection.query('SELECT * FROM users WHERE email = ?',[req.session.email]);
    const accessToken = user_info[0].github_access_token;

    axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`
      }
    }).then(response => {
      console.log(response.data);
    }).catch(error => {
      console.error(error);
    });
  } else {
    res.redirect('/')
  }
})

module.exports = Router;
