const express = require('express');
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const crypto = require("crypto");
const sharp = require('sharp');
const multer = require('multer');
const webpush = require("web-push");
const { DateTime } = require('luxon');
const { hashing, autoSignin, generateRandomId, googleOauth2client } = require("../tool");
const { friendRequestsCache, NotificationCache, timerCache, activeSubjectCache, usersCache, userCache } = require('../services/redisLoader');
const upload = multer();

Router.post('/accountinfo', async (req, res) => {
  autoSignin(req, res, (async () => {
    const userId = req.session.user_id;
    const notifications = await NotificationCache(userId);
    const userInfo = await userCache(userId);
    usersCache(userId);
    res.send({ success: true, userInfo: userInfo, notifications });
  }))
});

Router.get('/activity-settings', async (req, res) => {
  autoSignin(req, res, (async () => {
    const userId = req.session.user_id;
    try {
      const connection = pool.promise();
      const [[userInfo]] = await connection.query(`SELECT activity_setting FROM users WHERE user_id = ?`, [userId]);
      if (!userInfo) return res.send({success: false, reason: 'No such user'});
      const {activity_setting} = userInfo;
      res.send({success: true, activity_setting});
    } catch (err) {
      console.log(err);
      res.send({success: false, reason: 'err'});
    };
  }))
});

Router.post('/all-accounts', async (req, res) => {
  const now = Math.floor(new Date().getTime() / 1000);
  const connection = pool.promise();
  const [membersInfo] = await connection.query('SELECT user_id, name, timezone FROM users');
  await Promise.all(membersInfo.map(async (member) => {
    let memberTimer = await redisClient.hGet(`user:${member.user_id}`, 'timerInfo');
    //const timerInfo = await timerCache(member.user_id);
    const activeSubject = await activeSubjectCache(member.user_id);
    const timer = await redisClient.lRange(`user:${member.user_id}:timer`, 0, -1);
    memberTimer = `{"datum":${now},"timeline":[[0,0]],"study":0}`
    member.study = memberTimer;
    member.timer = timer;
    member.timerInfo = null;
    member.activeSubject = activeSubject;
  }));
  res.send({success: true, membersInfo});
})

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
      req.session.loggedin = true;

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
  let { email, name, password, timeZone } = req.body;

  if (!isValidTimeZone) {
    timeZone = 'UTC';
  }
  const userDateTime = DateTime.now().setZone(timeZone);

  // Set the time to 12:00 AM
  const twelveAmDateTime = userDateTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

  // Get the Unix timestamp in seconds
  const unixTimestamp = twelveAmDateTime.toSeconds();
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
  } /* else if ((password.match(/\d/g) || []).length < 2) {
    return res.send({ success: false, reason: 'Need More Than 2 Numbers' });
  }  */else if (password.length < 6) {
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
    req.session.loggedin = true;

    res.cookie("userId", userId, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      secure: true,
      httpOnly: true,
      signed: true,
    });

    res.send({ success: true });
  });
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
        .toFile(`./public/profile-images/${userId}.jpeg`);
      res.send({ success: true });
    } catch (err) {
      console.log(err)
      res.send({ success: false, reason: 'Unsupported File Type' })
    }
  }));
});

Router.post('/update/info', async (req, res) => {
  autoSignin(req, res, (async () => {
    const connection = pool.promise();
    try {
      const { name, email, confirmEmail } = req.body;
      //const supportedLanguages = ['English', 'Spanish', 'French'];
      if (!/^[a-zA-Z0-9]+$/.test(name)) {
        return res.send({ success: false, reason: 'Invalid Name' });
      } else if (!/^[^\s@%]+@[^\s@%]+\.[^\s@%]+$/.test(email) || email.length > 320) {
        return res.send({ success: false, reason: 'Invalid Email' });
      } else if (email !== confirmEmail) {
        return res.send({ success: false, reason: 'Email Confirmation Failed' });
      }
      /* else if (!supportedLanguages.includes(language)) {
        return res.send({ success: false, reason: 'Not Supported Language' });
      } */
      const updateInfo = [{ name: name, email: email }, req.session.user_id];
      await connection.query('UPDATE users set ? WHERE user_id = ?', updateInfo);
      res.send({ success: true, msg: 'Updated Your Information!' });
    } catch (error) {
      res.send({ success: false, reason: 'Unsupported File Type' })
    } finally {
      pool.releaseConnection(connection);
    }
  }));
});


