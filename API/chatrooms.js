const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const { autoSignin } = require("../Utils/tool");
const redisClient = require("../model/redis");
const { chatroomMemberCache } = require("../services/redisLoader");

Router.get("/", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = await pool.promise();
      const [chatrooms] = await connection.query(
        `
        SELECT
          c.chatroom_id,
          c.type,
          c.name,
          GROUP_CONCAT(cm.user_id) AS members
        FROM chatrooms c
        JOIN chatroom_members cm ON cm.chatroom_id = c.chatroom_id
        WHERE c.chatroom_id IN (
          SELECT chatroom_id FROM chatroom_members WHERE user_id = ?
        )
        GROUP BY c.chatroom_id
  
        UNION
  
        SELECT
          g.group_id AS chatroom_id,
          1 AS type,
          g.name,
          GROUP_CONCAT(gm.user_id) AS members
        FROM groups g
        JOIN group_members gm ON gm.group_id = g.group_id
        WHERE g.group_id IN (
          SELECT group_id FROM group_members WHERE user_id = ?
        )
        GROUP BY g.group_id;
      `,
        [userId, userId]
      );

      await Promise.all(
        chatrooms.map(async (chatroom) => {
          chatroom.members =
            chatroom.members === "" ? [] : chatroom.members.split(",");

          [chatroom.lastMsg] = (await redisClient.lrange(
            `chatroom:${chatroom.chatroom_id}:messages`,
            -1,
            -1
          )).map(JSON.parse);
          console.log(chatroom.lastMsg, 'gddd');
        })
      );

      res.send({ success: true, chatrooms });
    } catch (err) {
      console.log(err);
    }
  });
});

Router.get("/messages", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { chatroom_id } = req.query;

      const isIn = await chatroomMemberCache(chatroom_id, userId);

      console.log(isIn);
      if (!isIn) return res.send({ success: false, reason: "Not member" });

      const messages = (
        await redisClient.lrange(`chatroom:${chatroom_id}:messages`, 0, -1)
      ).map(JSON.parse);
      console.log(messages);

      res.send({ success: true, messages });
    } catch (err) {
      console.log(err);
    }
  });
});

Router.get("/members", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { chatroom_id } = req.query;

      const isIn = await chatroomMemberCache(chatroom_id, userId);

      if (!isIn) return res.send({ success: false, reason: "Not member" });

      const connection = pool.promise();

      const [members] = await connection.query(
        `
        SELECT u.user_id, u.name
        FROM users u
        JOIN (
          SELECT user_id
          FROM chatroom_members
          WHERE chatroom_id = ?
          
          UNION ALL
          
          SELECT gm.user_id
          FROM group_members gm
          JOIN chatrooms c ON gm.group_id = c.chatroom_id
          WHERE c.chatroom_id = ? AND c.type = 0
        ) AS combined_members ON u.user_id = combined_members.user_id
        `,
        [chatroom_id, chatroom_id]
      );

      console.log(members);

      res.send({ success: true, members });
    } catch (err) {
      console.log(err);
    }
  });
});

module.exports = Router;
