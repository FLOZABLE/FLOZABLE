const express = require('express');
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { autoSignin, generateRandomId } = require("../tool");
const { NotificationCache, userCache } = require('../services/redisLoader');

//send challenge
Router.post('/challenge-request', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { targetId } = req.body;

      const connection = pool.promise();
      const [[userInfo]] = await connection.query(`SELECT name FROM users WHERE user_id = ?`, [targetId]);
      let { name } = userInfo;

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
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { targetId, accepted } = req.body;
      const challenges = await NotificationCache(userId, 2, false);
      const challengeReq = challenges.find(challenge => { return challenge.f === targetId });
      if (!challengeReq) return res.send({ success: false, reason: 'Challenge Expired' })
      redisClient.sRem(`user:${userId}:notifications`, JSON.stringify(challengeReq));
      if (!accepted) {
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
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { targetId } = req.body;
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
      if (!!searchId) { //searching by id
        const [[challengeInfo]] = await connection.query(`SELECT first_user_id, second_user_id, datum_point FROM challenges WHERE id = ?`, [searchId]);
        if (!!!challengeInfo) {
          res.send({ success: false });
          return;
        }
        challengeInfo.first_user = await userCache(challengeInfo.first_user_id);
        challengeInfo.second_user = await userCache(challengeInfo.second_user_id);
        res.send({ success: true, data: challengeInfo });
      }
      else { //by user
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
      const { challengeName, challengeDescription, startDate } = req.body;

      const connection = pool.promise();
      const [[prevAmount]] = await connection.query(`SELECT COUNT(*) FROM challengerooms WHERE host_id = ?`, [userId]);
      
      if (prevAmount['COUNT(*)'] >= 5) {
        res.send({ success: false, reason: "You cannot have more than 5 open challenges" });
        return;
        // maximum 5 open challenges each user (can increase for premium)
      }

      const id = generateRandomId(10);

      const challengeInfo = {
        id: id,
        host_id: userId, //the host
        start_date: startDate, // day challenge starts
        name: challengeName,
        description: challengeDescription
      };
      const insertChallenge = await connection.query(`INSERT INTO challengerooms SET ?`, [challengeInfo]);

      res.send({ success: true, msg: `Challenge posted successfuly` });
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
      const connection = pool.promise();
      const [challengeRooms] = await connection.query(`SELECT * from challengerooms`);

      await Promise.all(challengeRooms.map(async (room) => {
        room.userInfo = await userCache(room.host_id);
      }));

      res.send({ success: true, data: challengeRooms });
    }
    catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'On Error Occured' });
    }
  }));
});

// join challenge room
Router.post('/join-challenge', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { joinId } = req.body;

      const connection = pool.promise();
      const [[challengeRoom]] = await connection.query(`SELECT * from challengerooms where id = ?`, [joinId]);

      if (!challengeRoom.id) {
        res.send({ success: false, reason: "Challenge Does Not Exist" });
        return;
      }

      const challengeInfo = {
        id: challengeRoom.id,
        first_user_id: challengeRoom.host_id,
        second_user_id: userId,
        datum_point: challengeRoom.start_date
      }
      const insertChallenge = await connection.query(`INSERT INTO challenges SET ?`, challengeInfo);

      const id = generateRandomId(5);
      const date = Math.floor(new Date().getTime() / (1000 * 60));
      const io = req.app.get('socketio');
      const notification = { i: id, t: 3, f: userId, d: date, c: joinId };
      const notificationUser = await userCache(userId);
      const socketNotif = { i: id, t: 3, f: notificationUser, d: date, c: joinId };
      io.to(challengeRoom.host_id).emit('notification', socketNotif);
      redisClient.sAdd(`user:${challengeRoom.host_id}:notifications`, JSON.stringify(notification));

      const deleteChallenge = await connection.query(`DELETE FROM challengerooms WHERE ID = ?`, [challengeRoom.id]);

      res.send({ success: true, msg: "Challenge Accepted!" });
    }
    catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'On Error Occured' });
    }
  }));
});

module.exports = Router;