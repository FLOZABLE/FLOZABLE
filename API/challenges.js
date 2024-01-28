const express = require('express');
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { autoSignin, generateRandomId } = require("../tool");
const { NotificationCache, userCache, challengeroomsCache } = require('../services/redisLoader');
const { DateTime } = require('luxon');
const { redis } = require('googleapis/build/src/apis/redis');
const { validateStrictString, validateBoolean, validateInteger } = require('../validate');

//send challenge
Router.post('/challenge-request', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { targetId } = req.body;

      const isValidTargetId = validateStrictString(targetId, 'user id', 10);

      if (!isValidTargetId.isValid) {
        return res.send({ success: false, reason: isValidTargetId.reason });
      };

      const connection = pool.promise();
      const [[userInfo]] = await connection.query(`SELECT name FROM users WHERE user_id = ?`, [targetId]);
      const { name } = userInfo;

      const challenges = await NotificationCache(targetId, 2, false);
      const prevChallengeReq = challenges.find(challenge => { return challenge.f === userId }); //already sent request to this user

      if (!prevChallengeReq) { //self-detection later
        const id = generateRandomId(5);
        const date = Math.floor(new Date().getTime() / (1000 * 60));
        const io = req.app.get('socketio');
        const notificationUser = await userCache(userId);
        const socketNotif = { i: id, t: 2, f: notificationUser, d: date };
        const notification = { i: id, t: 2, f: userId, d: date };
        io.to(targetId).emit('notification', socketNotif);
        redisClient.sAdd(`user:${targetId}:notifications`, JSON.stringify(notification));
        res.send({ success: true, msg: `Challenge sent to ${name}!` });
      }
      else {
        res.send({ success: false, reason: "You've already sent a challenge to this user" });
      }
    }
    catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'Failed' });
    }
  }));
});


//respond to challenge
Router.post('/challenge-request-reply', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const { targetId, accepted } = req.body;

      const isValidTargetId = validateStrictString(targetId, 'user id', 10);

      if (!isValidTargetId.isValid) {
        return res.send({ success: false, reason: isValidTargetId.reason });
      };

      const isValidAcceped = validateBoolean(accepted, 'accept', true);

      if (!isValidAcceped.isValid) {
        return res.send({ success: false, reason: isValidAcceped.reason });
      };

      const challenges = await NotificationCache(userId, 2, false);
      const challengeReq = challenges.find(challenge => { return challenge.f === targetId });
      if (!challengeReq) return res.send({ success: false, reason: 'Challenge Expired' })
      redisClient.sRem(`user:${userId}:notifications`, JSON.stringify(challengeReq));
      if (!isValidAcceped.value) {
        return res.send({ success: true, msg: "Challenge Declined" });
      };

      const id = generateRandomId(5);
      const date = Math.floor(new Date().getTime() / (1000 * 60));
      const io = req.app.get('socketio');
      const challengeId = generateRandomId(10);
      const notificationUser = await userCache(userId);
      const socketNotif = { i: id, t: 3, f: notificationUser, d: date, c: challengeId };
      const notification = { i: id, t: 3, f: userId, d: date, c: challengeId };
      io.to(targetId).emit('notification', socketNotif);
      redisClient.sAdd(`user:${targetId}:notifications`, JSON.stringify(notification));

      const connection = pool.promise();

      const challengeInfo = {
        id: challengeId,
        first_user_id: targetId, //the host
        second_user_id: userId, //the recipient
        datum_point: Math.floor(new Date().getTime() / 1000),
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
  autoSignin(req, res, (async (userId) => {
    try {
      const { targetId } = req.body;

      const isValidTargetId = validateStrictString(targetId, 'user id', 10);

      if (!isValidTargetId.isValid) {
        return res.send({ success: false, reason: isValidTargetId.reason });
      };

      const challengeRequests = await NotificationCache(userId, 3, false);
      const challengeReq = challengeRequests.find(challengeR => { return challengeR.f === targetId });
      redisClient.sRem(`user:${targetId}:notifications`, JSON.stringify(challengeReq));
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    };
  }));
});


Router.get('/', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const { searchId, searchUser } = req.query; //search by challenge id or by user
      const connection = pool.promise();
      const isValidSearchId = validateStrictString(searchId, 'user id', 10);

      if (isValidSearchId.isValid) { //searching by id
        const [[challengeInfo]] = await connection.query(`SELECT first_user_id, second_user_id, datum_point FROM challenges WHERE id = ?`, [searchId]);
        if (!challengeInfo) {
          return res.send({ success: false, reason: 'No challenge information found' });
        };
        challengeInfo.first_user = await userCache(challengeInfo.first_user_id);
        challengeInfo.second_user = await userCache(challengeInfo.second_user_id);
        res.send({ success: true, data: challengeInfo });
      }
      else { //by user
        const isValidSearchId = validateStrictString(searchUser, 'user id', 10);

        if (!isValidSearchId.isValid) {
          return res.send({ success: false, reason: isValidSearchId.reason });
        };
        const [challengeInfo] = await connection.query(`SELECT first_user_id, second_user_id, id, datum_point FROM challenges WHERE first_user_id = ? OR second_user_id = ? limit 120`, [searchUser, searchUser]);
        const namePromise = challengeInfo.map(async (challenge) => {
          challenge.first_user = await userCache(challenge.first_user_id);
          challenge.second_user = await userCache(challenge.second_user_id);
        });
        await Promise.all(namePromise);
        res.send({ success: true, data: challengeInfo });
      }
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    }
  }));
});

