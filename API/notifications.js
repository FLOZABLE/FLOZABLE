const express = require("express");
const Router = express.Router();
const { deriveKey } = require("../Utils/tool");
const { validateStrictString, validateURL } = require("../Utils/validate");
const redisClient = require("../model/redis");
const { RESPONSE_CODES } = require("../Constant");
const { vapidKeysCache } = require("../services/redisLoader");
const crypto = require("crypto");
const pool = require("../model/pool");
const { autoSignin } = require("./auth");

Router.get("/vapidkeys", async (req, res) => {
  const vapidKeys = await vapidKeysCache();

  if (!vapidKeys) {
    return res.send(RESPONSE_CODES["error"]);
  }

  res.send({ success: true, publicKey: vapidKeys.publicKey });
});

Router.post("/subscribe", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { endpoint, keys } = req.body;

      const isValidEndPoint = validateURL(endpoint);
      if (!isValidEndPoint.isValid) {
        return res.send({ success: false, reason: isValidEndPoint.reason });
      }

      const connection = pool.promise();

      const [[userInfo]] = await connection.query(
        "SELECT user_id, key_salt, iv FROM users WHERE user_id = ?",
        [userId]
      );

      if (!userInfo) {
        return res.send(RESPONSE_CODES["no-user"]);
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
      return res.send({ success: true });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES["error"]);
    }
  });
});

Router.post("/read", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { notificationId } = req.body;

      const isValidNotificationId = validateStrictString(
        notificationId,
        "notification id",
        5
      );

      if (!isValidNotificationId.isValid) {
        return res.send({
          success: false,
          reason: isValidNotificationId.reason,
        });
      }

      redisClient.hdel(`user:${userId}:notifications`, notificationId);
      res.send({ success: true });
    } catch (error) {
      console.log(error);
      res.send({ success: false, reason: "An Error Occured" });
    }
  });
});

module.exports = Router;
