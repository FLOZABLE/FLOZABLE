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
const { DateTime } = require('luxon');
const { generateRandomId } = require('../tool');

function hashing(password) {
  let salt = crypto.randomBytes(32).toString('hex');
  return [salt, crypto.pbkdf2Sync(password, salt, 99097, 32, 'sha512').toString('hex')];
}

async function autoSignin(req, res, success = (() => { }), fail = (() => { res.send({ success: false, reason: 'not authenticated' }) })) {
  if (req.session.loggedin) {
    return success();
  } else if (req.signedCookies.userId) {
    const connection = pool.promise();
    const [[userInfo]] = await connection.query('SELECT name, email, myinfo, timezone FROM users where user_id = ?', [req.signedCookies.userId]);
    pool.releaseConnection(connection);
    if (userInfo) {
      req.session.user_id = req.signedCookies.userId;
      req.session.name = userInfo.name;
      req.session.loggedin = true;
      req.session.userInfo = { userId: req.signedCookies.userId, name: userInfo.name, loggedin: true, email: userInfo.email, myinfo: userInfo.myinfo, timeZone: userInfo.timezone };
      return success();
    } else {
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
  autoSignin(req, res, (() => res.render("signIn", { loggedin: true })), (() => res.render("signIn", { loggedin: false })));
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
  }
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
  console.log(unixTimestamp)
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
    return res.send({ success: false, reason: 'You need special characters' });
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
    datum_point: unixTimestamp,
    key_salt: keySalt,
    iv: iv,
    plan: '',
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
    res.redirect('/');
  });
});

Router.post('/bring-my-info', async (req, res) => {
  autoSignin(req, res, (async () => {
    const connection = pool.promise();

    let userInfo = await connection.query(`SELECT name, myinfo, \`groups\`, user_id, plan, subjects from users WHERE user_id = ?`, [req.session.user_id]);
    userInfo = userInfo;
    res.send({ success: true, userInfo: userInfo });
    pool.releaseConnection(connection);
  }));
});

Router.get('/setting', async (req, res) => {
  autoSignin(req, res, (async () => {
    const connection = pool.promise();

    let userInfo = await connection.query(`SELECT name, email, language, interest, user_id from users WHERE user_id = ?`, [req.session.user_id]);
    userInfo = { userId: userInfo.user_id, name: userInfo.name, loggedin: true, email: userInfo.email, language: userInfo.language, interest: userInfo.interest };
    res.render('account/setting', { userInfo: userInfo })
    pool.releaseConnection(connection);
  }), (() => { return res.redirect('/account/signin') }));
});


const upload = multer();

const ajv = new Ajv();

function isValidJSON(data, schema) {
  const validate = ajv.compile(schema);
  const isValid = validate(data);

  if (!isValid) {
    return false;
  } else {
    return true;
  }
}


Router.post('/update/image', upload.single('image'), async (req, res) => {
  autoSignin(req, res, (async () => {
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
  }));
});


Router.post('/update/info', async (req, res) => {
  autoSignin(req, res, (async () => {
    const connection = pool.promise();
    try {
      let name = req.body.name;
      let email = req.body.email;
      let emailConfirm = req.body.emailConfirm;
      let language = req.body.language;
      let interest = req.body.interest;

      const supportedLanguages = ['English', 'Spanish', 'French'];
      if (!/^[a-zA-Z0-9]+$/.test(name)) {
        return res.send({ success: false, reason: 'Invalid Name' });
      } else if (!/^[^\s@%]+@[^\s@%]+\.[^\s@%]+$/.test(email)) {
        return res.send({ success: false, reason: 'Invalid Email' });
      } else if (email !== emailConfirm) {
        return res.send({ success: false, reason: 'Email Confirmation Failed' });
      } else if (!supportedLanguages.includes(language)) {
        return res.send({ success: false, reason: 'Not Supported Language' });
      }
      const updateInfo = [{ name: name, email: email, language: language, interest: interest }, req.session.user_id];
      let update = await connection.query('UPDATE users set ? WHERE user_id = ?', updateInfo);
      res.send({ success: true });
    } catch (error) {
      res.send({ success: false, reason: 'Unsupported File Type' })
    } finally {
      pool.releaseConnection(connection);
    }
  }));
});


