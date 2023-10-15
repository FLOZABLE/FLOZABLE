const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const {autoSignin} = require("../tool");

Router.post("/bring-rooms", async (req, res) => {
  autoSignin(req, res, (async() => {
    const userId = req.session.user_id;
    const groupInfo = await redisClient.hGet(`user:${userId}`, 'groups');
    try {
      if (!groupInfo) {
        const connection = pool.promise();
        const [[userInfo]] = await connection.query(`SELECT groups FROM users WHERE user_id = ?` , [userId]);
        const userGroups = userInfo.groups.split(',');
        const groupRooms = await Promise.all(userGroups.map(async (group) => {
          let chatRooms = await redisClient.sMembers(`group:${group}:rooms`);
          chatRooms = chatRooms.map(room => {
            room = JSON.parse(room);
            room.status = -1;
            return room;
          });
          return chatRooms;
        }));
        res.send({success: true, groupRooms: groupRooms});
      } else {
        const userGroups = groupInfo.split(',');
        const groupRooms = await Promise.all(userGroups.map(async (group) => {
          let chatRooms = await redisClient.sMembers(`group:${group}:rooms`);
          chatRooms = chatRooms.map(room => {
            room = JSON.parse(room);
            room.status = -1;
            return room;
          });
          return {groupId: group, rooms: chatRooms};
        }));
        console.log(groupRooms)
        res.send({success: true, groupRooms: groupRooms});
      };
    } catch (err) {
      console.log(err);
    }
  }))
});

module.exports = Router;