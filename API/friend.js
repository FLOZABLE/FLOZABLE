const express = require('express');
const { autoSignin, generateRandomId, randomIntInRange } = require('../tool');
const { NotificationCache, userCache, activeSubjectCache, subjectCache, dmRoomsCache } = require('../services/redisLoader');
const redisClient = require('../model/redis');
const pool = require('../model/pool');
const { sendEmail } = require('../email');
const { validateEmail, validateStrictString, validateBoolean } = require('../validate');
const { DateTime } = require('luxon');
const { mainIo } = require('../socket');
const Router = express.Router();


//add friend
Router.post('/request', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const { targetId } = req.body;

      const isValidTargetId = validateStrictString(targetId, 'user id', 10);

      if (!isValidTargetId.isValid) {
        return res.send({ success: false, reason: isValidTargetId.reason });
      };

      if (userId === targetId) return res.send({ success: false, reason: "Cannot send request to yourself" });

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
      const notificationUser = await userCache(userId);
      const socketNotif = { i: id, t: 0, f: notificationUser, d: date };
      const notification = { i: id, t: 0, f: userId, d: date };
      mainIo.to(targetId).emit('notification', socketNotif);
      //to target user
      redisClient.sAdd(`user:${targetId}:notifications`, JSON.stringify(notification));

      //to me
      const ongoing = { i: id, t: -2, f: targetId };
      redisClient.sAdd(`user:${userId}:notifications`, JSON.stringify(ongoing));
      ongoing.f = await userCache(targetId);
      mainIo.to(userId).emit('notification', ongoing);
      res.send({ success: true, msg: `Sent friend request to ${name}!` });
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    };
  }));
});

