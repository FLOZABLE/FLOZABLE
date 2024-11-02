const express = require("express");
const Router = express.Router();
const { deriveKey } = require("../Utils/tool");
const { validateStrictString, validateURL } = require("../Utils/validate");
const redisClient = require("../model/redis");
const { RESPONSE_MESSAGES } = require("../Constant");
const crypto = require("crypto");
const pool = require("../model/pool");
const { autoSignin } = require("./auth");

Router.get("/", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();

      const [notifications] = await connection.query(
        `
        SELECT 
          n.notification_id,
          n.user_id,
          n.from_user_id,
          n.sent_at,
          n.message,
          n.type,
          n.related_id,
          CASE 
            WHEN type LIKE '%subject%' THEN 'Subject Related'
            WHEN type LIKE '%plan%' THEN 'Plan Related'
            WHEN type LIKE '%group%' THEN 'Group Related'
            ELSE 'Other'
          END AS category
        FROM 
          notifications n
        LEFT JOIN 
          subjects s ON n.type = 'subject' AND n.related_id = s.subject_id
        LEFT JOIN 
          plans p ON n.type = 'plan' AND n.related_id = p.plan_id
        WHERE 
          n.user_id = ?;
      `,
        [userId]
      );
      console.log(notifications);
      res.send({ success: true, status: "success", data: notifications });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_MESSAGES.error);
    }
  });
});

Router.get("/vapidkeys", async (req, res) => {
  try {
    const publicKey = process.env.VAPID_PUBLIC_KEY;

    res.send({ success: true, status: "success", publicKey });
  } catch (err) {
    console.log(err);
    res.send(RESPONSE_MESSAGES.error);
  }
});

Router.post("/subscribe", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { endpoint, keys } = req.body;

      const isValidEndPoint = validateURL(endpoint);
      if (!isValidEndPoint.isValid) {
        return res.send({
          success: false,
          status: "error",
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
        return res.send(RESPONSE_MESSAGES.noUser);
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
      return res.send({ success: true, status: "success" });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_MESSAGES.error);
    }
  });
});

Router.post("/read", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { notification_id: notificationId } = req.body;

      const isValidNotificationId = validateStrictString(
        notificationId,
        "notification id",
        5
      );

      if (!isValidNotificationId.isValid) {
        return res.send({
          success: false,
          status: "error",
          message: isValidNotificationId.reason,
          error: { reason: isValidNotificationId.reason },
        });
      }

      redisClient.hdel(`user:${userId}:notifications`, notificationId);
      res.send({ success: true, status: "success" });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_MESSAGES.error);
    }
  });
});

module.exports = Router;
