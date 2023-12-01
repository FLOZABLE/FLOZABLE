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

      const challengeInfo = {
        id: generateRandomId(10),
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
      const friendRequests = await NotificationCache(userId, 3);
      const friendReq = friendRequests.find(friendReq => {return friendReq.f === targetId}); 
      redisClient.sRem(`user:${targetId}:notifications`, JSON.stringify(friendReq));

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
      if (!!searchId){ //searching by id
        const [[challengeInfo]] = await connection.query(`SELECT first_user_id, second_user_id, datum_point FROM challenges WHERE id = ?`, [searchId]);
        if (!!!challengeInfo){
          res.send({success: false});
          return;
        }
        challengeInfo.first_user = await userCache(challengeInfo.first_user_id);
        challengeInfo.second_user = await userCache(challengeInfo.second_user_id);
        res.send({success: true, data: challengeInfo});
      }
      else{ //by user
        const [challengeInfo] = await connection.query(`SELECT first_user_id, second_user_id, id, datum_point FROM challenges WHERE first_user_id = ? OR second_user_id = ? limit 120`, [searchUser, searchUser]);
        const namePromise = challengeInfo.map(async (challenge) => {
          challenge.first_user = await userCache(challenge.first_user_id);
          challenge.second_user = await userCache(challenge.second_user_id);
        });
        await Promise.all(namePromise);
        res.send({success: true, data: challengeInfo});
      }
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    }
  }));
 });

module.exports = Router;