Router.post('/request-cancel', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const { targetId } = req.body;

      const isValidTargetId = validateStrictString(targetId, 'user id', 10);

      if (!isValidTargetId.isValid) {
        return res.send({ success: false, reason: isValidTargetId.reason });
      };

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

      const friendRequests = await NotificationCache(userId, 0, false);
      const friendReq = friendRequests.find(friendReq => { return friendReq.f === targetId });
      if (!friendReq) return res.send({ success: false, reason: 'expired request' })
      redisClient.sRem(`user:${userId}:notifications`, JSON.stringify(friendReq));
      //remove it from ongoing friend req list
      const ongoing = { i: friendReq.i, t: -2, f: userId };
      redisClient.sRem(`user:${targetId}:notifications`, JSON.stringify(ongoing));
      if (!accepted) {
        return res.send({ success: true, msg: 'Declined Friend Request!' });
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
        const notification = { i: id, t: 1, f: userId, d: date };
        const notificationUser = await userCache(userId);
        const socketNotif = { i: id, t: 1, f: notificationUser, d: date };
        mainIo.to(targetId).emit('notification', socketNotif);
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
          if (chatRequest) {
            redisClient.sRem(`user:${userId}:notifications`, JSON.stringify(chatRequest));
          };

          const targetChatRequests = await NotificationCache(targetId, 4, false);
          const targetchatRequest = targetChatRequests.find(chatRequest => { return chatRequest.f === targetId });
          if (targetchatRequest) {
            redisClient.sRem(`user:${targetId}:notifications`, JSON.stringify(targetchatRequest));
          }
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
  autoSignin(req, res, (async (userId) => {
    try {
      const { targetId } = req.body;

      const isValidTargetId = validateStrictString(targetId, 'user id', 10);

      if (!isValidTargetId.isValid) {
        return res.send({ success: false, reason: isValidTargetId.reason });
      };

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
  autoSignin(req, res, (async (userId) => {
    try {
      const userInfo = await userCache(userId);
      if (!userInfo) {
        return res.send({ success: false, reason: 'No user found' });
      };
      const { friends } = userInfo;
      const userIds = await redisClient.sMembers(`allMembers`);
      const users = [];
      for (let i = 0; i < 100; i++) {
        if (users.length >= 3) {
          break;
        };
        const index = randomIntInRange(0, userIds.length - 1);
        const userId = userIds[index];
        if (!friends.includes(userId) && userId !== userInfo.userId && !users.find(user => user.user_id === userId)) {
          const recommendedUserInfo = await userCache(userId);
          if (recommendedUserInfo) {
            users.push(recommendedUserInfo);
          };
        };
      };
      res.send({ success: true, users })
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    };
  }));
});

Router.get('/status', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const userInfo = await userCache(userId);
      if (!userInfo) return res.send({ success: false, reason: `no such user` });
      const friends = userInfo.friends === "" ? [] : userInfo.friends.split(',');
      const friendsInfo = [];

      const today = DateTime.now().setZone(userInfo.timezone);
      const timezoneOffset = Math.floor(today.offset / 60).toString();

      await Promise.all(friends.map(async (friend) => {
        friend = await userCache(friend);
        if (!friend) return;
        const totalTime = await redisClient.zScore(`user:${friend.user_id}:dayTotal`, timezoneOffset);
        friend.totalTime = totalTime === null ? 0 : totalTime;
        const activeSubject = await activeSubjectCache(friend.user_id);
        console.log(activeSubject, 'aaa')
        if (activeSubject) {
          const subject = await subjectCache(friend.user_id, activeSubject.id);
          if (subject) {
            friend.activeSubject = { ...subject, total: activeSubject.total, time: activeSubject.time };
          } else {
            friend.activeSubject = activeSubject;
          };
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
      console.log(friendsInfo)
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

    const isValidQuery = validateStrictString(query, 'query', 10, 2);

    if (!isValidQuery.isValid) {
      return res.send({ success: false, reason: isValidQuery.reason });
    };

    const connection = pool.promise();
    const [users] = await connection.query(`SELECT user_id, name, timezone from users where name like ? LIMIT 10`, `%${query}%`);
    res.send({ success: true, users });
  } catch (err) {
    console.log(err);
  };
});

const MAX_DURATION = 60 * 60 * 24 * 7;

async function createFriendLink(userId) {
  try {
    let linkId = await redisClient.get(`link:friend:${userId}`);
    if (!linkId) {
      linkId = generateRandomId(5);
      redisClient.setEx(`link:friend:${userId}`, MAX_DURATION, linkId);
    };
    return linkId;
  } catch (error) {
    console.log(error)
    return false;
  };
}

Router.post('/create-link', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    const linkId = await createFriendLink(userId);
    if (linkId) {
      return res.send({ success: true, linkId });
    } else {
      return res.send({ success: false, reason: 'Err' });
    }
  }));
});

/**
 * add using link
 */

Router.get('/add', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const { id } = req.query;
      const targetId = req.query.user;

      const isValidTargetId = validateStrictString(targetId, 'user id', 10);

      if (!isValidTargetId.isValid) {
        return res.send({ success: false, reason: isValidTargetId.reason });
      };

      const isValidId = validateStrictString(id, 'add id', 10);

      if (!isValidId.isValid) {
        return res.send({ success: false, reason: isValidId.reason });
      };

      //check if its not user himself
      if (userId === targetId) return res.send({ success: false, reason: "Cannot send request to yourself" });

      const targetUserInfo = await userCache(targetId);
      if (!targetUserInfo) return res.send({ success: false, reason: 'No such user' });

      const myInfo = await userCache(userId);
      myInfo.friends = myInfo.friends === "" ? [] : myInfo.friends.split(",");
      if (myInfo.friends.includes(targetId)) return res.send({ success: false, reason: 'already friend' });

      //check if its valid linkid
      const linkId = await redisClient.get(`link:friend:${targetId}`);
      console.log(linkId)
      if (!linkId || linkId !== id) return res.send({ success: false, reason: 'Expired or invalid link' });

      const connection = pool.promise();

      //update both user & target user friend list
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

      //friend accepted notification
      const nodificationId = generateRandomId(5);
      const date = Math.floor(new Date().getTime() / (1000 * 60));
      const notification = { i: nodificationId, t: 1, f: userId, d: date };
      const notificationUser = await userCache(userId);
      const socketNotif = { i: nodificationId, t: 1, f: notificationUser, d: date };
      mainIo.to(targetId).emit('notification', socketNotif);
      redisClient.sAdd(`user:${targetId}:notifications`, JSON.stringify(notification));

      //update cached value of user

      const targetInfo = await userCache(targetId);
      targetInfo.friends = targetInfo.friends === "" ? [] : targetInfo.friends.split(",");

      myInfo.friends.push(targetId);
      redisClient.hSet(`user:${userId}`, 'friends', myInfo.friends.join(','));
      targetInfo.friends.push(userId);
      redisClient.hSet(`user:${targetId}`, 'friends', targetInfo.friends.join(','));

      const myNotifications = await NotificationCache(userId, -1, false);
      const targetNotifications = await NotificationCache(targetId, -1, false);

      //remove friend request if any from target & me
      const myFriendReqs = myNotifications.filter(notification => { return notification.f === targetId && (notification.t === 0 || notification.t === -2) });
      myFriendReqs.map(friendReq => {
        redisClient.sRem(`user:${userId}:notifications`, JSON.stringify(friendReq));
      });

      const targetFriendReqs = targetNotifications.filter(notification => { return notification.f === userId && (notification.t === 0 || notification.t === -2) });
      targetFriendReqs.map(friendReq => {
        redisClient.sRem(`user:${targetId}:notifications`, JSON.stringify(friendReq));
      });

      //create chat only if it does not exist

      const [[{ record_count }]] = await connection.query(`SELECT COUNT(*) AS record_count
        FROM chatrooms
        WHERE 
          (members LIKE ? AND members LIKE ?)
          OR
          (members LIKE ? AND members LIKE ?)
        LIMIT 1;`, [`%${userId}%`, `%${targetId}%`, `%${targetId}%`, `%${userId}%`]);

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
        const chatRequest = myNotifications.find(notification => { return notification.f === targetId && notification.t === 4 });
        if (chatRequest) {
          redisClient.sRem(`user:${userId}:notifications`, JSON.stringify(chatRequest));
        };

        const targetchatRequest = targetNotifications.find(notification => { return notification.f === userId && notification.t === 4 });
        if (targetchatRequest) {
          redisClient.sRem(`user:${targetId}:notifications`, JSON.stringify(targetchatRequest));
        };
      };
      res.send({});
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'An Error Occured' });
    };
  }));
});

Router.post('/email-invitation', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const { email } = req.body;

      const isValidEmail = validateEmail(email);

      if (!isValidEmail.isValid) {
        return res.send({ success: false, reason: isValidEmail.reason });
      };

      const linkId = await createFriendLink(userId);
      if (!linkId) return res.send({ success: false, reason: 'Error' });

      const userInfo = await userCache(userId);
      if (!userInfo) return res.send({ success: false, reason: 'Error' });
      const params = { name: userInfo.name, userId: userInfo.user_id, link: linkId };
      const to = [{ email }];
      sendEmail(to, params, 3);
      res.send({ success: true });
    } catch (err) {
      console.log(err);
      res.send({ success: false });
    };
  }));
});

module.exports = Router;