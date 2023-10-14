const express = require("express");
const Router = express.Router();

Router.post("/bring-rooms", async (req, res) => {
  const groupInfo = await redisClient.hGet(`user:${tester.id}`, 'groups');
  console.log("gggg", groupInfo)
  try {
    if (!groupInfo) {
      const connection = pool.promise();
      const [[userInfo]] = await connection.query(`SELECT groups FROM users WHERE user_id = ?` , [tester.id]);
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
      console.log("roomsss", groupRooms)
      res.send({success: true, groupRooms: groupRooms});
    } else {
      const userGroups = groupInfo.split(',');
      res.send({success: true, groupRooms: ""});
    };
  } catch (err) {
    console.log(err);
  }
});

module.exports = Router;