const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { generateRandomId } = require("../Utils/tool");
const {
  notificationCache,
  usersCache,
  chatroomMembersCache,
  userChatroomsCache,
  chatroomMessagesCache,
} = require("../services/redisLoader");
const { validateStrictString, validateBoolean } = require("../Utils/validate");
const { mainIo } = require("../sockets/io");
const { RESPONSE_CODES } = require("../Constant");
const { autoSignin } = require("./auth");

Router.get("/rooms", async (req, res) => {
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

      const chatroomsMessages = await userChatroomsCache(userId);

      await Promise.all(
        chatrooms.map(async (chatroom) => {
          chatroom.members =
            chatroom.members === "" ? [] : chatroom.members.split(",");

          const [lastMsg] = await chatroomMessagesCache(
            connection,
            chatroom.chatroom_id,
            0,
            1
          );
          chatroom.lastMsg = lastMsg;
          chatroom.lastRead = chatroomsMessages[chatroom.chatroom_id]?.lastMsg;
          chatroom.unreads = chatroomsMessages[chatroom.chatroom_id]?.unreads;
        })
      );

      chatrooms.sort((a, b) => {
        if (!a.lastMsg && !b.lastMsg) return 0; // Both are null
        if (!a.lastMsg) return 1; // a is null, should go to the end
        if (!b.lastMsg) return -1; // b is null, should go to the end
        return b.lastMsg.sent_at - a.lastMsg.sent_at; // Both have a lastMsg, compare normally
      });

      res.send({ success: true, chatrooms });
    } catch (err) {
      console.log(err);
    }
  });
});

Router.get("/messages", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { chatroom_id, offset, length, lastMsgId } = req.query;

      console.log(req.query);

      const members = await chatroomMembersCache(null, chatroom_id);

      if (!members.includes(userId)) {
        return res.send({ success: false, reason: "Not member" });
      }

      const messages = await chatroomMessagesCache(
        null,
        chatroom_id,
        parseInt(offset),
        parseInt(length)
      );

      console.log("messages", offset, length, lastMsgId, messages.length);

      res.send({ success: true, messages, chatroom_id });
    } catch (err) {
      console.log(err);
    }
  });
});

Router.get("/members", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { chatroom_id } = req.query;

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

      if (!members.find((member) => member.user_id === userId)) {
        return res.send(RESPONSE_CODES["non-member"]);
      }

      res.send({ success: true, members });
    } catch (err) {
      console.log(err);
    }
  });
});

Router.post("/request", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { targetId } = req.body;

      const isValidTargetId = validateStrictString(targetId, "target user", 10);

      if (!isValidTargetId.isValid) {
        return res.send({ success: false, reason: isValidTargetId.reason });
      }

      if (targetId === userId) {
        return res.send({ success: false, reason: "Can't chat yourself" });
      }

      const connection = pool.promise();

      const [usersInfo, [[chatroom]]] = await Promise.all([
        usersCache(connection, [userId, targetId], false),
        connection.query(
          `
          SELECT 
          cm1.chatroom_id,
          c.name
          FROM chatroom_members cm1
          JOIN chatroom_members cm2 ON cm1.chatroom_id = cm2.chatroom_id
          JOIN chatrooms c ON c.chatroom_id = cm1.chatroom_id
          WHERE cm1.user_id = ? AND cm2.user_id = ?
        `,
          [userId, targetId]
        ),
      ]);

      if (chatroom) {
        return res.send({
          success: false,
          reason: "DM already created!",
          chatroom: chatroom,
        });
      }

      const userInfo = usersInfo.find((user) => user.user_id === userId);

      const targetUser = usersInfo.find((user) => user.user_id === targetId);

      if (!userInfo) {
        return RESPONSE_CODES["no-user"];
      }
      if (!targetUser) {
        return RESPONSE_CODES["no-target-user"];
      }

      const targetDmRequests = await notificationCache(targetId, 4);
      const prevDmRequest = targetDmRequests.find(
        (dmRequest) => dmRequest.f === userId
      );

      if (prevDmRequest) {
        return res.send({
          success: false,
          reason: "Already sent the request!",
        });
      }

      const id = generateRandomId(5);
      const date = Math.floor(new Date().getTime() / 1000);
      const notification = { t: 4, f: userId, d: date };
      const socketNotification = {
        i: id,
        t: 4,
        f: userInfo,
        d: date,
      };
      mainIo.to(targetId).emit("notification", socketNotification);
      redisClient.hset(
        `user:${targetId}:notifications`,
        id,
        JSON.stringify(notification)
      );

      res.send({ success: true, msg: `Sent request to ${targetUser.name}` });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES["error"]);
    }
  });
});

Router.post("/request/reply", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { targetId, notificationId, accepted } = req.body;

      const isValidTargetId = validateStrictString(targetId, "target user", 10);

      if (!isValidTargetId.isValid) {
        return res.send({ success: false, reason: isValidTargetId.reason });
      }

      const isValidAcceped = validateBoolean(accepted, "accept", true);

      if (!isValidAcceped.isValid) {
        return res.send({ success: false, reason: isValidAcceped.reason });
      }

      const chatReq = await redisClient.hget(
        `user:${userId}:notifications`,
        notificationId
      );
      if (!chatReq) {
        return res.send(RESPONSE_CODES["expired-request"]);
      }

      const parsedChatReq = JSON.parse(chatReq);
      if (!parsedChatReq.f === targetId) {
        return res.send(RESPONSE_CODES["expired-request"]);
      }

      redisClient.hdel(`user:${userId}:notifications`, notificationId);

      if (!accepted) {
        return res.send({ success: true, msg: `Declined chat request` });
      }
      const connection = pool.promise();

      const usersInfo = await usersCache(connection, [userId, targetId], false);

      const userInfo = usersInfo.find((user) => user.user_id === userId);

      const targetUser = usersInfo.find((user) => user.user_id === targetId);
      if (!userInfo) {
        return RESPONSE_CODES["no-user"];
      }
      if (!targetUser) {
        return RESPONSE_CODES["no-target-user"];
      }

      const chatroom_id = generateRandomId(10);
      const chatroomName = userInfo.name + ", " + targetUser.name;

      const roomInfo = {
        chatroom_id,
        type: 1,
        chatroomName,
      };
      await connection.query(
        `
        INSERT INTO chatrooms SET ?
      `,
        [roomInfo]
      );

      const newMember = [
        [userId, chatroom_id],
        [targetId, chatroom_id],
      ];

      await connection.query(
        `
        INSERT 
        INTO chatroom_members (user_id, chatroom_id) 
        VALUES ? 
        `,
        [newMember]
      );

      res.send({ success: true, msg: `Accepted chat request!` });
    } catch (error) {
      console.log(error);
      res.send(RESPONSE_CODES["error"]);
    }
  });
});

module.exports = Router;
