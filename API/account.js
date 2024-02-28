const express = require('express');
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const crypto = require("crypto");
const sharp = require('sharp');
const multer = require('multer');
const webpush = require("web-push");
const { DateTime } = require('luxon');
const { hashing, autoSignin, generateRandomId, googleOauth2client, googleYoutubeOauth2client, isValidTimeZone, deriveKey, randomIntInRange } = require("../tool");
const { validateEmail, validateStrictString, validatePassword, validateURL } = require("../validate");
const { UserRefreshClient } = require("google-auth-library")
const { NotificationCache, usersCache, userCache, subjectsTimelineCache } = require('../services/redisLoader');
const { extensionIo } = require('../socket');
const { sendEmail } = require('../email');
const upload = multer();

Router.get('/accountinfo', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    const notifications = await NotificationCache(userId);
    const userInfo = await userCache(userId);
    usersCache(userId);
    res.send({ success: true, userInfo: userInfo, notifications: notifications });
  }
  ), () => {
    res.send({ success: false, code: 401 });
  }
  );
});

Router.get('/activity-settings', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const connection = pool.promise();
      const [[userInfo]] = await connection.query(`SELECT activity_setting FROM users WHERE user_id = ?`, [userId]);
      if (!userInfo) return res.send({ success: false, reason: 'No such user' });
      const { activity_setting } = userInfo;
      res.send({ success: true, activity_setting });
    } catch (err) {
      console.log(err);
      res.send({ success: false, reason: 'err' });
    };
  }))
});

Router.post('/signin-authentication', async (req, res) => {
  const { email, password } = req.body;

  const isValidEmail = validateEmail(email);
  if (!isValidEmail.isValid) {
    return res.send({ success: false, reason: isValidEmail.reason });
  };

  const connection = pool.promise();

  const [[userInfo]] = await connection.query('SELECT user_id, salt, hashed_password, email, myinfo, name, timezone, hashed_password FROM users WHERE email = ?', email);

  if (!userInfo) {
    return res.send({ success: false, reason: "NO SUCH USER" });
  };

  const hashedPassword = crypto.pbkdf2Sync(password, userInfo.salt, 99097, 32, 'sha512').toString('hex');

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
      req.session.email = email;

      res.cookie("userId", userId, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        secure: true,
        httpOnly: true,
        signed: true,
      });

      res.send({ success: true, msg: 'Success' });
    });
  } else {
    res.send({ success: false, reason: 'WRONG PASSWORD' });
  };
});

Router.post('/send-verification-link', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const userInfo = await userCache(userId);
      await redisClient.setEx(`verify:${userInfo.email}`, 3600, generateRandomId(10));
      res.send({ success: true, message: "Verification Link Sent!" });
    } catch (err) {
      console.log(err);
      res.send({ success: false, reason: "Error" });
    };
  }));
});

Router.post('/verify-by-link', async (req, res) => {
  const { verifyId } = req.body;
  autoSignin(req, res, (async (userId) => {
    try {
      const userInfo = await userCache(userId);
      const verifyInfo = await redisClient.get(`verify:${userInfo.email}`);
      if (!verifyInfo) {
        return res.send({ success: false, reason: "Link expired" });
      }
      if (verifyId === verifyInfo) {
        const connection = pool.promise();
        await connection.query("UPDATE users SET verified = true WHERE user_id = ?", [userId]);
        res.send({ success: true, message: "Verification Success!" });
      }
    } catch (err) {
      console.log(err);
      res.send({ success: false, reason: "Error" });
    };
  }));
});

