const express = require('express');
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const crypto = require("crypto");
const sharp = require('sharp');
const multer = require('multer');
const webpush = require("web-push");
const { DateTime } = require('luxon');
const { hashing, autoSignin, generateRandomId } = require("../tool");
const upload = multer();

Router.post('/accountinfo', async (req, res) => {
  autoSignin(req, res, (async () => {
    const userId = req.session.user_id;
    const connection = pool.promise();
    const [[userInfo]] = await connection.query("SELECT user_id, name, email, language, groups FROM users WHERE user_id = ?", [userId]);
    await redisClient.hSet(`user:${userId}`, `groups`, userInfo.groups);
    console.log(userInfo)
    res.send({ success: true, userInfo: userInfo });
  }))
});

Router.post('/update/image', upload.single('image'), async (req, res) => {
  autoSignin(req, res, (async () => {
    const userId = req.session.user_id;
    try {
      if (!req.file) {
        return res.send({ success: false, reason: 'No image file found' });
      }
      const imageBuffer = req.file.buffer; // Get the image buffer from the request
      await sharp(imageBuffer)
        .toFormat('jpeg')
        .resize({ width: 800, height: 800 })
        .jpeg({ quality: 40 })
        .toFile(`../public/profile-images/${userId}.jpeg`);
      res.send({ success: true });
    } catch (error) {
      res.send({ success: false, reason: 'Unsupported File Type' })
    }
  }));
});

Router.post('/signin-authentication', async (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;

  // Sanitize inputs
  let sanitizedEmail = email.replace(/[^a-z0-9!?@.]/gi, '');
  let sanitizedPassword = password;

  const connection = pool.promise();

  const [[userInfo]] = await connection.query('SELECT user_id, salt, hashed_password, email, myinfo, name, timezone, hashed_password FROM users WHERE email = ?', sanitizedEmail);

  pool.releaseConnection(connection);

  if (!userInfo) {
    return res.send({ success: false, reason: "NO SUCH USER" });
  };

  const hashedPassword = crypto.pbkdf2Sync(sanitizedPassword, userInfo.salt, 99097, 32, 'sha512').toString('hex');

  if (hashedPassword === userInfo.hashed_password) {
    const userId = userInfo.user_id;

    // Generate a new session ID
    req.session.regenerate((err) => {
      if (err) {
        console.log("Error regenerating session ID:", err);
        res.send({ success: false, reason: "SESSION ERROR" });
        return;
      }

      req.session.user_id = userId;
      req.session.name = userInfo.name;
      req.session.loggedin = true;
      req.session.userInfo = { userId: userId, name: userInfo.name, loggedin: true, email: email, myinfo: userInfo.myinfo, timeZone: userInfo.timezone };

      res.cookie("userId", userId, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        secure: true,
        httpOnly: true,
        signed: true,
      });

      res.send({ success: true });
    });
  } else {
    res.send({ success: false, reason: 'WRONG PASSWORD' });
  };
});

function isValidTimeZone(timeZone) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timeZone });
    return true;
  } catch {
    return false
  }
}

Router.post('/signup-authentication', async (req, res) => {
  let email = req.body.email;
  let name = req.body.name;
  let password = req.body.password;
  let timeZone = req.body.timeZone;

  if (!isValidTimeZone) {
    timeZone = 'UTC';
  }
  const userDateTime = DateTime.now().setZone(timeZone);

  // Set the time to 12:00 AM
  const twelveAmDateTime = userDateTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

  // Get the Unix timestamp in seconds
  const unixTimestamp = Math.floor(twelveAmDateTime.toMillis() / 1000);
  // Sanitize inputs

  //check email
  if (!/^[^\s@%]+@[^\s@%]+\.[^\s@%]+$/.test(email)) {
    return res.send({ success: false, reason: 'Invalid Email' });
  }

  //check name
  if (!/^[a-zA-Z0-9]+$/.test(name)) {
    return res.send({ success: false, reason: 'Invalid Name (Only A-Z, a-z, and 0-9 available)' });
  }



  //check pw
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return res.send({ success: false, reason: 'No Special Characters' });
  } else if ((password.match(/\d/g) || []).length < 2) {
    return res.send({ success: false, reason: 'Need More Than 2 Numbers' });
  } else if (password.length < 6) {
    return res.send({ success: false, reason: 'Too Short' });
  }

  const connection = pool.promise();

  let [[checkEmail]] = await connection.query("SELECT email FROM users WHERE email = ?", email);

  if (checkEmail) {
    return res.send({ success: false, reason: "EMAIL ALREADY IN USE" });
  };

  let hashed = hashing(password);

  const userId = generateRandomId(15);
  const keySalt = crypto.randomBytes(32).toString('hex');
  const iv = crypto.randomBytes(16).toString('hex');

  const user = {
    name: name,
    email: email,
    hashed_password: hashed[1],
    salt: hashed[0],
    user_id: userId,
    timezone: timeZone,
    datum_point: unixTimestamp,
    key_salt: keySalt,
    iv: iv,
    plan: '',
    daily: '[0]',
    weekly: '[0]',
    monthly: '[0]',
    activity: '{}',
    activity_setting: '[]',
    notification_setting: 'default_setting',
    study: JSON.stringify({ study: false, point: unixTimestamp, total: 0 })
  };
  connection.query('INSERT INTO users SET ?', user);
  //create default subject
  const subjectId = generateRandomId(10);
  const datum_point = Math.floor(new Date().getTime() / 1000);
  const subject = {
    id: subjectId,
    name: 'others',
    user_id: userId,
    icon: 'others',
    color: '#000000',
    datum_point
  };
  console.log('sub', subject)
  const test = await connection.query(`INSERT INTO subjects SET ?`, subject);
  req.session.regenerate((err) => {
    if (err) {
      res.send({ success: false, reason: "SESSION ERROR" });
      return;
    }

    req.session.user_id = userId;
    req.session.loggedin = true;
    req.session.name = name;
    req.session.userInfo = { userId: userId, name: name, loggedin: true, email: email, timeZone: timeZone };

    res.cookie("userId", userId, {
      maxAge: 1000 * 60 * 60 * 30,
      secure: true,
      httpOnly: true,
      signed: true,
    });

    res.send({ success: true });
  });

  pool.releaseConnection(connection);
});

module.exports = Router;