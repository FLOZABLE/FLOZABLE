const express = require('express');
const Router = express.Router();
const pool = require('../model/pool');
const crypto = require("crypto");
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const multer = require('multer');
const Ajv = require("ajv");
const webpush = require("web-push");

function hashing(password) {
  let salt = crypto.randomBytes(32).toString('hex');
  return [salt, crypto.pbkdf2Sync(password, salt, 99097, 32, 'sha512').toString('hex')];
}

async function autoSignin(req, res, success = (() => {}), fail = (() => {res.send({success: false, reason: 'not authenticated'})})) {
  console.log(req.session, req.signedCookies)
  if (req.session.loggedin) {
    return success();
  } else if (req.signedCookies.userId) {
    const connection = await (await pool).getConnection();
    let userInfo = await connection.query('SELECT name, email, myinfo FROM users where user_id = ?', [req.signedCookies.userId]);
    connection.release();
    userInfo = userInfo[0];
    if (userInfo) {
      req.session.user_id = req.signedCookies.userId;
      req.session.name = userInfo.name;
      req.session.loggedin = true;
      req.session.userInfo = { userId: req.signedCookies.userId, name: userInfo.name, loggedin: true, email: userInfo.email, myinfo: userInfo.myinfo };
      return success();
    } else {
      console.log('fail2')
      return fail();
    }
  } else {
    return fail();
  }
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

Router.get('/signin', async (req, res) => {
  autoSignin(req, res, (() => res.render("account/signin", { loggedin: true })), (() => res.render("account/signin", { loggedin: false })));
});

Router.post('/signin-authentication', async (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;

  // Sanitize inputs
  let sanitizedEmail = email.replace(/[^a-z0-9!?@.]/gi, '');
  let sanitizedPassword = password;

  const connection = await (await pool).getConnection();

  const matching_email = await connection.query('SELECT * FROM users WHERE email = ?', sanitizedEmail);

  connection.release();

  if (matching_email.length === 0) {
    console.log("no email");
    res.send({ success: false, reason: "NO SUCH USER" });
    return;
  }

  const hashedPassword = crypto.pbkdf2Sync(sanitizedPassword, matching_email[0].salt, 99097, 32, 'sha512').toString('hex');

  if (hashedPassword === matching_email[0].hashed_password) {
    const userId = matching_email[0].user_id;

    // Generate a new session ID
    req.session.regenerate((err) => {
      if (err) {
        console.log("Error regenerating session ID:", err);
        res.send({ success: false, reason: "SESSION ERROR"});
        return;
      }

      req.session.user_id = userId;
      req.session.name = matching_email[0].name;
      req.session.loggedin = true;
      req.session.userInfo = { userId: userId, name: matching_email[0].name, loggedin: true, email: email, myinfo: matching_email[0].myinfo };
      console.log("login success");
      console.log(req.session.user_id, req.session.loggedin);

      res.cookie("userId", userId, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        secure: true,
        httpOnly: true,
        signed: true,
      });

      res.send({ success: true });
    });
  } else {
    res.send({ success: false, reason: 'WRONG PASSWORD'});
  }
});

Router.post('/signup-authentication', async (req, res) => {
  let email = req.body.email;
  let name = req.body.name;
  let password = req.body.password;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;;
  const date = new Date();
  date.toLocaleString("en-US", { timeZone });
  date.setHours(0, 0, 0, 0);
  // Sanitize inputs

  //check email
  if (!/^[^\s@%]+@[^\s@%]+\.[^\s@%]+$/.test(email)) {
    return res.send({ success: false, reason: 'Invalid Email' });
  }

  //check name
  if (!/^[A-Za-z]+$/.test(name)) {
    return res.send({ success: false, reason: 'Invalid Name' });
  }

  //check pw
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return res.send({ success: false, reason: 'No Special Characters' });
  }

  const connection = await (await pool).getConnection();

  let check_email = await connection.query("SELECT * FROM users WHERE email = ?", email);

  if (check_email.length !== 0) {
    console.log("not new");
    res.send({ success: false, reason: "EMAIL ALREADY IN USE" });
    return;
  }

  let hashed = hashing(password);

  const userId = generateId();
  const keySalt = crypto.randomBytes(32).toString('hex');
  const iv = crypto.randomBytes(16).toString('hex');

  const user = {
    name: name,
    email: email,
    hashed_password: hashed[1],
    salt: hashed[0],
    user_id: userId,
    timezone: timeZone,
    datum_point: date / 1000,
    key_salt: keySalt,
    iv: iv,
    plan: '',
    daily: '[0]',
    weekly: '[0]',
    monthly: '[0]',
    activity: '{}',
    activity_setting: '[]',
    notifications: '[]'
  };
  console.log(user)
  //connection.query('INSERT INTO users SET ?', user);

  req.session.regenerate((err) => {
    if (err) {
      console.log("Error regenerating session ID:", err);
      res.send({ success: false, reason: "SESSION ERROR" });
      return;
    }

    req.session.user_id = userId;
    req.session.loggedin = true;
    req.session.name = sanitizedName;
    req.session.userInfo = { userId: userId, name: sanitizedName, loggedin: true, email: email };

    res.cookie("userId", userId, {
      maxAge: 1000 * 60 * 60 * 30,
      secure: true,
      httpOnly: true,
      signed: true,
    });

    res.send({ success: true });
    console.log(req.session)
  });

  connection.release();
});