// post challenge
Router.post('/create-challenge', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { title, description, startDate } = req.body;
      const min = DateTime.now().toSeconds() + 3600 * 5 - 60;
      const max = DateTime.now().toSeconds() + 3600 * 24 * 30 + 60;

      const isValidStartDate = validateInteger(startDate, "start date", min, max);

      if (!isValidStartDate.isValid) {
        if (max < startDate) return res.send({ success: false, reason: "Challenge is too far in the future" });

        return res.send({ success: false, reason: isValidStartDate.reason });
      };

      const isValidDescription = validateStrictString(description, "description", 200);

      if (!isValidDescription.isValid) {
        return res.send({ success: false, reason: isValidDescription.reason });
      };

      const isValidTitle = validateInteger(startDate, "title", 20);

      if (!isValidTitle.isValid) {
        return res.send({ success: false, reason: isValidTitle.reason });
      };

      const expireSeconds = startDate - DateTime.now().toUTC().toSeconds();

      const prevAmount = await redisClient.zIncrBy(`user:${userId}:ratelimit`, 1, `activeChallenges`);
      if (prevAmount > 5) {
        res.send({ success: false, reason: "You cannot have more than 5 open challenges" });
        await redisClient.zIncrBy(`user:${userId}:ratelimit`, -1, `activeChallenges`);
        return;
        // maximum 5 open challenges each user (can increase for premium)
      }

      const id = generateRandomId(10);

      await redisClient.hSet(`challenge:${id}`, `hostId`, userId);
      redisClient.hSet(`challenge:${id}`, `startDate`, startDate);
      redisClient.hSet(`challenge:${id}`, `name`, title);
      redisClient.hSet(`challenge:${id}`, `hostId`, userId);
      redisClient.hSet(`challenge:${id}`, `description`, description);

      redisClient.sAdd('allChallenges', id);

      redisClient.expire(`challenge:${id}`, parseInt(expireSeconds));

      res.send({ success: true, msg: `Challenge posted successfuly`, challengeId: id });
    }
    catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    }
  }));
});

// get challenges
Router.get('/rooms', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const challengeRooms = await challengeroomsCache();
      console.log(challengeRooms);

      await Promise.all(challengeRooms.map(async (room) => {
        room.userInfo = await userCache(room.hostId);
        room.startDate = parseInt(room.startDate);
      }));

      res.send({ success: true, data: challengeRooms });
    }
    catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    }
  }));
});

// join challenge room
Router.post('/join-challenge', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const { joinId } = req.body;

      const isValidJoinId = validateStrictString(joinId, "challenge id", 10);

      if (!isValidJoinId.isValid) {
        return res.send({ success: false, reason: isValidJoinId.reason });
      };

      const challengeRoom = await redisClient.hGetAll(`challenge:${joinId}`);

      if (!challengeRoom || !challengeRoom.hostId) {
        res.send({ success: false, reason: "Challenge Does Not Exist" });
        return;
      }

      const connection = pool.promise();

      const deletedChallenge = redisClient.del(`challenge:${joinId}`);
      redisClient.sRem("allChallenges", [joinId]);
      redisClient.zIncrBy(`user:${challengeRoom.hostId}:ratelimit`, -1, 'activeChallenges');

      const challengeInfo = {
        id: challengeRoom.id,
        first_user_id: challengeRoom.hostId,
        second_user_id: userId,
        datum_point: challengeRoom.startDate
      }
      const insertChallenge = await connection.query(`INSERT INTO challenges SET ?`, challengeInfo);

      const id = generateRandomId(5);
      const date = Math.floor(new Date().getTime() / (1000 * 60));
      const io = req.app.get('socketio');
      const notification = { i: id, t: 3, f: userId, d: date, c: joinId };
      const notificationUser = await userCache(userId);
      const socketNotif = { i: id, t: 3, f: notificationUser, d: date, c: joinId };
      io.to(challengeRoom.host_id).emit('notification', socketNotif);
      redisClient.sAdd(`user:${challengeRoom.hostId}:notifications`, JSON.stringify(notification));

      res.send({ success: true, msg: "Challenge Accepted!" });
    }
    catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'On Error Occured' });
    }
  }));
});

module.exports = Router;