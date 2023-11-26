const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { autoSignin, arraysHaveSameContents, generateRandomId } = require("../tool");
const { groupCache, chatRoomsCache, usersCache, NotificationCache, dmRoomsCache } = require("../services/redisLoader");

Router.post("/bring-rooms", async (req, res) => {
  autoSignin(req, res, (async () => {
    const userId = req.session.user_id;
    let rooms = await chatRoomsCache(userId);
    const roomPromises = rooms.map(async (room) => {
      const chats = await redisClient.lRange(`room:${room.id}:chats`, 0, -1);
      return { ...room, chats };
    });
    rooms = await Promise.all(roomPromises);
    res.send({ success: true, rooms })
  }));
});

Router.post("/chat-request", async (req, res) => {
  autoSignin(req, res, (async () => {
    const userId = req.session.user_id;
    const { targetId } = req.body;
    const chatRooms = await chatRoomsCache(userId);
    //checks if group with same members exists
    const isRoomExist = chatRooms.find(chatRoom => {
      let {members} = chatRoom;
      return arraysHaveSameContents(members, [userId, targetId]);
    });
    const userExist = await usersCache(targetId);
    const targetDmRequests = await NotificationCache(targetId, 4);
    const prevDmRequest = targetDmRequests.find(dmRequest => { return dmRequest.f === userId });
    if (!isRoomExist && !prevDmRequest && userId !== targetId && userExist) {
      const id = generateRandomId(5);
      const date = Math.floor(new Date().getTime() / (1000 * 60));
      const io = req.app.get('socketio');
      const notification = { i: id, t: 4, f: userId, d: date };
      io.to(targetId).emit('notification', notification);
      redisClient.sAdd(`user:${targetId}:notifications`, JSON.stringify(notification));
    }
  }));
});

Router.post("/chat-request-reply", async (req, res) => {
  autoSignin(req, res, (async () => {
    try {
      const userId = req.session.user_id;
      const { targetId, accepted } = req.body;
      const chatRequests = await NotificationCache(userId, 4);
      const chatReq = chatRequests.find(chatReq => { return chatReq.f === targetId });
      if (!chatReq) return res.send({ success: false, reason: 'expired request' })
      redisClient.sRem(`user:${targetId}:notifications`, JSON.stringify(chatReq));
      if (!accepted) {
        return res.send({ success: true, msg: `Declined chat request`});
      };
      const connection = pool.promise();
      const targetExist = await usersCache(targetId);
      if (!targetExist) return res.send({ success: false, reason: 'No such user' });
      const members = [userId, targetId];
      const roomInfo = {
        id: generateRandomId(10),
        type: 1,
        members: JSON.stringify(members).slice(1, -1).replaceAll(`"`, "")
      }
      await connection.query(`
      INSERT INTO chatrooms SET ?
    `, [roomInfo]);
      
      res.send({ success: true, msg: `Accepted chat request!`});

      const myDmRooms = await dmRoomsCache(userId);
      myDmRooms.push(roomInfo.id);
      const targetDmRooms = await dmRoomsCache(userId);
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