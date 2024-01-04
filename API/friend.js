const express = require('express');
const { autoSignin, generateRandomId } = require('../tool');
const { NotificationCache, userCache, activeSubjectCache, subjectCache } = require('../services/redisLoader');
const redisClient = require('../model/redis');
const pool = require('../model/pool');
const Router = express.Router();


//add friend
Router.post('/request', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { targetId } = req.body;

      if (userId === targetId) return res.send({ success: false, reason: "Cannot send request to yourself" });

      const connection = pool.promise();
      const targetUserInfo = await userCache(targetId);
      if (!targetUserInfo) return res.send({ success: false, reason: 'No such user' });

      let { friends, name } = targetUserInfo;
      friends = friends === "" ? [] : friends.split(',');
      if (friends.includes(userId)) return res.send({ success: false, reason: "You're already friends with this user" });

      const friendRequests = await NotificationCache(targetId, 0, false);
      const prevFriendReq = friendRequests.find(friendReq => { return friendReq.f === userId });
      if (prevFriendReq) return res.send({ success: false, reason: "You've already sent a request to this user" });

      const id = generateRandomId(5);
      const date = Math.floor(new Date().getTime() / (1000 * 60));
      const io = req.app.get('socketio');
      const notificationUser = await userCache(userId);
      const socketNotif = { i: id, t: 0, f: notificationUser, d: date };
      const notification = { i: id, t: 0, f: userId, d: date };
      io.to(targetId).emit('notification', socketNotif);
      //to target user
      redisClient.sAdd(`user:${targetId}:notifications`, JSON.stringify(notification));

      //to me
      const ongoing = { i: id, t: -2, f: targetId };
      redisClient.sAdd(`user:${userId}:notifications`, JSON.stringify(ongoing));
      ongoing.f = await userCache(targetId);
      io.to(userId).emit('notification', ongoing);
      res.send({ success: true, msg: `Sent friend request to ${name}!` });
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    };
  }));
});

Router.post('/request-cancel', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { targetId } = req.body;
      const friendRequests = await NotificationCache(targetId, 0, false);
      const friendReq = friendRequests.find(friendReq => { return friendReq.f === userId });
      if (!friendReq) return res.send({ success: false, reason: 'expired request' })
      redisClient.sRem(`user:${targetId}:notifications`, JSON.stringify(friendReq));
      //remove it from ongoing friend req list
      const ongoing = { i: friendReq.i, t: -2, f: targetId };
      redisClient.sRem(`user:${userId}:notifications`, JSON.stringify(ongoing));
      res.send({ success: true });
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'Failed' });
    };
  }));
})

//accept friend request
Router.post('/request-reply', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { targetId, accepted } = req.body;
      const friendRequests = await NotificationCache(userId, 0, false);
      const friendReq = friendRequests.find(friendReq => { return friendReq.f === targetId });
      if (!friendReq) return res.send({ success: false, reason: 'expired request' })
      redisClient.sRem(`user:${userId}:notifications`, JSON.stringify(friendReq));
      //remove it from ongoing friend req list
      const ongoing = { i: friendReq.i, t: -2, f: userId };
      redisClient.sRem(`user:${targetId}:notifications`, JSON.stringify(ongoing));
      if (!accepted) {
        return res.send({ success: true });
      };
      const connection = pool.promise();
      const userInfo = await userCache(userId);
      const targetInfo = await userCache(targetId);
      let { friends } = userInfo;
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

        await connection.query(`
        UPDATE users
        SET friends = CASE
          WHEN friends = '' THEN ?
          ELSE CONCAT(friends, ',', ?)
        END
        WHERE user_id = ?
      `, [
          userId,
          userId,
          targetId,
        ]);
        res.send({ success: true, msg: `You and ${targetInfo.name} are now friends!` });
        const id = generateRandomId(5);
        const date = Math.floor(new Date().getTime() / (1000 * 60));
        const io = req.app.get('socketio');
        const notification = { i: id, t: 1, f: userId, d: date };
        const notificationUser = await userCache(userId);
        const socketNotif = { i: id, t: 1, f: notificationUser, d: date };
        io.to(targetId).emit('notification', socketNotif);
        redisClient.sAdd(`user:${targetId}:notifications`, JSON.stringify(notification));

        //update cached value of user
        friends.push(targetId);
        redisClient.hSet(`user:${userId}`, 'friends', friends.join(','));
        targetInfo.friends = targetInfo.friends === "" ? [] : targetInfo.friends.split(",");
        targetInfo.friends.push(userId);
        redisClient.hSet(`user:${targetId}`, 'friends', targetInfo.friends.join(','));

        //create chat only if it does not exist
        const [[{ record_count }]] = await connection.query(`SELECT COUNT(*) AS record_count
        FROM chatrooms
        WHERE 
          (members LIKE ? AND members LIKE ?)
          OR
          (members LIKE ? AND members LIKE ?)
        LIMIT 1;`, [`%${userId}%`, `%${targetId}%`, `%${targetId}%`, `%${userId}%`]);

        console.log('dm',record_count);
        if (!record_count) {
          const members = [userId, targetId];
          const roomInfo = {
            id: generateRandomId(10),
            type: 1,
            members: JSON.stringify(members).slice(1, -1).replaceAll(`"`, "")
          }
          await connection.query(`
          INSERT INTO chatrooms SET ?
        `, [roomInfo]);

          const myDmRooms = await dmRoomsCache(userId);
          myDmRooms.push(roomInfo.id);
          const targetDmRooms = await dmRoomsCache(targetId);
          targetDmRooms.push(roomInfo.id);
          redisClient.hSet(`user:${userId}`, 'dmRooms', JSON.stringify(myDmRooms));
          redisClient.hSet(`user:${targetId}`, 'dmRooms', JSON.stringify(targetDmRooms));
          redisClient.sAdd(`room:${roomInfo.id}`, members);

          //remove chat request if any
          const myChatRequests = await NotificationCache(userId, 4, false);
          const chatRequest = myChatRequests.find(chatRequest => { return chatRequest.f === targetId });
          redisClient.sRem(`user:${userId}:notifications`, JSON.stringify(chatRequest));

          const targetChatRequests = await NotificationCache(targetId, 4, false);
          const targetchatRequest = targetChatRequests.find(chatRequest => { return chatRequest.f === targetId });
          redisClient.sRem(`user:${targetId}:notifications`, JSON.stringify(targetchatRequest));
        };
      } else {
        res.send({ success: true, msg: `You and ${targetInfo.name} were already friends!` });
      };
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'Failed' });
    };
  }));
});

