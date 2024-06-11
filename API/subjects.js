const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const notificationService = require("../services/notification");
const { generateRandomId, autoSignin } = require("../tool");
const { subjectsTimelineCache } = require("../services/redisLoader");
const {
  validateString,
  validateHEX,
  validateStrictString,
  validateArray,
} = require("../validate");
const { DateTime } = require("luxon");
const { mainIo } = require("../sockets/mainIo");

Router.put("/add", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { name, color, icon } = req.body;

      const isValidName = validateString(name, "subject name");

      if (!isValidName.isValid) {
        return res.send({ success: false, reason: isValidName.reason });
      }

      const isValidColor = validateHEX(color, "Color");

      if (!isValidColor.isValid) {
        return res.send({ success: false, reason: isValidColor.reason });
      }

      const isValidIcon = validateStrictString(icon, "icon name");

      if (!isValidIcon.isValid) {
        return res.send({ success: false, reason: isValidIcon.reason });
      }

      const subjectInfo = {
        name,
        color,
        icon,
        datum_point: Math.floor(new Date().getTime() / 1000),
        timeline: JSON.stringify([0, 0]),
        id: generateRandomId(10),
        user_id: userId,
      };
      const connection = pool.promise();
      try {
        const insertSubject = await connection.query(
          `INSERT INTO subjects SET ?`,
          subjectInfo
        );
        subjectInfo.tools = "";
        res.send({
          success: true,
          msg: `Added Subject "${subjectInfo.name}"`,
          info: { subjectInfo: subjectInfo },
        });
        delete subjectInfo.timeline;
        delete subjectInfo.user_id;
        subjectInfo.timeline_sum = 0;
        subjectInfo.tools = "";
        redisClient.hSet(
          `user:${userId}:subjects`,
          subjectInfo.id,
          JSON.stringify(subjectInfo)
        );
      } catch (err) {
        console.log(err);
      }
    } catch (error) {
      console.log(error);
    }
  });
});

Router.patch("/", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { name, color, icon, id, tools } = req.body;

      const isValidName = validateString(name, "subject name");

      if (!isValidName.isValid) {
        return res.send({ success: false, reason: isValidName.reason });
      }

      const isValidColor = validateHEX(color, "Color");

      if (!isValidColor.isValid) {
        return res.send({ success: false, reason: isValidColor.reason });
      }

      const isValidIcon = validateStrictString(icon, "icon name");

      if (!isValidIcon.isValid) {
        return res.send({ success: false, reason: isValidIcon.reason });
      }

      const isValidId = validateStrictString(id, "subject id", 10, 10);

      if (!isValidId.isValid) {
        return res.send({ success: false, reason: isValidId.reason });
      }

      const isValidTools = validateArray(tools, "tools", 10, 0);

      if (!isValidTools.isValid) {
        return res.send({ success: false, reason: isValidTools.reason });
      }

      const subjectInfo = {
        name,
        color,
        icon,
        id,
        tools: tools.join(","),
      };

      const connection = pool.promise();
      try {
        const updateSubject = await connection.query(
          "UPDATE subjects SET ? WHERE id = ? AND user_id = ?",
          [subjectInfo, id, userId]
        );
        res.send({
          success: true,
          msg: `Modified Subject "${name}"`,
          subjectInfo: subjectInfo,
        });

        const previousSubject = JSON.parse(
          await redisClient.hGet(`user:${userId}:subjects`, subjectInfo.id)
        );
        previousSubject.name = subjectInfo.name;
        previousSubject.icon = subjectInfo.icon;
        previousSubject.color = subjectInfo.color;
        previousSubject.tools = subjectInfo.tools;
        redisClient.hSet(
          `user:${userId}:subjects`,
          subjectInfo.id,
          JSON.stringify(previousSubject)
        );
      } catch (err) {
        console.log(err);
      }
    } catch (error) {
      console.log(error);
    }
  });
});

Router.delete("/subject", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { subjectId } = req.body;

      const connection = pool.promise();

      console.log(subjectId);

      /* try {
        const nowSeconds = Math.round(
          DateTime.now({ zone: "utc" }).toSeconds()
        );
        const updateSubject = await connection.query(
          "UPDATE subjects SET hidden = ? WHERE id = ? AND user_id = ?",
          [nowSeconds, subjectId, userId]
        );
        res.send({ success: true, deleteTime: nowSeconds });

        const previousSubject = JSON.parse(
          await redisClient.hGet(`user:${userId}:subjects`, subjectId)
        );
        previousSubject.hidden = nowSeconds;
        redisClient.hSet(
          `user:${userId}:subjects`,
          subjectId,
          JSON.stringify(previousSubject)
        );
      } catch (err) {
        console.log(err);
      } */
    } catch (error) {
      console.log(error);
    }
  });
});

Router.get("/", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const subjectsInfo = await subjectsTimelineCache(userId);
      res.send({ success: true, subjects: subjectsInfo });
    } catch (err) {
      console.log(err);
    }
  });
});

module.exports = Router;
