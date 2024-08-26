const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const crypto = require("crypto");
const sharp = require("sharp");
const multer = require("multer");

const {
  hashing,
  autoSignin,
  generateRandomId,
  deriveKey,
  checkGoogleAccessTokenScopes,
} = require("../Utils/tool");
const {
  validateEmail,
  validateStrictString,
  validatePassword,
  validateURL,
} = require("../Utils/validate");
const {
  notificationCache,
  userCache,
  subjectsTimelineCache,
  addActiveUserCache,
  googleAccessTokenCache,
  userFriendsCache,
  userGroupsCache,
  usersCache,
} = require("../services/redisLoader");
const {} = require("../email");
const { RESPONSE_CODES, PASSWORD_LINK_EXP } = require("../Constant");
const upload = multer();

Router.get("/", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      const [[[userInfo]], groups, friends, notifications] = await Promise.all([
        connection.query(
          `SELECT user_id, name, email, timezone, verified FROM users WHERE user_id = ?`,
          [userId]
        ),
        userGroupsCache(connection, userId),
        userFriendsCache(connection, userId),
        notificationCache(userId),
      ]);

      const notificationUserIds = notifications
        .filter((notification) => notification.f)
        .map((notification) => notification.f);
      const notificationUsers = await usersCache(
        connection,
        notificationUserIds
      );
      notifications.map((notification) => {
        notification.f = notificationUsers.find(
          (user) => user.user_id === notification.f
        );
      });
      if (!userInfo) {
        return res.send(RESPONSE_CODES["no-user"]);
      }
      userInfo.groups = groups;
      userInfo.friends = friends;
      res.send({
        success: true,
        userInfo: userInfo,
        notifications: notifications,
      });
      addActiveUserCache(userId);
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES["error"]);
    }
  });
});

Router.get("/google", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      const googleAccessToken = await googleAccessTokenCache(
        connection,
        userId
      );

      if (!googleAccessToken) {
        return res.send(RESPONSE_CODES["not-authed"]);
      }

      const [accessTokenInfo, response] = await Promise.all([
        checkGoogleAccessTokenScopes(googleAccessToken),
        fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
            Accept: "application/json",
          },
        }),
      ]);

      if (!accessTokenInfo) {
        return res.send(RESPONSE_CODES["not-authed"]);
      }
      const data = await response.json();

      data.scopes = accessTokenInfo.scope.split(" ");

      return res.send({ success: true, googleInfo: data });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES["error"]);
    }
  });
});

Router.patch("/password", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      const { password, confirmPassword } = req.body;

      const isValidPassword = validatePassword(password);
      if (!isValidPassword.isValid) {
        return res.send({ success: false, reason: isValidPassword.reason });
      }

      if (password !== confirmPassword) {
        return res.send({ success: false, reason: "Password Does Not Match" });
      }

      const [salt, hashed_password] = hashing(password);
      const updateInfo = [{ hashed_password, salt }, userId];
      await connection.query(
        "UPDATE users set ? WHERE user_id = ?",
        updateInfo
      );
      res.send({ success: true, msg: "Password Updated!" });
    } catch (error) {
      res.send({ success: false, reason: "Unsupported File Type" });
    }
  });
});

Router.patch("/image", upload.single("image"), async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      if (!req.file) {
        return res.send({ success: false, reason: "No image file found" });
      }
      const imageBuffer = req.file.buffer; // Get the image buffer from the request
      await sharp(imageBuffer)
        .toFormat("jpeg")
        .resize({ width: 800, height: 800 })
        .jpeg({ quality: 40 })
        .toFile(`./public/profile-images/${userId}.jpeg`);
      res.send({ success: true, msg: "Updated Profile Image!" });
    } catch (err) {
      console.log(err);
      res.send({ success: false, reason: "Unsupported File Type" });
    }
  });
});

Router.patch("/info", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { name, email, confirmEmail } = req.body;
      //const supportedLanguages = ['English', 'Spanish', 'French'];
      const isValidEmail = validateEmail(email);
      if (!isValidEmail.isValid) {
        return res.send({ success: false, reason: isValidEmail.reason });
      }

      const isValidName = validateStrictString(name, "Name", 25, 1);
      if (!isValidName.isValid) {
        return res.send({ success: false, reason: isValidName.reason });
      }

      if (email !== confirmEmail) {
        return res.send({
          success: false,
          reason: "Email Confirmation Failed",
        });
      }

      const connection = pool.promise();

      const [[userInfo]] = await connection.query(
        "SELECT email, verified FROM users WHERE user_id = ?",
        [userId]
      );

      if (!userInfo) {
        return res.send(RESPONSE_CODES["no-user"]);
      }

      /* else if (!supportedLanguages.includes(language)) {
        return res.send({ success: false, reason: 'Not Supported Language' });
      } */
      const verified = userInfo.email === email ? userInfo.verified : 0;
      const newUserInfo = { name, email, verified };
      redisClient.del(`user:${userId}`);
      await connection.query("UPDATE users set ? WHERE user_id = ?", [
        newUserInfo,
        userId,
      ]);
      res.send({ success: true, msg: "Updated Your Information!", verified });
    } catch (error) {
      res.send({ success: false, reason: "Unsupported File Type" });
    }
  });
});

Router.post("/notification-subscribe", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { subscription } = req.body;

      const { endpoint, expirationTime, keys } = subscription;

      const isValidEndPoint = validateURL(endpoint);
      if (!isValidEndPoint.isValid) {
        return res.send({ success: false, reason: isValidEndPoint.reason });
      }

      const connection = pool.promise();

      const [[userInfo]] = await connection.query(
        "SELECT user_id, key_salt, iv FROM users WHERE user_id = ?",
        [userId]
      );

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
    } catch (err) {
      console.log(err);
    }
  });
});

Router.get("/profile", async (req, res) => {
  try {
    const { userId } = req.query;

    const connection = pool.promise();
    const [userInfo, friends, groups, subjects] = await Promise.all([
      userCache(connection, userId),
      userFriendsCache(connection, userId),
      userGroupsCache(connection, userId),
      subjectsTimelineCache(connection, userId),
    ]);
    if (!userInfo) {
      return res.send(RESPONSE_CODES["no-user"]);
    }

    userInfo.groups = groups;

    return res.send({ success: true, userInfo, friends, subjects });
  } catch (err) {
    console.log(err);
    return res.send(RESPONSE_CODES["error"]);
  }
});

module.exports = Router;