Router.post('/signup-authentication', async (req, res) => {
  try {
    const { email, name, password, timeZone } = req.body;
    if (!isValidTimeZone(timeZone)) {
      timeZone = 'UTC';
    }
    const userDateTime = DateTime.now().setZone(timeZone);
    // Set the time to 12:00 AM
    const twelveAmDateTime = userDateTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    // Get the Unix timestamp in seconds
    const unixTimestamp = twelveAmDateTime.toSeconds();
    // Sanitize inputs
    //check email
    const isValidEmail = validateEmail(email);
    if (!isValidEmail.isValid) {
      return res.send({ success: false, reason: isValidEmail.reason });
    };
    const isValidName = validateStrictString(name, 'Name');
    if (!isValidName.isValid) {
      return res.send({ success: false, reason: isValidName.reason });
    };
    const isValidPassword = validatePassword(password);
    if (!isValidPassword.isValid) {
      return res.send({ success: false, reason: isValidPassword.reason });
    };
    const connection = pool.promise();
    const [[checkEmail]] = await connection.query("SELECT email FROM users WHERE email = ?", email);
    if (checkEmail) {
      return res.send({ success: false, reason: "EMAIL ALREADY IN USE" });
    };
    const [salt, hashed_password] = hashing(password);
    const userId = generateRandomId(10);
    const keySalt = crypto.randomBytes(32).toString('hex');
    const iv = crypto.randomBytes(16).toString('hex');
    const user = {
      name,
      email,
      hashed_password,
      salt,
      user_id: userId,
      timezone: timeZone,
      datum_point: unixTimestamp,
      key_salt: keySalt,
      iv: iv,
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
    connection.query(`INSERT INTO subjects SET ?`, subject);
    req.session.regenerate((err) => {
      if (err) {
        console.log("Error regenerating session ID:", err);
        res.send({ success: false, reason: "SESSION ERROR" });
        return;
      }
      req.session.user_id = userId;
    });
    const authId = generateRandomId(10);
    await redisClient.setEx(`extension:auth:${authId}`, 10, userId);
    res.cookie("userId", userId, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      secure: true,
      httpOnly: true,
      signed: true,
    });
    extensionIo.to(userId).emit("tryAuth");
    res.send({ success: true });
    /* req.session.regenerate((err) => {
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
    }); */
  } catch (err) {
    res.send({ success: false, reason: "Error" });
  };
});

//reset password link only available for 24 hr
const MAX_DURATION = 60 * 60 * 24;

Router.post('/reset-password-request', async (req, res) => {
  try {
    const { email } = req.body;

    const isValidEmail = validateEmail(email);

    if (!isValidEmail.isValid) {
      return res.send({ success: false, reason: isValidEmail.reason });
    };

    const connection = pool.promise();

    const [[user]] = await connection.query(`SELECT user_id, type FROM users WHERE email = ? LIMIT 1`, [email]);

    console.log(user)
    if (!user || user.type === -1) {
      return res.send({ success: false, reason: "No User found!" });
    };

    let resetId = await redisClient.get(`resetPw:${email}`);

    if (!resetId) {
      resetId = generateRandomId(30);
      redisClient.setEx(`resetPw:${email}`, MAX_DURATION, resetId);
      const params = { resetURL: `${process.env.SERVER}/account/reset-password?resetId=${resetId}&email=${email}` };
      const to = [{ email }];
      sendEmail(to, params, 4);
    };

    res.send({ success: true, msg: 'Check your email!' })
  } catch (err) {
    console.log(err);
    res.send({ success: false, reason: 'Error' });
  };
});

Router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetId, password } = req.body;

    const isValidEmail = validateEmail(email);

    if (!isValidEmail.isValid) {
      return res.send({ success: false, reason: isValidEmail.reason });
    };

    const isValidPassword = validatePassword(password);
    if (!isValidPassword.isValid) {
      return res.send({ success: false, reason: isValidPassword.reason });
    };

    const isValidResetId = validateStrictString(resetId, "reset id", 30, 30);
    if (!isValidResetId.isValid) {
      return res.send({ success: false, reason: isValidResetId.reason });
    };

    const matchedResetId = await redisClient.get(`resetPw:${email}`);

    console.log(matchedResetId, resetId);
    if (!matchedResetId || matchedResetId !== resetId) {
      return res.send({ success: false, reason: 'Expired or Invalid URL' });
    };

    redisClient.del(`resetPw:${email}`);

    const connection = pool.promise();

    const [salt, hashed_password] = hashing(password);
    const updateInfo = [{ hashed_password, salt }, email];
    const update = await connection.query("UPDATE users set ? WHERE email = ?", updateInfo);

    res.send({ success: true, msg: "Password reset successful!" });
  } catch (err) {
    console.log(err);
    res.send({ success: false, reason: 'Error' });
  };
});

Router.get('/reset-password', (req, res) => {
  autoSignin(req, res, (() => res.render('reset-password', { loggedIn: true })), (() => res.render('reset-password', { loggedIn: false })));
});

Router.post('/update/image', upload.single('image'), async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      if (!req.file) {
        return res.send({ success: false, reason: 'No image file found' });
      }
      const imageBuffer = req.file.buffer; // Get the image buffer from the request
      await sharp(imageBuffer)
        .toFormat('jpeg')
        .resize({ width: 800, height: 800 })
        .jpeg({ quality: 40 })
        .toFile(`./public/profile-images/${userId}.jpeg`);
      res.send({ success: true, msg: 'Updated Profile Image!' });
    } catch (err) {
      console.log(err)
      res.send({ success: false, reason: 'Unsupported File Type' })
    }
  }));
});