Router.get('/signup', function (req, res) {
  autoSignin(req, res, (() => res.render("account/signup")), 
  (() => res.render("account/signup")));
});

Router.get('/logout', function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error destroying session:", err);
    }
    res.clearCookie('userId');
    console.log(req.signedCookies, req.session)
    res.redirect('/');
  });
});

Router.post('/bring-my-info', async (req, res) => {
  autoSignin(req, res, (async() => {
    const connection = await (await pool).getConnection();

    let userInfo = await connection.query(`SELECT name, myinfo, \`groups\`, user_id, plan, subjects from users WHERE user_id = ?`, [req.session.user_id]);
    userInfo = userInfo[0];
    res.send({ success: true, userInfo: userInfo });
    connection.release();
  }));
});

Router.get('/setting', async (req, res) => {
  autoSignin(req, res, (async() => {
    const connection = await (await pool).getConnection();

    let userInfo = await connection.query(`SELECT name, email, language, interest, user_id from users WHERE user_id = ?`, [req.session.user_id]);
    userInfo = { userId: userInfo[0].user_id, name: userInfo[0].name, loggedin: true, email: userInfo[0].email, language: userInfo[0].language, interest: userInfo[0].interest };
    res.render('account/setting', { userInfo: userInfo })
    connection.release();
  }), (() => {return res.redirect('/account/signin')}));
});


const upload = multer();

const ajv = new Ajv();

