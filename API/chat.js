const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { autoSignin, arraysHaveSameContents, generateRandomId } = require("../tool");
const { chatRoomsCache, usersCache, NotificationCache, dmRoomsCache, userCache, dmRoomMembersCache, groupMembersCache, msgReadCache } = require("../services/redisLoader");
const { validateStrictString, validateBoolean } = require("../validate");
const { mainIo } = require("../socket");

Router.post("/bring-rooms", async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    let rooms = await chatRoomsCache(userId);
    const roomPromises = rooms.map(async (room) => {
      const chats = (await redisClient.lRange(`room:${room.id}:chats`, 0, -1)).map(JSON.parse);
      return { ...room, chats };
    });
    rooms = await Promise.all(roomPromises);
    const readStatus = await redisClient.hGetAll(`user:${userId}:chats`);
    res.send({ success: true, rooms, readStatus })
  }));
});

/* Router.post("/bring-room", async (req, res) => { //Bring ONE room by ID
  const { searchId } = req.body;
  autoSignin(req, res, (async (userId) => {
    let foundRoom = false;
    let rooms = await chatRoomsCache(userId);
    rooms.map(async (room) => {
      if (room.id === searchId && !foundRoom) {
        const chats = (await redisClient.lRange(`room:${room.id}:chats`, 0, -1)).map(JSON.parse);
        res.send({ success: true, room: { ...room, chats } });
        foundRoom = true;
      }
    });
  }));
}); */

Router.get('/members', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    const { roomId } = req.query;

    const isValidRoomId = validateStrictString(roomId, 'room id', 10);

    if (!isValidRoomId.isValid) {
      return res.send({ success: false, reason: isValidRoomId.reason });
    };
    const members = await groupMembersCache(roomId);
    if (!members.includes(userId)) return res.send({ success: false, reason: 'not in group' });
    const membersInfo = await usersCache(members);
    console.log(membersInfo)
    res.send({ success: true, membersInfo });
  }));
})

Router.post("/chat-request", async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    const { targetId } = req.body;
    const isValidTargetId = validateStrictString(targetId, 'target user', 10);

    if (!isValidTargetId.isValid) {
      return res.send({ success: false, reason: isValidTargetId.reason });
    };

    if (userId === targetId) return res.send({ success: false, reason: `Can't chat yourself` });

    const chatRooms = await chatRoomsCache(userId);
    //checks if group with same members exists
    const isRoomExist = chatRooms.find(chatRoom => {
      let { members } = chatRoom;
      return arraysHaveSameContents(members.map(member => { return member.user_id }), [userId, targetId]);
    });
    if (isRoomExist) return res.send({ success: false, reason: 'DM already created!', opr: 1, room: isRoomExist });

    const targetUser = await userCache(targetId);
    if (!targetUser) return res.send({ success: false, reason: 'No such user' });

    const targetDmRequests = await NotificationCache(targetId, 4);
    const prevDmRequest = targetDmRequests.find(dmRequest => { return dmRequest.f.user_id === userId });
    if (prevDmRequest) return res.send({ success: false, reason: 'Already sent the request!' });

    const id = generateRandomId(5);
    const date = Math.floor(new Date().getTime() / (1000 * 60));
    const notification = { i: id, t: 4, f: userId, d: date };
    const socketNotification = { i: id, t: 4, f: await userCache(userId), d: date };
    mainIo.to(targetId).emit('notification', socketNotification);
    redisClient.sAdd(`user:${targetId}:notifications`, JSON.stringify(notification));
    res.send({ success: true, msg: `DM request sent!` })
  }));
});

Router.post("/chat-request-reply", async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const { targetId, accepted } = req.body;

      const isValidTargetId = validateStrictString(targetId, 'target user', 10);

      if (!isValidTargetId.isValid) {
        return res.send({ success: false, reason: isValidTargetId.reason });
      };

      const isValidAcceped = validateBoolean(accepted, 'accept', true);

      if (!isValidAcceped.isValid) {
        return res.send({ success: false, reason: isValidAcceped.reason });
      };

      const chatRequests = await NotificationCache(userId, 4, false);
      const chatReq = chatRequests.find(chatReq => { return chatReq.f === targetId });
      if (!chatReq) return res.send({ success: false, reason: 'expired request' })
      redisClient.sRem(`user:${userId}:notifications`, JSON.stringify(chatReq));
      if (!accepted) {
        return res.send({ success: true, msg: `Declined chat request` });
      };
      const connection = pool.promise();
      const targetUser = await userCache(targetId);
      if (!targetUser) return res.send({ success: false, reason: 'No such user' });
      const members = [userId, targetId];
      const roomInfo = {
        id: generateRandomId(10),
        type: 1,
        members: JSON.stringify(members).slice(1, -1).replaceAll(`"`, "")
      }
      await connection.query(`
      INSERT INTO chatrooms SET ?
    `, [roomInfo]);

      res.send({ success: true, msg: `Accepted chat request!` });

      const myDmRooms = await dmRoomsCache(userId);
      myDmRooms.push(roomInfo.id);
      const targetDmRooms = await dmRoomsCache(targetId);
      targetDmRooms.push(roomInfo.id);
      redisClient.hSet(`user:${userId}`, 'dmRooms', JSON.stringify(myDmRooms));
      redisClient.hSet(`user:${targetId}`, 'dmRooms', JSON.stringify(targetDmRooms));
      redisClient.sAdd(`room:${roomInfo.id}`, members);
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'Failed' });
    };
  }));
});

module.exports = Router;