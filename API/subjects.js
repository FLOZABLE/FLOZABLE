const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { generateRandomId, autoSignin } = require("../Utils/tool");
const { subjectsTimelineCache } = require("../services/redisLoader");
const {
  validateString,
  validateHEX,
  validateStrictString,
  validateArray,
} = require("../Utils/validate");

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

Router.put("/", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { name, color, icon } = req.body;

      const isValidName = validateString(name, "subject name");

      if (!isValidName.isValid) {
        return res.send({ success: false, reason: isValidName.reason });
      }

      if (name === "others" || name === "other") {
        return res.send({ success: false, reason: "Others can't be used" });
      }

      const isValidColor = validateHEX(color, "Color");

      if (!isValidColor.isValid) {
        return res.send({ success: false, reason: isValidColor.reason });
      }

      /* const isValidIcon = validateStrictString(icon, "icon name", 10, 0);

      if (!isValidIcon.isValid) {
        return res.send({ success: false, reason: isValidIcon.reason });
      }
 */
      const subjectInfo = {
        name,
        color,
        /* icon, */
        created_at: Math.floor(new Date().getTime() / 1000),
        subject_id: generateRandomId(10),
        user_id: userId,
      };
      const connection = pool.promise();
      try {
        await connection.query(`INSERT INTO subjects SET ?`, subjectInfo);
        res.send({
          success: true,
          msg: `Added Subject "${subjectInfo.name}"`,
          subjectInfo,
        });
        delete subjectInfo.user_id;
        redisClient.hset(
          `user:${userId}:subjects`,
          subjectInfo.subject_id,
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
          await redisClient.hget(`user:${userId}:subjects`, subjectInfo.id)
        );
        previousSubject.name = subjectInfo.name;
        previousSubject.icon = subjectInfo.icon;
        previousSubject.color = subjectInfo.color;
        previousSubject.tools = subjectInfo.tools;
        redisClient.hset(
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

Router.delete("/", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { subjectId } = req.body;

      const connection = pool.promise();

      const [subjects] = await connection.query(
        `SELECT timeline, created_at, id, name FROM subjects WHERE user_id = ? AND (id = ? OR name = "others")`,
        [userId, subjectId]
      );

      const othersSubject = subjects.find((subject) => {
        return subject.name === "others";
      });

      if (othersSubject.id === subjectId || subjects.length !== 2)
        return res.send({
          success: false,
          reason: `Can't delete this subject`,
        });

      const totalTimeline = [];
      await Promise.all(
        subjects.map(async (subject) => {
          const { id } = subject;
          const prevTimeline = subjects.find((sub) => {
            return sub.id === id;
          });

          const todayTimeline = (
            await redisClient.lrange(`user:${userId}:subject:${id}`, 0, -1)
          ).map(JSON.parse);
          const parsedTimeline = JSON.parse(
            prevTimeline.timeline.replace(/^/, "[").replace(/$/, "]")
          );
          subject.timeline = parsedTimeline.concat(todayTimeline);

          subject.timeline = subject.timeline.map(([start, duration]) => {
            return [subject.created_at + start, duration];
          });

          totalTimeline.push(...subject.timeline);

          return subject;
        })
      );

      totalTimeline.sort();

      const newTimeline = totalTimeline
        .map(([start, duration]) => {
          return [start - othersSubject.created_at, duration];
        })
        .filter(([start]) => start >= 0);

      console.log(newTimeline, "fff");

      //console.log(modifiedTimeline);
      await connection.query(
        `
      UPDATE subjects
      SET timeline = ?
      WHERE id = ?;
      
      DELETE FROM subjects WHERE id = ?
    `,
        [JSON.stringify(newTimeline).slice(1, -1), othersSubject.id, subjectId]
      );

      await redisClient.del(`user:${userId}:subject:${subjectId}`);
      await redisClient.hdel(`user:${userId}:subjects`, subjectId);

      console.log("deleted");

      res.send({ success: true });
    } catch (error) {
      console.log(error);
    }
  });
});

module.exports = Router;