function isValidJSON(data, schema) {
  const validate = ajv.compile(schema);
  const isValid = validate(data);

  if (!isValid) {
    console.log('Invalid data:', validate.errors);
    return false;
  } else {
    console.log('Data is valid.');
    return true;
  }
}
Router.post('/update/:type', upload.single('image'), async (req, res) => {
  autoSignin(req, res, (async() => {
    const type = req.params.type;

    const connection = await (await pool).getConnection();
    if (type == 'image') {
      connection.release();
      try {
        if (!req.file) {
          return res.send({ success: false, reason: 'No image file found' });
        }
  
        const imageBuffer = req.file.buffer; // Get the image buffer from the request
  
        // Process the image using sharp
        await sharp(imageBuffer)
          .toFormat('jpeg')
          .resize({ width: 800, height: 800 })
          .jpeg({ quality: 40 })
          .toFile(`./public/profile-images/${req.session.user_id}.jpeg`);
        res.send({ success: true });
      } catch (error) {
        res.send({ success: false, reason: 'Unsupported File Type' })
      }
    } else if (type == 'info') {
      let name = req.body.name;
      let email = req.body.email;
      let emailConfirm = req.body.emailConfirm;
      let language = req.body.language;
      let interest = req.body.interest;
  
      const supportedLanguages = ['English', 'Spanish', 'French'];
      if (!/^[a-zA-Z0-9]+$/.test(name)) {
        connection.release();
        return res.send({ success: false, reason: 'Invalid Name' });
      } else if (!/^[^\s@%]+@[^\s@%]+\.[^\s@%]+$/.test(email)) {
        connection.release();
        return res.send({ success: false, reason: 'Invalid Email' });
      } else if (email !== emailConfirm) {
        connection.release();
        return res.send({ success: false, reason: 'Email Confirmation Failed' });
      } else if (!supportedLanguages.includes(language)) {
        connection.release();
        return res.send({ success: false, reason: 'Not Supported Language' });
      }
      const updateInfo = [{ name: name, email: email, language: language, interest: interest }, req.session.user_id];
      let update = await connection.query('UPDATE users set ? WHERE user_id = ?', updateInfo);
      res.send({ success: true });
      connection.release();
    } else if (type == 'password') {
      let password = req.body.password;
      let passwordConfirm = req.body.passwordConfirm;
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        connection.release();
        return res.send({ success: false, reason: 'No Special Character' });
      } else if ((password.match(/\d/g) || []).length < 2) {
        connection.release();
        return res.send({ success: false, reason: 'Need More Than 2 Numbers' });
      } else if (password.length < 6) {
        connection.release();
        return res.send({ success: false, reason: 'Too Short' });
      } else if (password !== passwordConfirm) {
        connection.release();
        return res.send({ success: false, reason: 'Password Does Not Match' });
      }
  
      connection.release();
      res.send({ success: true });
      let hashed = hashing(password);
      let salt = hashed[0];
      let hashedPw = hashed[1];
      const updateInfo = [{ hashed_password: hashedPw, salt: salt }, req.session.user_id];
      const update = await connection.query("UPDATE users set ? WHERE user_id = ?", updateInfo);
    } else if (type == 'auth') {
  
    } else if (type == 'extension-add') {
      try {
        let url = req.body.url;
        let origin;
        let domain;
        if (!/^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(\/[a-zA-Z0-9.-]*)*$/.test(url)) {
          connection.release();
          return res.send({ success: false, reason: 'Invalid URL or Domain' });
        }
        if (url.includes('https://') || url.includes('http://')) {
          origin = new URL(url).origin;
          domain = new URL(url).hostname;
        } else {
          origin = new URL('https://' + url).origin;
          domain = new URL('https://' + url).hostname;
        }
  
        let activitySettings = await connection.query(`select activity_setting from users where user_id = ?`, [req.session.user_id]);
        activitySettings = JSON.parse(activitySettings[0].activity_setting);
        const selectedActivity = activitySettings.find(activitySetting => { return activitySetting.domain == domain });
        if (selectedActivity) {
          connection.release();
          return res.send({ success: false, reason: 'Already Exist' });
        } else {
          activitySettings.push({
            domain: domain,
            block: true,
            timer: true
          });
          const updateInfo = [{activity_setting: JSON.stringify(activitySettings)}, req.session.user_id];
          const updateSetting = await connection.query(`UPDATE users set ? where user_id = ?`, updateInfo);
        }
        connection.release();
        res.send({ success: true, origin: origin, domain: domain })
      } catch (error) {
        console.log(error)
        connection.release();
        res.send({ success: false, reason: 'Invalid URL or Domain' })
      }
    } else if (type == 'extension-setting-update') {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            domain: { type: 'string', minLength: 2, maxLength: 260 },
            block: { type: 'boolean' },
            timer: { type: 'boolean' },
          },
          required: ['domain', 'block', 'timer'],
          additionalProperties: false
        },
      };
  
      const updatedExtSettings = req.body.activitySettings;
      console.log(updatedExtSettings)
      const isValid = isValidJSON(updatedExtSettings, schema);
      if (isValid) {
        const updateInfo = [{ activity_setting: JSON.stringify(updatedExtSettings) }, req.session.user_id];
        let update = await connection.query('UPDATE users set ? WHERE user_id = ?', updateInfo);
        connection.release();
        return res.send({ success: true });
      } else {
        connection.release();
        return res.send({ success: false, reason: 'Data Invalid' })
      }
    } else if (type == 'account') {
  
    } else if (type == 'notification') {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 0, maximum: 14 },
            name: { type: 'string', maxLength: 50 },
            email: { type: 'boolean' },
            push: { type: 'boolean' },
            sms: { type: 'boolean' },
          },
          required: ['id', 'name', 'email', 'push', 'sms'],
          additionalProperties: false
        },
      };
  
      const updatedNotificationSettings = req.body.notificationSettings;
      const isValid = isValidJSON(updatedNotificationSettings, schema);
      if (isValid) {
        const updateInfo = [{ notification_setting: JSON.stringify(updatedNotificationSettings) }, req.session.user_id];
        let update = await connection.query('UPDATE users set ? WHERE user_id = ?', updateInfo);
        connection.release();
        return res.send({ success: true });
      } else {
        connection.release();
        return res.send({ success: false, reason: 'Data Invalid' })
      }
    } else if (type == 'session') {
  
    }
  }));
});

Router.post('/notification-setting', async (req, res) => {
  autoSignin(req, res, (async() => {
    const connection = await (await pool).getConnection();

    let select = await connection.query('SELECT notification_setting from users where user_id = ?', [req.session.user_id]);
    let notification = select[0].notification_setting;
    res.send({ success: true, notification: notification });
    connection.release();
  }));
})

module.exports = { Router: Router, autoSignin: autoSignin };