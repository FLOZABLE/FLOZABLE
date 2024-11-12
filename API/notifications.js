const express = require("express");
const Router = express.Router();
const { deriveKey } = require("../utils/tool");
const { validateStrictString, validateURL } = require("../utils/validate");
const redisClient = require("../model/redis");
const crypto = require("crypto");
const pool = require("../model/pool");
const { autoSignin } = require("./auth");
const RESPONSE_MESSAGES = require("../utils/responses");
const { usersCache } = require("../services/redisLoader");
const { NOTIFICATION_MESSAGES } = require("../Constant");

Router.get("/", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      const [notifications] = await connection.query(
        `
        SELECT 'friend_request_sent' AS type, friendship_id AS notification_id, friend_id AS from_user_id, date AS sent_at, NULL AS extra_info
        FROM friends
        WHERE user_id = ? AND status = "pending"
      
        UNION ALL
      
        SELECT 'friend_request' AS type, friendship_id AS notification_id, user_id AS from_user_id, date AS sent_at, NULL AS extra_info
        FROM friends
        WHERE friend_id = ? AND status = "pending"
      
        UNION ALL
      
        SELECT 'subject_share' AS type, subject_share_id AS notification_id, s.user_id AS from_user_id, ss.date AS sent_at, NULL AS extra_info
        FROM subject_share ss
        LEFT JOIN subjects s ON s.subject_id = ss.subject_id
        WHERE ss.user_id = ?
      
        UNION ALL
      
        SELECT 'plan_share' AS type, plan_share_id AS notification_id, p.user_id AS from_user_id, ps.date AS sent_at, 
          JSON_OBJECT('title', p.title, 'description', p.description) AS extra_info
        FROM plan_share ps
        LEFT JOIN plans p ON p.plan_id = ps.plan_id
        WHERE ps.user_id = ? AND ps.status = "pending"
      
        UNION ALL
      
        SELECT n.type, n.notification_id, n.from_user_id, n.sent_at, 
          CASE 
            WHEN n.type = 'plan_shared' THEN JSON_OBJECT('title', p.title)
            ELSE NULL 
          END AS extra_info
        FROM notifications n
        LEFT JOIN plans p ON p.plan_id = n.related_id
        WHERE n.user_id = ?
        `,
        [userId, userId, userId, userId, userId]
      );

      const userIds = notifications.map(
        (notification) => notification.from_user_id
      );
      const users = await usersCache(connection, userIds);
      notifications.map((notification) => {
        const userInfo = users.find(
          (user) => user.user_id === notification.from_user_id
        );

        notification.userInfo = userInfo ? userInfo : {};

        if (notification.type === "friend_request") {
          notification.message = NOTIFICATION_MESSAGES.friendRequest(
            notification.userInfo.name
          );
        } else if (notification.type === "friend_request_accepted") {
          notification.message = NOTIFICATION_MESSAGES.friendRequestAccept(
            notification.userInfo.name
          );
        } else if (notification.type === "plan_share") {
          notification.extra_info = JSON.parse(notification.extra_info);
          notification.message = NOTIFICATION_MESSAGES.planShare(
            notification.userInfo.name,
            notification.extra_info.title
          );
        } else if (notification.type === "plan_shared") {
          notification.extra_info = JSON.parse(notification.extra_info);
          notification.message = NOTIFICATION_MESSAGES.planShared(
            notification.userInfo.name,
            notification.extra_info.title
          );
        }
      });
      console.log(notifications);
      res.send({ success: true, status: 200, data: { notifications } });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.get("/vapidkeys", async (req, res) => {
  try {
    const publicKey = process.env.VAPID_PUBLIC_KEY;

    res.status(200).send({ success: true, status: 200, publicKey });
  } catch (err) {
    console.log(err);
    const response = RESPONSE_MESSAGES.error();
    return res.status(response.status).send(response);
  }
});

Router.post("/subscribe", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { endpoint, keys } = req.body;

      const isValidEndPoint = validateURL(endpoint);
      if (!isValidEndPoint.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidEndPoint.reason,
          error: { reason: isValidEndPoint.reason },
        });
      }

      const connection = pool.promise();

      const [[userInfo]] = await connection.query(
        "SELECT user_id, key_salt, iv FROM users WHERE user_id = ?",
        [userId]
      );

      if (!userInfo) {
        const response = RESPONSE_MESSAGES.noUser();
        return res.status(response.status).send(response);
      }

      const encryptKey = await deriveKey(userId, userInfo.key_salt);

      const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        Buffer.from(encryptKey, "hex"),
        Buffer.from(userInfo.iv, "hex")
      );

      let encryptedData = cipher.update(endpoint, "utf8", "base64");
      encryptedData += cipher.final("base64");

      const updateInfo = {
        notification_endpoint: encryptedData,
        notification_keys: JSON.stringify(keys),
        //notification_exp: expirationTime
      };
      connection.query("UPDATE users SET ? WHERE user_id = ?", [
        updateInfo,
        userId,
      ]);
      return res.status(200).send({ success: true, status: 200 });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.delete("/notification", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { notification_id: notificationId } = req.body;

      const isValidNotificationId = validateStrictString(
        notificationId,
        "notification id",
        10
      );

      if (!isValidNotificationId.isValid) {
        const response = RESPONSE_MESSAGES.validationError(
          isValidNotificationId
        );
        return res.status(response.status).send(response);
      }

      const connection = pool.promise();
      const [result] = await connection.query(
        "DELETE FROM notifications WHERE user_id = ? AND notification_id = ?",
        [userId, notificationId]
      );

      console.log(result);

      if (!result.affectedRows) {
        const response = RESPONSE_MESSAGES.expiredRequest();
        return res.status(response.status).send(response);
      }

      res.status(200).send({ success: true, status: 200 });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

module.exports = Router;
