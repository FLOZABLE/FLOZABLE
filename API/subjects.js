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
const { responseCodes } = require("../Constant");

Router.get("/", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const subjectsInfo = await subjectsTimelineCache(userId);

      res.send({ success: true, subjects: subjectsInfo });
    } catch (err) {
      console.log(err);
      responseCodes["error"];
    }
  });
});

Router.put("/subject", async (req, res) => {
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

Router.patch("/subject", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { name, color, subjectId } = req.body;

      const isValidName = validateString(name, "subject name");

      if (!isValidName.isValid) {
        return res.send({ success: false, reason: isValidName.reason });
      }

      const isValidColor = validateHEX(color, "Color");

      if (!isValidColor.isValid) {
        return res.send({ success: false, reason: isValidColor.reason });
      }

      /* const isValidIcon = validateStrictString(icon, "icon name");

      if (!isValidIcon.isValid) {
        return res.send({ success: false, reason: isValidIcon.reason });
      } */

      const isValidId = validateStrictString(subjectId, "subject id", 10, 10);

      if (!isValidId.isValid) {
        return res.send({ success: false, reason: isValidId.reason });
      }

      const subject = {
        name,
        color,
      };

      const connection = pool.promise();

      const [{ affectedRows }] = await connection.query(
        `UPDATE subjects SET ? WHERE subject_id = ? AND user_id = ?`,
        [subject, subjectId, userId]
      );

      if (!affectedRows) {
        return res.send(responseCodes["invalid-subject"]);
      }

      res.send({
        success: true,
        msg: `Modified Subject "${name}"`,
        subject,
      });

      const previousSubject = await redisClient.hget(
        `user:${userId}:subjects`,
        subjectId
      );

      if (previousSubject) {
        previousSubject.color = color;
        previousSubject.name = name;
        redisClient.hset(
          `user:${userId}:subjects`,
          subjectId,
          JSON.stringify(previousSubject)
        );
      }
    } catch (error) {
      console.log(error);
      res.send(responseCodes["error"]);
    }
  });
});

Router.delete("/subject", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { subjectId } = req.body;

      console.log(subjectId);

      const connection = pool.promise();

      const [[subject]] = await connection.query(
        `
        SELECT 
          s.subject_id,
          s.name,
          IF(
              COUNT(st.start_time) > 0, 
              JSON_ARRAYAGG(
                  JSON_ARRAY(
                      IFNULL(st.start_time, 0), 
                      IFNULL(st.duration, 0)
                  )
              ),
              '[]'
          ) AS timeline
          FROM subjects s
          LEFT JOIN subject_timelines st ON s.subject_id = st.subject_id
          WHERE s.user_id = ? AND s.subject_id = ?
          GROUP BY s.subject_id
      `,
        [userId, subjectId]
      );

      const [[otherSubject]] = await connection.query(
        `SELECT subject_id FROM subjects WHERE user_id = ? AND name = 'others'`,
        [userId]
      );

      if (!subject || subject.name === "others") {
        return res.send(responseCodes["invalid-subject"]);
      }

      if (otherSubject) {
        await connection.query(
          `UPDATE plans SET subject_id = ? WHERE subject_id = ?`,
          [otherSubject.subject_id, subjectId]
        );
        const todayTimeline = await redisClient.lrange(
          `user:${userId}:subject:${subjectId}`,
          0,
          -1
        );

        if (todayTimeline.length) {
          redisClient.rpush(
            `user:${userId}:subject:${otherSubject.subject_id}`,
            todayTimeline
          );
        }
        redisClient.del(`user:${userId}:subject:${subjectId}`);

        subject.timeline = JSON.parse(subject.timeline);
        const subjectTimeline = subject.timeline.map((value) => [
          otherSubject.subject_id,
          ...value,
        ]);
        console.log(subject.timeline);
        if (subjectTimeline.length) {
          await connection.query(
            `INSERT IGNORE INTO subject_timelines (subject_id, start_time, duration) VALUES ?`,
            [subjectTimeline]
          );
        }
      }

      await connection.query(
        `DELETE FROM subject_timelines WHERE subject_id = ?`,
        [subjectId]
      );

      await connection.query(
        `DELETE FROM subjects WHERE subject_id = ? AND user_id = ?`,
        [subjectId, userId]
      );

      redisClient.hdel(`user:${userId}:subjects`, subjectId);

      return res.send({ success: true, msg: `Deleted ${subject.name}` });
    } catch (error) {
      console.log(error);
    }
  });
});

module.exports = Router;