Router.post('/update/password', async (req, res) => {
  autoSignin(req, res, (async () => {
    const connection = pool.promise();
    try {
      let password = req.body.password;
      let passwordConfirm = req.body.passwordConfirm;
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return res.send({ success: false, reason: 'No Special Character' });
      } else if ((password.match(/\d/g) || []).length < 2) {
        return res.send({ success: false, reason: 'Need More Than 2 Numbers' });
      } else if (password.length < 6) {
        return res.send({ success: false, reason: 'Too Short' });
      } else if (password !== passwordConfirm) {
        return res.send({ success: false, reason: 'Password Does Not Match' });
      }
      res.send({ success: true });
      let hashed = hashing(password);
      let salt = hashed[0];
      let hashedPw = hashed[1];
      const updateInfo = [{ hashed_password: hashedPw, salt: salt }, req.session.user_id];
      const update = await connection.query("UPDATE users set ? WHERE user_id = ?", updateInfo);
    } catch (error) {
      res.send({ success: false, reason: 'Unsupported File Type' })
    } finally {
      pool.releaseConnection(connection);
    }
  }));
});


Router.post('/update/auth', async (req, res) => {
  autoSignin(req, res, (async () => {
    const connection = pool.promise();
    try {
    } catch (error) {
    } finally {
      pool.releaseConnection(connection);
    }
  }));
});


Router.post('/update/extension-add', async (req, res) => {
  autoSignin(req, res, (async () => {
    const connection = pool.promise();
    try {
      let url = req.body.url;
      let origin;
      let domain;
      if (!/^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(\/[a-zA-Z0-9.-]*)*$/.test(url)) {
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
        return res.send({ success: false, reason: 'Already Exist' });
      } else {
        activitySettings.push({
          domain: domain,
          block: false,
          timer: true
        });
        const updateInfo = [{ activity_setting: JSON.stringify(activitySettings) }, req.session.user_id];
        const updateSetting = await connection.query(`UPDATE users set ? where user_id = ?`, updateInfo);
      }
      res.send({ success: true, origin: origin, domain: domain })
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'Invalid URL or Domain' })
    } finally {
      pool.releaseConnection(connection);
    }
  }));
});


Router.post('/update/extension-setting-update', async (req, res) => {
  autoSignin(req, res, (async () => {
    const connection = pool.promise();
    try {
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
      const isValid = isValidJSON(updatedExtSettings, schema);
      if (isValid) {
        const updateInfo = [{ activity_setting: JSON.stringify(updatedExtSettings) }, req.session.user_id];
        let update = await connection.query('UPDATE users set ? WHERE user_id = ?', updateInfo);
        return res.send({ success: true });
      } else {
        return res.send({ success: false, reason: 'Data Invalid' })
      }
    } catch (error) {

    } finally {
      pool.releaseConnection(connection);
    }
  }));
});


Router.post('/update/account', async (req, res) => {
  autoSignin(req, res, (async () => {
    const connection = pool.promise();
    try {
    } catch (error) {
    } finally {
      pool.releaseConnection(connection);
    }
  }));
});


Router.post('/update/notification', async (req, res) => {
  autoSignin(req, res, (async () => {
    const connection = pool.promise();
    try {
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
        return res.send({ success: true });
      } else {
        return res.send({ success: false, reason: 'Data Invalid' })
      }
    } catch (error) {
    } finally {
      pool.releaseConnection(connection);
    }
  }));
});


Router.post('/update/session', async (req, res) => {
  autoSignin(req, res, (async () => {
    const connection = pool.promise();
    try {
    } catch (error) {
    } finally {
      pool.releaseConnection(connection);
    }
  }));
});


Router.post('/notification-setting', async (req, res) => {
  autoSignin(req, res, (async () => {
    const connection = pool.promise();

    let select = await connection.query('SELECT notification_setting from users where user_id = ?', [req.session.user_id]);
    let notification = select[0].notification_setting;
    res.send({ success: true, notification: notification });
    pool.releaseConnection(connection);
  }));
})

module.exports = { Router: Router, autoSignin: autoSignin };