Router.post('/update/password', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const connection = pool.promise();
      const { password, confirmPassword } = req.body;
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return res.send({ success: false, reason: 'No Special Character' });
      } /* else if ((password.match(/\d/g) || []).length < 2) {
        return res.send({ success: false, reason: 'Need More Than 2 Numbers' });
      } */ else if (password.length < 6) {
        return res.send({ success: false, reason: 'Too Short' });
      } else if (password !== confirmPassword) {
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
    };
  }));
});

Router.post('/update/extension-add', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const connection = pool.promise();
      const { url } = req.body;
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
      };

      const [[userInfo]] = await connection.query(`SELECT activity_setting FROM users WHERE user_id = ?`, [userId]);
      let activitySettings = userInfo.activitySettings === "" ? [] : JSON.parse(userInfo.activity_setting.replace(/^/, "[").replace(/$/, "]"));
      const selectedActivity = activitySettings.find(activitySetting => { return activitySetting.d == domain });
      if (selectedActivity) {
        return res.send({ success: false, reason: 'Already Exist' });
      } else {
        //d: domain, b: block, t: timer
        const stringlified = JSON.stringify({ d: domain, b: 0, t: 1 });
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
      }
      res.send({ success: true, origin: origin, domain: domain })
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'Invalid URL or Domain' })
    };
  }));
});


Router.post('/update/extension-setting-update', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { d, target, value } = req.body;
      const connection = pool.promise();
      const [[userInfo]] = await connection.query(`SELECT activity_setting FROM users WHERE user_id = ?`, [userId]);
      let activitySettings = userInfo.activitySettings === "" ? [] : JSON.parse(userInfo.activity_setting.replace(/^/, "[").replace(/$/, "]"));
      const activityIndex = activitySettings.findIndex(activitySetting => { return activitySetting.d == d });
      if (activityIndex === -1) {
        return res.send({ success: false, reason: 'No Matching Website' });
      } else {
        //d: domain, b: block, t: timer
        if (target === 'block') {
          activitySettings[activityIndex] = { ...activitySettings[activityIndex], b: value ? 1 : 0 };
        } else {
          activitySettings[activityIndex] = { ...activitySettings[activityIndex], t: value ? 1 : 0 };
        };
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

      res.send({ success: true });
    } catch (error) {

    } finally {
    }
  }));
});

Router.get('/logout', function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error destroying session:", err);
    }
    res.clearCookie('userId');
    //res.redirect('/');
    res.send(200);
  });
});

Router.get('/profile/:userId', async (req, res) => {
  try {
    const connection = pool.promise();
    const targetUserId = req.params.userId;
    const [[userInfo]] = await connection.query(`SELECT name, email, user_id, groups, datum_point, timezone, friends FROM users WHERE user_id = ?`, [targetUserId]);
    if (!userInfo) return res.send({ success: false, msg: 'No such user' });
    const [subjectsInfo] = await connection.query(`SELECT id, name, icon, color, datum_point, timeline, timeline_sum FROM subjects where user_id = ?`, [targetUserId]);
    for (const subject of subjectsInfo) {
      const redisSubject = { ...subject };
      delete redisSubject.timeline;
      await redisClient.hSet(`user:${targetUserId}`, `subject:${subject.id}`, JSON.stringify(redisSubject));
      //this code adds [at the start and ] at the end
      let prevTimeline = subject.timeline === "" ? [] : JSON.parse(subject.timeline.replace(/^/, "[").replace(/$/, "]")); //wrapping the string with "[]"
      const todayTimeline = (await redisClient.lRange(`user:${targetUserId}:subject:${subject.id}`, 0, -1)).map(JSON.parse);
      subject.timeline = prevTimeline.concat(todayTimeline);
    }
    res.send({ success: true, userInfo, subjectsInfo });
  } catch (err) {
    console.log(err);
  }
});