/**read notification so clear it from the redis */
Router.post('/checked', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { targetId } = req.body;
      const friendRequests = await NotificationCache(userId, 1, false);
      const friendReq = friendRequests.find(friendReq => { return friendReq.f === targetId });
      if (!friendReq) return res.send({ success: false, reason: 'no request found' });
      redisClient.sRem(`user:${userId}:notifications`, JSON.stringify(friendReq));
      res.send({ success: true });
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    };
  }));
});

Router.get('/recommended', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const connection = pool.promise();
      let userIds = await redisClient.sMembers(`allMembers`);
      userIds = userIds.filter(userInfo => { return userInfo !== userId });
      res.send({ success: true })
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    };
  }));
});

Router.get('/status', async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const userInfo = await userCache(userId);
      if (!userInfo) return res.send({ success: false, reason: `no such user` });
      const friends = userInfo.friends === "" ? [] : userInfo.friends.split(',');
      const friendsInfo = [];
      await Promise.all(friends.map(async (friend) => {
        friend = await userCache(friend);
        if (!friend) return;
        const totalTime = await redisClient.get(`user:${friend.user_id}:dayTotal`);
        friend.totalTime = totalTime === null ? 0 : totalTime;
        const activeSubject = await activeSubjectCache(friend.user_id);
        if (activeSubject.id) {
          const subject = await subjectCache(friend.user_id, activeSubject.id);
          if (subject) {
            friend.activeSubject = { ...subject, total: activeSubject.total, time: activeSubject.time };
          } else {
            friend.activeSubject = { id: -1, total: activeSubject.total, time: activeSubject.time };
          };
        } else {
          friend.activeSubject = activeSubject;
        };
        if (friend.ActiveGroup) {
          const ActiveGroup = JSON.parse(friend.ActiveGroup);
          const connection = pool.promise();
          const [[groupInfo]] = await connection.query("SELECT group_id, name, leader, visibility, explanation, date, members, max_members, tags, color, goal_hr, average_hr, likes, font FROM \`groups\` WHERE group_id = ?", [ActiveGroup.id]);
          if (groupInfo) {
            friend.ActiveGroup = { ...groupInfo, time: ActiveGroup.time };
          };
        };
        friendsInfo.push(friend);
      }));
      res.send({ success: true, friendsInfo })
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    };
  }));
});

Router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    console.log(query)
    if (!query || query.length < 0) return res.send({ success: false, reason: 'Invalid query, atleast 3 characters requires' });
    if (!/^[a-zA-Z0-9]+$/.test(query)) return res.send({ success: false, reason: 'Invalid query (Only A-Z, a-z, and 0-9 available)' });

    const connection = pool.promise();
    const [users] = await connection.query(`SELECT user_id, name, timezone from users where name like ?`, `%${query}%`);
    console.log('searched', users);
    res.send({ success: true, users });
  } catch (err) {
    console.log(err);
  };
});

module.exports = Router;