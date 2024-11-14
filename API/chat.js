const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { generateRandomId } = require("../utils/tool");
const {
  notificationCache,
  usersCache,
  chatroomMembersCache,
  userChatroomsCache,
  chatroomMessagesCache,
} = require("../services/redisLoader");
const { validateStrictString, validateBoolean } = require("../utils/validate");
const { mainIo } = require("../sockets/io");
const { autoSignin } = require("./auth");
const RESPONSE_MESSAGES = require("../utils/responses");
const { NOTIFICATION_MESSAGES } = require("../Constant");

Router.get("/rooms", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
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

      res.status(200).send({ success: true, status: 200, data: { chatrooms } });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.get("/messages", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { chatroom_id, offset, length } = req.query;

      console.log(req.query);
      const members = await chatroomMembersCache(null, chatroom_id);

      if (!members.includes(userId)) {
        const response = RESPONSE_MESSAGES.nonMember();
        return res.status(response.status).send(response);
      }

      const messages = await chatroomMessagesCache(
        null,
        chatroom_id,
        parseInt(offset),
        parseInt(length)
      );

      res.status(200).send({
        success: true,
        status: 200,
        data: { messages, chatroom_id },
      });
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
        const response = RESPONSE_MESSAGES.nonMember();
        return res.status(response.status).send(response);
      }

      res.status(200).send({ success: true, status: 200, data: { members } });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.post("/request", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { target_id: targetId } = req.body;

      const isValidTargetId = validateStrictString(targetId, "target user", 10);

      if (!isValidTargetId.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidTargetId.reason,
          error: { reason: isValidTargetId.reason },
        });
      }

      if (targetId === userId) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: "Can't chat yourself",
          error: { reason: "Can't chat yourself" },
        });
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
        return res.status(400).send({
          success: false,
          status: 400,
          error: { reason: "DM already created!" },
          data: { chatroom: chatroom },
        });
      }

      const userInfo = usersInfo.find((user) => user.user_id === userId);

      const targetUser = usersInfo.find((user) => user.user_id === targetId);

      if (!userInfo) {
        const response = RESPONSE_MESSAGES.noUser();
        return res.status(response.status).send(response);
      }
      if (!targetUser) {
        const response = RESPONSE_MESSAGES.noTargetUser();
        return res.status(response.status).send(response);
      }

      const [[existingNotification]] = await connection.query(
        `
        SELECT notification_id 
        FROM notifications 
        WHERE user_id = ? AND from_user_id = ? AND type = "chat_request"
        LIMIT 1
        `,
        [targetId, userId]
      );

      if (existingNotification) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: "Already sent the request!",
          error: { reason: "Already sent the request!" },
        });
      }

      const notification_id = generateRandomId(10);
      const date = Math.floor(Date.now() / 1000);

      const notification = {
        notification_id,
        user_id: targetId,
        from_user_id: userId,
        sent_at: date,
        type: "chat_request",
        related_id: userId,
      };

      await connection.query(
        `
        INSERT INTO notifications SET ?
      `,
        [notification]
      );

      const socketNotification = {
        ...notification,
        userinfo: userInfo,
      };
      socketNotification.message = NOTIFICATION_MESSAGES.chatRequest(
        userInfo.name
      );

      mainIo.to(targetId).emit("notification", socketNotification);

      return res.send({
        success: true,
        status: 200,
        message: `Sent request to ${targetUser.name}`,
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.post("/request/reply", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { notification_id: notificationId, accepted } = req.body;

      const isValidAcceped = validateBoolean(accepted, "accept", true);

      if (!isValidAcceped.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidAcceped.reason,
          error: { reason: isValidAcceped.reason },
        });
      }

      const connection = pool.promise();

      const [[chatrequest]] = await connection.query(
        "SELECT from_user_id FROM notifications WHERE user_id = ? AND notification_id = ?",
        [userId, notificationId]
      );

      if (!chatrequest) {
        const response = RESPONSE_MESSAGES.expiredRequest();
        return res.status(response.status).send(response);
      }

      await connection.query(
        "DELETE FROM notifications WHERE user_id = ? AND notification_id = ?",
        [userId, notificationId]
      );

      if (!accepted) {
        return res.status(200).send({
          success: true,
          status: 200,
          message: `Declined chat request`,
        });
      }

      const targetId = chatrequest.from_user_id;

      const usersInfo = await usersCache(connection, [userId, targetId], false);

      const userInfo = usersInfo.find((user) => user.user_id === userId);

      const targetUser = usersInfo.find((user) => user.user_id === targetId);
      if (!userInfo) {
        const response = RESPONSE_MESSAGES.noUser();
        return res.status(response.status).send(response);
      }
      if (!targetUser) {
        const response = RESPONSE_MESSAGES.noTargetUser();
        return res.status(response.status).send(response);
      }

      const chatroom_id = generateRandomId(10);
      const chatroomName = userInfo.name + ", " + targetUser.name;

      const roomInfo = {
        chatroom_id,
        type: 1,
        name: chatroomName,
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

      roomInfo.members = [userId, targetId];
      roomInfo.lastMsg = null;
      roomInfo.lastRead = null;
      roomInfo.unreads = 0;

      mainIo
        .to([targetId, userId])
        .emit("new-chatroom", { chatroom: roomInfo });
      mainIo.in([targetId, userId]).socketsJoin(`chatroom:${chatroom_id}`);

      res.status(200).send({
        success: true,
        status: 200,
        message: `Accepted chat request!`,
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

module.exports = Router;