//add friend
Router.post('/friend-request', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { targetId } = req.body;
      const connection = pool.promise();
      const [[targetUserInfo]] = await connection.query(`SELECT friends, name FROM users WHERE user_id = ?`, [targetId]);
      if (!targetUserInfo) return res.send({ success: false, reason: 'No such user' });
      
      let { friends, name } = targetUserInfo;
      friends = friends === "" ? [] : friends.split(',');

      const friendRequests = await NotificationCache(targetId, 0);
      const prevFriendReq = friendRequests.find(friendReq => {return friendReq.f === userId});
      if (!(prevFriendReq || friends.includes(userId)) && (targetId !== userId)) {
        const id = generateRandomId(5);
        const date = Math.floor(new Date().getTime() / (1000 * 60));
        const io = req.app.get('socketio');
        const notification = { i: id, t: 0, f: userId, d: date};
        io.to(targetId).emit('notification', notification);
        redisClient.sAdd(`user:${targetId}:notifications`, JSON.stringify(notification));
        res.send({ success: true, msg: `Sent friend request to ${name}!` });
      }
      else if (prevFriendReq){
        res.send({ success: false, reason: "You've already sent a request to this user"});
      }
      else if (friends.includes(userId)){
        res.send({ success: false, reason: "You're already friends with this user"});
      }
      else{
        res.send({ success: false, reason: "Cannot send request to yourself"});
      }
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    };
  }));
});

//accept friend request
Router.post('/friend-request-reply', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { targetId, accepted } = req.body;
      const friendRequests = await NotificationCache(userId, 0);
      const friendReq = friendRequests.find(friendReq => {return friendReq.f === targetId});
      if (!friendReq) return res.send({success: false, reason: 'expired request'})
      redisClient.sRem(`user:${targetId}:notifications`, JSON.stringify(friendReq));
      if (!accepted) {
        return res.send({success: true});
      };
      const connection = pool.promise();
      const [[userInfo]] = await connection.query(`SELECT friends, name FROM users WHERE user_id = ?`, [userId]);
      const [[targetInfo]] = await connection.query(`SELECT name FROM users WHERE user_id = ?`, [targetId]);
      let { friends, friend_requests, name } = userInfo;
      friends = friends === "" ? [] : friends.split(',');

      if (!friends.includes(userId)) {
        await connection.query(`
          UPDATE users
          SET friends = CASE
            WHEN friends = '' THEN ?
            ELSE CONCAT(friends, ',', ?)
          END
          WHERE user_id = ?
        `, [
          targetId,
          targetId,
          userId,
        ]);
        res.send({ success: true, msg: `You and ${targetInfo.name} are now friends!` });
        const id = generateRandomId(5);
        const date = Math.floor(new Date().getTime() / (1000 * 60));
        const io = req.app.get('socketio');
        const notification = { i: id, t: 1, f: userId, d: date};
        io.to(targetId).emit('notification', notification);
        redisClient.sAdd(`user:${targetId}:notifications`, JSON.stringify(notification))
      } else {
        res.send({ success: true, msg: `You and ${targetInfo.name} were already friends!` });
      }

      //notification part
      //redisClient.rPush()

    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'Failed' });
    };
  }));
});


Router.post('/friend-notif', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { targetId } = req.body;
      const friendRequests = await NotificationCache(targetId, 1);
      const friendReq = friendRequests.find(friendReq => {return friendReq.f === targetId}); 
      redisClient.sRem(`user:${targetId}:notifications`, JSON.stringify(friendReq));

    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    };
  }));
});


