const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const crypto = require("crypto");
const sharp = require("sharp");
const multer = require("multer");

const { hashing, autoSignin, generateRandomId, deriveKey } = require("../Utils/tool");
const {
  validateEmail,
  validateStrictString,
  validatePassword,
  validateURL,
  validateArray,
} = require("../Utils/validate");
const {
  NotificationCache,
  userCache,
  subjectsTimelineCache,
  addActiveUserCache,
  usersCache,
} = require("../services/redisLoader");
const { sendEmail } = require("../email");
const { responseCodes, PASSWORD_LINK_EXP } = require("../Constant");
const upload = multer();

Router.get("/", async (req, res) => {
  autoSignin(
    req,
    res,
    async (userId) => {
      const notifications = await NotificationCache(userId);
      const userInfo = await userCache(userId);
      if (!userInfo) {
        return res.send(responseCodes["no-user"]);
      }
      res.send({
        success: true,
        userInfo: userInfo,
        notifications: notifications,
      });
      addActiveUserCache(userId);
    },
    () => {
      res.send(responseCodes["no-user"]);
    }
  );
});

Router.post("/password-email", async (req, res) => {
  try {
    const { email } = req.body;

    const isValidEmail = validateEmail(email);

    if (!isValidEmail.isValid) {
      return res.send({ success: false, reason: isValidEmail.reason });
    }

    const connection = pool.promise();

    const [[user]] = await connection.query(
      `SELECT user_id, type FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!user || user.type === -1) {
      return res.send({ success: false, reason: responseCodes["no-user"] });
    }

    let resetId = await redisClient.get(`resetPw:${email}`);

    if (!resetId) {
      resetId = generateRandomId(30);
      redisClient.setEx(`resetPw:${email}`, PASSWORD_LINK_EXP, resetId);
      const params = {
        resetURL: `${process.env.SERVER}/account/reset-password?resetId=${resetId}&email=${email}`,
      };
      const to = [{ email }];
      sendEmail(to, params, 4);
    }

    res.send({ success: true, msg: "Check your email!" });
  } catch (err) {
    console.log(err);
    res.send({ success: false, reason: "Error" });
  }
});

Router.patch("/password/code", async (req, res) => {
  try {
    const { email, resetId, password } = req.body;

    const isValidEmail = validateEmail(email);

    if (!isValidEmail.isValid) {
      return res.send({ success: false, reason: isValidEmail.reason });
    }

    const isValidPassword = validatePassword(password);
    if (!isValidPassword.isValid) {
      return res.send({ success: false, reason: isValidPassword.reason });
    }

    const isValidResetId = validateStrictString(resetId, "reset id", 30, 30);
    if (!isValidResetId.isValid) {
      return res.send({ success: false, reason: isValidResetId.reason });
    }

    const matchedResetId = await redisClient.get(`resetPw:${email}`);

    console.log(matchedResetId, resetId);
    if (!matchedResetId || matchedResetId !== resetId) {
      return res.send({ success: false, reason: "Expired or Invalid URL" });
    }

    redisClient.del(`resetPw:${email}`);

    const connection = pool.promise();

    const [salt, hashed_password] = hashing(password);
    const updateInfo = [{ hashed_password, salt }, email];
    await connection.query("UPDATE users set ? WHERE email = ?", updateInfo);

    res.send({ success: true, msg: "Password reset successful!" });
  } catch (err) {
    console.log(err);
    res.send({ success: false, reason: "Error" });
  }
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

      const isValidName = validateStrictString(name);
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

      const [[checkEmail]] = await connection.query(
        "SELECT email, user_id FROM users WHERE email = ?",
        email
      );
      console.log(userId, checkEmail, userId);

      if (checkEmail && checkEmail.user_id !== userId) {
        return res.send({ success: false, reason: "EMAIL ALREADY IN USE" });
      }

      /* else if (!supportedLanguages.includes(language)) {
        return res.send({ success: false, reason: 'Not Supported Language' });
      } */
      const updateInfo = [{ name: name, email: email }, userId];
      redisClient.hSet(`user:${userId}`, "name", name);
      redisClient.hSet(`user:${userId}`, "email", email);
      await connection.query(
        "UPDATE users set ? WHERE user_id = ?",
        updateInfo
      );
      res.send({ success: true, msg: "Updated Your Information!" });
    } catch (error) {
      res.send({ success: false, reason: "Unsupported File Type" });
    }
  });
});

Router.get("/profile/:userId", async (req, res) => {
  try {
    const targetUserId = req.params.userId;

    const isValidUserId = validateStrictString(targetUserId, "user id", 10);

    if (!isValidUserId.isValid) {
      return res.send({ success: false, reason: isValidUserId.reason });
    }

    const userInfo = await userCache(targetUserId);
    if (!userInfo)
      return res.send({ success: false, reason: responseCodes["no-user"] });
    const friendsInfo = [];
    await Promise.all(
      userInfo.friends.map(async (friendId) => {
        const friendInfo = await userCache(friendId);
        if (friendInfo) {
          friendsInfo.push(friendInfo);
        }
      })
    );
    const subjectsInfo = await subjectsTimelineCache(targetUserId);
    res.send({ success: true, userInfo, subjectsInfo, friendsInfo });
  } catch (err) {
    console.log(err);
  }
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

Router.post("/lists", async (req, res) => {
  try {
    const { ids } = req.body;

    const isValidIds = validateArray(ids, "ids", 10, 0);
    console.log(isValidIds, ids)
    if (!isValidIds.isValid) {
      return res.send({ success: false, reason: isValidIds.reason });
    }

    const connection = pool.promise();
    const users = await usersCache(ids);
    console.log(users)
    res.send({ success: true, users });
  } catch (err) {
    console.log(err);
  }
});

module.exports = Router;