Router.post('/update/info', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const { name, email, confirmEmail } = req.body;
      //const supportedLanguages = ['English', 'Spanish', 'French'];
      const isValidEmail = validateEmail(email);
      if (!isValidEmail.isValid) {
        return res.send({ success: false, reason: isValidEmail.reason });
      };

      const isValidName = validateStrictString(name);
      if (!isValidName.isValid) {
        return res.send({ success: false, reason: isValidName.reason });
      };

      if (email !== confirmEmail) {
        return res.send({ success: false, reason: 'Email Confirmation Failed' });
      };

      const connection = pool.promise();

      const [[checkEmail]] = await connection.query("SELECT email FROM users WHERE email = ?", email);

      if (checkEmail) {
        return res.send({ success: false, reason: "EMAIL ALREADY IN USE" });
      };

      /* else if (!supportedLanguages.includes(language)) {
        return res.send({ success: false, reason: 'Not Supported Language' });
      } */
      const updateInfo = [{ name: name, email: email }, userId];
      redisClient.hSet(`user:${userId}`, 'name', name);
      redisClient.hSet(`user:${userId}`, 'email', email);
      await connection.query('UPDATE users set ? WHERE user_id = ?', updateInfo);
      res.send({ success: true, msg: 'Updated Your Information!' });
    } catch (error) {
      res.send({ success: false, reason: 'Unsupported File Type' })
    };
  }));
});

Router.post('/update/password', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const connection = pool.promise();
      const { password, confirmPassword } = req.body;

      const isValidPassword = validatePassword(password);
      if (!isValidPassword.isValid) {
        return res.send({ success: false, reason: isValidPassword.reason });
      };

      if (password !== confirmPassword) {
        return res.send({ success: false, reason: 'Password Does Not Match' });
      };

      const [salt, hashed_password] = hashing(password);
      const updateInfo = [{ hashed_password, salt }, userId];
      const update = await connection.query("UPDATE users set ? WHERE user_id = ?", updateInfo);
      res.send({ success: true, msg: "Password Updated!" });
    } catch (error) {
      res.send({ success: false, reason: 'Unsupported File Type' })
    };
  }));
});

Router.post('/update/extension-add', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const connection = pool.promise();
      const { url } = req.body;

      const isValidURL = validateURL(url);

      if (!isValidURL.isValid) {
        return res.send({ success: false, reason: isValidURL.reason });
      };

      const { domain, origin } = isValidURL;

      const [[userInfo]] = await connection.query(`SELECT activity_setting FROM users WHERE user_id = ?`, [userId]);
      let activitySettings = userInfo.activitySettings === "" ? [] : JSON.parse(userInfo.activity_setting.replace(/^/, "[").replace(/$/, "]"));
      const selectedActivity = activitySettings.find(activitySetting => { return activitySetting.d == domain });
      if (selectedActivity) {
        return res.send({ success: false, reason: 'Already Exist' });
      } else {
        //d: domain, b: block, t: timer
        const stringlified = JSON.stringify({ d: domain, b: 0, bs: 0, t: 0, ts: 1 });
        await connection.query(`
        UPDATE users
        SET activity_setting = CASE
          WHEN activity_setting = '' THEN ?
          ELSE CONCAT(activity_setting, ',', ?)
        END
        WHERE user_id = ?
      `, [
          stringlified,
          stringlified,
          userId
        ]);
      };
      extensionIo.to(userId).emit('setting-created', { d: domain, b: 0, bs: 0, t: 0, ts: 1 });
      res.send({ success: true, origin: origin, domain: domain, msg: `Added ${domain}` })
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'Invalid URL or Domain' });
    };
  }));
});

