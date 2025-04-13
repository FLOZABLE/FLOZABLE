const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const sharp = require("sharp");
const multer = require("multer");
const { hashing } = require("../utils/tool");
const {
  validateEmail,
  validateStrictString,
  validatePassword,
} = require("../utils/validate");
const {
  userCache,
  subjectsTimelineCache,
  addActiveUserCache,
  googleAccessTokenCache,
  userFriendsCache,
  userGroupsCache,
  clearGoogleAccessToken,
  activeSubjectCache,
} = require("../services/redisLoader");
const { googleOauth2client, autoSignin } = require("./auth");
const { google } = require("googleapis");
const RESPONSE_MESSAGES = require("../utils/responses");
const { timelineSorter } = require("../utils/timelineSorting");
const storage = multer.memoryStorage(); // Store file in memory buffer
const upload = multer({ storage });

Router.get("/", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      const [[[userInfo]], groups, friends] = await Promise.all([
        connection.query(
          `SELECT user_id, name, email, timezone, verified FROM users WHERE user_id = ?`,
          [userId]
        ),
        userGroupsCache(connection, userId),
        userFriendsCache(connection, userId),
      ]);
      if (!userInfo) {
        const response = RESPONSE_MESSAGES.noUser();
        return res.status(response.status).send(response);
      }
      userInfo.groups = groups;
      userInfo.friends = friends;
      userInfo.verified = !!userInfo.verified;

      res.status(200).send({
        success: true,
        status: 200,
        data: {
          userinfo: userInfo,
        },
      });
      addActiveUserCache(userId);
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.get("/google", async (req, res) => {
  const connection = pool.promise();

  autoSignin(req, res, async (userId) => {
    try {
      const googleAccessToken = await googleAccessTokenCache(
        connection,
        userId
      );

      if (!googleAccessToken) {
        const response = RESPONSE_MESSAGES.notAuthed(null);
        return res.status(response.status).send(response);
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
        const response = RESPONSE_MESSAGES.notAuthed();
        return res.status(response.status).send(response);
      }

      const data = response.data;
      data.scopes = accessTokenInfo.scopes;

      return res.status(200).send({
        success: true,
        status: 200,
        data: { google_info: data },
      });
    } catch (err) {
      console.log(err);
      if (!err?.response?.data?.error) {
        const response = RESPONSE_MESSAGES.error();
        return res.status(response.status).send(response);
      }

      if (err.response.data.error === "invalid_token") {
        clearGoogleAccessToken(connection, userId);
      }

      const code = err.response.data.error.status;

      return res.status(code).send({
        success: false,
        status: 400,
        error: {
          code,
          reason: err.response.data.error.message,
        },
      });
    }
  });
});

Router.patch("/password", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      const { password } = req.body;

      const isValidPassword = validatePassword(password);
      if (!isValidPassword.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidPassword.reason,
          error: {
            reason: isValidPassword.reason,
            code: 400,
          },
        });
      }

      const [salt, hashed_password] = hashing(password);
      const updateInfo = [{ hashed_password, salt }, userId];
      await connection.query(
        "UPDATE users set ? WHERE user_id = ?",
        updateInfo
      );
      res.status(200).send({
        success: true,
        status: 200,
        message: "Password Updated!",
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.patch("/image", upload.single("image"), async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      if (!req.file) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: "No image file found",
          error: { reason: "No image file found" },
        });
      }
      const imageBuffer = req.file.buffer; // Get the image buffer from the request
      await sharp(imageBuffer)
        .toFormat("jpeg")
        .resize({ width: 800, height: 800 })
        .jpeg({ quality: 40 })
        .toFile(`./public/img/profile-images/${userId}.jpeg`);
      res.status(200).send({
        success: true,
        status: 200,
        message: "Updated Profile Image!",
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.patch("/", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { name, email } = req.body;
      //const supportedLanguages = ['English', 'Spanish', 'French'];
      const isValidEmail = validateEmail(email);
      if (!isValidEmail.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidEmail.reason,
          error: { reason: isValidEmail.reason },
        });
      }

      const isValidName = validateStrictString(name, "Name", 25, 1);
      if (!isValidName.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidName.reason,
          error: { reason: isValidName.reason },
        });
      }

      const connection = pool.promise();

      const [[userInfo]] = await connection.query(
        "SELECT email, verified FROM users WHERE user_id = ?",
        [userId]
      );

      if (!userInfo) {
        const response = RESPONSE_MESSAGES.noUser();
        return res.status(response.status).send(response);
      }

      const verified = userInfo.email === email ? userInfo.verified : 0;
      const newUserInfo = { name, email, verified };
      redisClient.del(`user:${userId}`);
      await connection.query("UPDATE users set ? WHERE user_id = ?", [
        newUserInfo,
        userId,
      ]);

      res.status(200).send({
        success: true,
        status: 200,
        message: "Updated Your Information!",
        data: { verified },
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.get("/profile", async (req, res) => {
  try {
    const { user_id, timezone } = req.query;

    const connection = pool.promise();
    const [userInfo, friends, groups, rawSubjects] = await Promise.all([
      userCache(connection, user_id),
      userFriendsCache(connection, user_id),
      userGroupsCache(connection, user_id),
      subjectsTimelineCache(connection, user_id),
    ]);
    if (!userInfo) {
      const response = RESPONSE_MESSAGES.noUser();
      return res.status(response.status).send(response);
    }

    userInfo.groups = groups;
    const { subjects, groupedSubjects } = timelineSorter(rawSubjects, timezone);

    return res.status(200).send({
      success: true,
      status: 200,
      data: {
        userinfo: userInfo,
        friends,
        subjects,
        grouped_subjects: groupedSubjects,
      },
    });
  } catch (err) {
    console.log(err);
    const response = RESPONSE_MESSAGES.error();
    return res.status(response.status).send(response);
  }
});

Router.get("/profile/status", async (req, res) => {
  try {
    const { user_id } = req.query;

    const activeSubject = await activeSubjectCache(user_id);

    return res.status(200).send({
      success: true,
      status: 200,
      data: { active_subject: activeSubject },
    });
  } catch (err) {
    console.log(err);
    const response = RESPONSE_MESSAGES.error();
    return res.status(response.status).send(response);
  }
});

module.exports = Router;
