const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const sharp = require("sharp");
const multer = require("multer");
const { hashing } = require("../Utils/tool");
const {
  validateEmail,
  validateStrictString,
  validatePassword,
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
const { RESPONSE_CODES } = require("../Constant");
const { googleOauth2client, autoSignin } = require("./auth");
const { google } = require("googleapis");
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
        status: "success",
        data: {
          userInfo: userInfo,
          notifications: notifications,
        },
      });
      addActiveUserCache(userId);
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES.error);
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

      const auth = googleOauth2client({ access_token: googleAccessToken });
      const oauth2 = google.oauth2({
        auth,
        version: "v2",
      });
      const [accessTokenInfo, response] = await Promise.all([
        auth.getTokenInfo(googleAccessToken),
        oauth2.userinfo.get(),
      ]);

      if (!accessTokenInfo) {
        return res.send(RESPONSE_CODES["not-authed"]);
      }

      const data = response.data;
      data.scopes = accessTokenInfo.scopes;

      return res.send({
        success: true,
        status: "success",
        data: { googleInfo: data },
      });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES.error);
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
        return res.send({
          success: false,
          status: "error",
          message: isValidPassword.reason,
          error: { reason: isValidPassword.reason },
        });
      }

      if (password !== confirmPassword) {
        return res.send({
          success: false,
          status: "error",
          message: "Password Does Not Match",
          error: { reason: "Password Does Not Match" },
        });
      }

      const [salt, hashed_password] = hashing(password);
      const updateInfo = [{ hashed_password, salt }, userId];
      await connection.query(
        "UPDATE users set ? WHERE user_id = ?",
        updateInfo
      );
      res.send({
        success: true,
        status: "success",
        message: "Password Updated!",
      });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES.error);
    }
  });
});

Router.patch("/image", upload.single("image"), async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      if (!req.file) {
        return res.send({
          success: false,
          status: "error",
          message: "No image file found",
          error: { reason: "No image file found" },
        });
      }
      const imageBuffer = req.file.buffer; // Get the image buffer from the request
      await sharp(imageBuffer)
        .toFormat("jpeg")
        .resize({ width: 800, height: 800 })
        .jpeg({ quality: 40 })
        .toFile(`./public/profile-images/${userId}.jpeg`);
      res.send({
        success: true,
        status: "success",
        message: "Updated Profile Image!",
      });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES.error);
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
        return res.send({
          success: false,
          status: "error",
          message: isValidEmail.reason,
          error: { reason: isValidEmail.reason },
        });
      }

      const isValidName = validateStrictString(name, "Name", 25, 1);
      if (!isValidName.isValid) {
        return res.send({
          success: false,
          status: "error",
          message: isValidName.reason,
          error: { reason: isValidName.reason },
        });
      }

      if (email !== confirmEmail) {
        return res.send({
          success: false,
          status: "error",
          message: "Email Confirmation Failed",
          error: { reason: "Email Confirmation Failed" },
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

      const verified = userInfo.email === email ? userInfo.verified : 0;
      const newUserInfo = { name, email, verified };
      redisClient.del(`user:${userId}`);
      await connection.query("UPDATE users set ? WHERE user_id = ?", [
        newUserInfo,
        userId,
      ]);

      res.send({
        success: true,
        status: "success",
        message: "Updated Your Information!",
        data: { verified },
      });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES.error);
    }
  });
});

Router.get("/profile", async (req, res) => {
  try {
    const { user_id } = req.query;

    const connection = pool.promise();
    const [userInfo, friends, groups, subjects] = await Promise.all([
      userCache(connection, user_id),
      userFriendsCache(connection, user_id),
      userGroupsCache(connection, user_id),
      subjectsTimelineCache(connection, user_id),
    ]);
    if (!userInfo) {
      return res.send(RESPONSE_CODES["no-user"]);
    }

    userInfo.groups = groups;

    return res.send({
      success: true,
      status: "success",
      data: { userInfo, friends, subjects },
    });
  } catch (err) {
    console.log(err);
    return res.send(RESPONSE_CODES.error);
  }
});

module.exports = Router;