//send challenge
Router.post('/challenge-request', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { targetId } = req.body;
 
      const connection = pool.promise();
      const [[userInfo]] = await connection.query(`SELECT name FROM users WHERE user_id = ?`, [targetId]);
      let {name} = userInfo;

      const challenges = await NotificationCache(targetId, 2);
      const prevChallengeReq = challenges.find(challenge => {return challenge.f === userId}); //already sent request to this user

      if (!prevChallengeReq) { //self-detection later
        const id = generateRandomId(5);
        const date = Math.floor(new Date().getTime() / (1000 * 60));
        const io = req.app.get('socketio');
        const notification = { i: id, t: 2, f: userId, d: date};
        io.to(targetId).emit('notification', notification);
        redisClient.sAdd(`user:${targetId}:notifications`, JSON.stringify(notification));
        res.send({ success: true, msg: `Challenge sent to ${name}!` });
      }
      else{
        res.send({ success: false, reason: "You've already sent a challenge to this user"});
      }
    }
    catch (error){
      console.log(error)
      res.send({ success: false, reason: 'Failed' });
    }
  }));
 });
 
 
 //respond to challenge
 Router.post('/challenge-request-reply', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { targetId, accepted } = req.body;
      const challenges = await NotificationCache(userId, 2);
      const challengeReq = challenges.find(challenge => {return challenge.f === targetId});
      if (!challengeReq) return res.send({success: false, reason: 'Challenge Expired'})
      redisClient.sRem(`user:${targetId}:notifications`, JSON.stringify(challengeReq));
      if (!accepted) {
        return res.send({success: true, msg: "Challenge Declined"});
      };

      const id = generateRandomId(5);
      const date = Math.floor(new Date().getTime() / (1000 * 60));
      const io = req.app.get('socketio');
      const notification = { i: id, t: 3, f: userId, d: date}; // 3 = challenge accepted
      io.to(targetId).emit('notification', notification);

      redisClient.sAdd(`user:${targetId}:notifications`, JSON.stringify(notification));

      const connection = pool.promise();
      const [[userName1]] = await connection.query(`SELECT name FROM users WHERE user_id = ?`, [targetId]);
      const [[userName2]] = await connection.query(`SELECT name FROM users WHERE user_id = ?`, [userId]);

      const challengeInfo = {
        id: generateRandomId(10),
        first_user_id: targetId, //the host
        second_user_id: userId, //the recipient
        datum_point: Math.floor(new Date().getTime() / 1000),
        first_user_name: userName1.name,
        second_user_name: userName2.name
      };
      const insertSubject = await connection.query(`INSERT INTO challenges SET ?`, challengeInfo);

      res.send({ success: true, msg: `It's on!` });

    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'Failed' });
    };
  }));
 });
 

 Router.post('/challenge-notif', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { targetId } = req.body;
      const friendRequests = await NotificationCache(userId, 3);
      const friendReq = friendRequests.find(friendReq => {return friendReq.f === targetId}); 
      redisClient.sRem(`user:${targetId}:notifications`, JSON.stringify(friendReq));

    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    };
  }));
});


Router.post('/bring-challenges', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const { searchId, searchUser } = req.body; //search by challenge id or by user
      const connection = pool.promise();
      if (!!searchId){ //searching by id
        const [[challengeInfo]] = await connection.query(`SELECT first_user_id, second_user_id, first_user_name, second_user_name, datum_point FROM challenges WHERE id = ?`, [searchId]);
        if (!!!challengeInfo){
          res.send({success: false});
          return;
        }
        res.send({success: true, data: challengeInfo});
      }
      else{ //by user
        const [challengeInfo] = await connection.query(`SELECT first_user_id, second_user_id, first_user_name, second_user_name, id, datum_point FROM challenges WHERE first_user_id = ? OR second_user_id = ? limit 120`, [searchUser, searchUser]);
        res.send({success: true, data: challengeInfo});
      }
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    }
  }));
 });

const oauth2client = (refresh_token) => {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  );
  if (refresh_token) {
    auth.setCredentials({refresh_token: refresh_token});
  };
  return auth;
};

Router.post('/auth/google', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const {data} = req.body;
      const auth = googleOauth2client();
      const response = await auth.getToken(data);
      if (response.res.status === 200) {
        const connection = pool.promise();
        connection.query(`UPDATE users SET google_refresh_token = ? WHERE user_id = ?`, [response.tokens.refresh_token, userId]);
      }
      res.send({success: true, data: response})
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    };
  }));
});

module.exports = Router;