Router.post('/update/extension-setting-update', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const { d, target, value } = req.body;
      const connection = pool.promise();
      const [[userInfo]] = await connection.query(`SELECT activity_setting FROM users WHERE user_id = ?`, [userId]);
      if (!userInfo) return res.send({ success: false, reason: "No Such User" });
      let activitySettings = userInfo.activitySettings === "" ? [] : JSON.parse(userInfo.activity_setting.replace(/^/, "[").replace(/$/, "]"));
      const activityIndex = activitySettings.findIndex(activitySetting => { return activitySetting.d == d });
      if (activityIndex === -1) {
        return res.send({ success: false, reason: 'No Matching Website' });
      } else {
        //d: domain, b: block, t: timer
        if (target === 'block') {
          activitySettings[activityIndex] = { ...activitySettings[activityIndex], b: value ? 1 : 0 };
        } else if (target === "blockstudy") {
          activitySettings[activityIndex] = { ...activitySettings[activityIndex], bs: value ? 1 : 0 };
        } else if (target === "timer") {
          activitySettings[activityIndex] = { ...activitySettings[activityIndex], t: value ? 1 : 0 };
        } else {
          activitySettings[activityIndex] = { ...activitySettings[activityIndex], ts: value ? 1 : 0 };
        }
        const stringlified = JSON.stringify(activitySettings).slice(1, -1);
        await connection.query(`
        UPDATE users
        SET activity_setting = ?
        WHERE user_id = ?
      `, [
          stringlified,
          userId
        ]);
      }

      res.send({ success: true, msg: "Setting updated!" });
      extensionIo.to(userId).emit('setting-updated', { d, target, value });
    } catch (error) {
      res.send({ success: false, reason: 'Invalid URL or Domain' });
    };
  }));
});

Router.get('/logout', function (req, res) {
  console.log('logout')
  req.session.destroy((err) => {
    if (err) {
      console.log("Error destroying session:", err);
    }
    res.clearCookie('userId');
    //res.redirect('/');
    res.send({ success: true });
  });
});

Router.get('/profile/:userId', async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    if (!targetUserId) return { success: false, reason: 'Invalid User' };
    const userInfo = await userCache(targetUserId);
    if (!userInfo) return res.send({ success: false, msg: 'No such user' });
    const friends = userInfo.friends === "" ? [] : userInfo.friends.split(",");
    const friendsInfo = [];
    await Promise.all(friends.map(async (friendId) => {
      const friendInfo = await userCache(friendId);
      if (friendInfo) {
        friendsInfo.push(friendInfo);
      };
    }));
    const subjectsInfo = await subjectsTimelineCache(targetUserId);
    res.send({ success: true, userInfo, subjectsInfo, friendsInfo });
  } catch (err) {
    console.log(err);
  }
});

Router.post('/auth/google', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const { data } = req.body;
      const auth = googleOauth2client();
      const response = await auth.getToken(data);
      if (response.res.status === 200) {
        const connection = pool.promise();
        const { refresh_token, access_token } = response.tokens;
        console.log('gd', response.tokens);
        redisClient.set(`user:${userId}:googleAccessToken`, access_token, { EX: 3590 });
        connection.query(`UPDATE users SET google_refresh_token = ? WHERE user_id = ?`, [refresh_token, userId]);
        /* const user = new UserRefreshClient(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          refresh_token,
        );
        const { credentials } = await user.refreshAccessToken();
        console.log('dd', credentials) */
      }
      res.send({ success: true, data: response })
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    };
  }));
});


Router.post('/auth/youtube', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const { data } = req.body;
      const auth = googleOauth2client(data);
      const response = await auth.getToken(data);
      if (response.res.status === 200) {
        const connection = pool.promise();
        const { refresh_token, access_token } = response.tokens;
        console.log('youtube login', response.tokens);
        redisClient.set(`user:${userId}:youtubeAccessToken`, access_token, { EX: 3590 });
        //connection.query(`UPDATE users SET google_refresh_token = ? WHERE user_id = ?`, [refresh_token, userId]);
      }
      res.send({ success: true, data: response })
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    };
  }));
});

Router.post('/notification-subscribe', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const { subscription } = req.body;

      const { endpoint, expirationTime, keys } = subscription;

      const isValidEndPoint = validateURL(endpoint);
      if (!isValidEndPoint.isValid) {
        return res.send({ success: false, reason: isValidEndPoint.reason });
      };

      const connection = pool.promise();

      const [[userInfo]] = await connection.query('SELECT user_id, key_salt, iv FROM users WHERE user_id = ?', [userId]);

      const encryptKey = await deriveKey(userId, userInfo.key_salt);

      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptKey, 'hex'), Buffer.from(userInfo.iv, 'hex'));

      let encryptedData = cipher.update(endpoint, 'utf8', 'base64');
      encryptedData += cipher.final('base64');

      const updateInfo = {
        notification_endpoint: encryptedData,
        notification_keys: JSON.stringify(keys),
        //notification_exp: expirationTime
      }
      connection.query('UPDATE users SET ? WHERE user_id = ?', [updateInfo, userId]);
    } catch (err) {
      console.log(err);
    }
  }));
});

module.exports = Router;