const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { generateRandomId } = require("../utils/tool");
const {
  subjectsTimelineCache,
  userCache,
  notificationCache,
  userFriendsCache,
} = require("../services/redisLoader");
const {
  validateString,
  validateHEX,
  validateStrictString,
} = require("../utils/validate");
const RESPONSE_MESSAGES = require("../utils/responses");
const { mainIo } = require("../sockets/io");
const { autoSignin } = require("./auth");
const { timelineSort } = require("../utils/timelineSorting");

Router.get("/", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      const subjectsTimeline = await subjectsTimelineCache(connection, userId);

      const { subjects, groupedSubjects } = timelineSort(subjectsTimeline);

      res.status(200).send({
        success: true,
        status: 200,
        data: { subjects, groupedSubjects },
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.put("/subject", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { name, color } = req.body;

      const isValidName = validateString(name, "subject name");

      if (!isValidName.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidName.reason,
          error: { reason: isValidName.reason },
        });
      }

      const isValidColor = validateHEX(color, "Color");

      if (!isValidColor.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidColor.reason,
          error: { reason: isValidColor.reason },
        });
      }

      const subject = {
        name,
        color,
        created_at: Math.floor(new Date().getTime() / 1000),
        subject_id: generateRandomId(10),
        user_id: userId,
      };

      const connection = pool.promise();
      await connection.query(`INSERT INTO subjects SET ?`, subject);
      res.status(200).send({
        success: true,
        status: 200,
        message: `Added Subject "${subject.name}"`,
        data: { subject },
      });
    } catch (err) {
      console.log(err);
      if (err.errno === 1062) {
        return res
          .status(400)
          .send({ success: false, reason: "Name already in use" });
      }
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.patch("/subject", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { subject_id: subjectId, name, color } = req.body;

      const isValidName = validateString(name, "subject name");

      if (!isValidName.isValid) {
        return res
          .status(400)
          .send({ success: false, reason: isValidName.reason });
      }

      const isValidColor = validateHEX(color, "Color");

      if (!isValidColor.isValid) {
        return res
          .status(400)
          .send({ success: false, reason: isValidColor.reason });
      }

      const isValidSubjectId = validateStrictString(
        subjectId,
        "subject id",
        10,
        10
      );

      if (!isValidSubjectId.isValid) {
        return res
          .status(400)
          .send({ success: false, reason: isValidSubjectId.reason });
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
        const response = RESPONSE_MESSAGES.noSubject();
        return res.status(response.status).send(response);
      }

      res.status(200).send({
        success: true,
        status: 200,
        message: `Modified subject "${name}"`,
        data: { subject },
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.delete("/subject", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { subject_id: subjectId } = req.body;

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
        const response = RESPONSE_MESSAGES.noSubject();
        return res.status(response.status).send(response);
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

      return res.status(200).send({
        success: true,
        status: 200,
        message: `Deleted subject "${subject.name}"`,
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.post("/subject/share", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { users, subject_id: subjectId } = req.body;

      const connection = pool.promise();

      const [userInfo, userFriends, [[subject]]] = await Promise.all([
        userCache(connection, userId),
        userFriendsCache(connection, userId),
        connection.query(
          `SELECT 
            s.name,
            GROUP_CONCAT(DISTINCT ss.user_id) AS share,
            GROUP_CONCAT(DISTINCT ssd.user_id) AS shared
            FROM subjects s
            LEFT JOIN subject_share ss ON ss.subject_id = s.subject_id
            LEFT JOIN subject_shared ssd ON ssd.subject_id = s.subject_id
            WHERE s.user_id = ? AND s.subject_id = ?`,
          [userId, subjectId]
        ),
      ]);
      if (!userInfo) {
        const response = RESPONSE_MESSAGES.noUser();
        return res.status(response.status).send(response);
      }

      if (!subject) {
        const response = RESPONSE_MESSAGES.noSubject();
        return res.status(response.status).send(response);
      }

      subject.share = subject.share ? subject.share.split(",") : [];
      subject.shared = subject.shared ? subject.shared.split(",") : [];

      const filteredUsers = users.filter(
        (user) =>
          !subject.share.includes(user) && !subject.shared.includes(user)
      );

      const friends = filteredUsers.filter((user) =>
        userFriends.includes(user)
      );

      if (friends.length) {
        const newShared = friends.map((friend) => [subjectId, friend]);
        await connection.query(
          `
          INSERT IGNORE INTO subject_shared
          (subject_id, user_id)
          VALUES ?
          `,
          [newShared]
        );
      }

      const nonFriends = filteredUsers.filter(
        (user) => !userFriends.includes(user)
      );
      if (nonFriends.length) {
        const newShare = nonFriends.map((friend) => [subjectId, friend]);
        await connection.query(
          `
          INSERT IGNORE INTO subject_share
          (subject_id, user_id)
          VALUES ?
          `,
          [newShare]
        );
      }

      const date = Math.floor(new Date().getTime() / 1000);

      nonFriends.map(async (targetId) => {
        const id = generateRandomId(5);
        const notification = {
          t: 2,
          f: userId,
          d: date,
          n: subject.name,
          si: subjectId,
        };
        const socketNotif = {
          i: id,
          t: 2,
          f: userInfo,
          d: date,
          n: subject.name,
          si: subjectId,
        };
        mainIo.to(targetId).emit("notification", socketNotif);
        redisClient.hset(
          `user:${targetId}:notifications`,
          id,
          JSON.stringify(notification)
        );
      });

      res.status(200).send({
        success: true,
        status: 200,
        message: "Subject shared!",
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.post("/subject/share/respond", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.delete("/subject/share", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { subject_id: subjectId, target_id: targetId } = req.body;

      const connection = pool.promise();
      const [[subject]] = await connection.query(
        `SELECT 
          s.name,
          s.user_id,
          JSON_ARRAYAGG(JSON_OBJECT('user_id', u.user_id, 'name', u.name)) AS shared,
          JSON_ARRAYAGG(JSON_OBJECT('user_id', u2.user_id, 'name', u2.name)) AS share
          FROM subjects s
          LEFT JOIN subject_share ss ON ss.subject_id = s.subject_id
          LEFT JOIN subject_shared ssd ON ssd.subject_id = s.subject_id
          LEFT JOIN users u ON u.user_id = ss.user_id
          LEFT JOIN users u2 ON u2.user_id = ssd.user_id
          WHERE s.user_id = ? AND s.subject_id = ?
          GROUP BY s.subject_id
          `,
        [userId, subjectId]
      );

      if (!subject) {
        const response = RESPONSE_MESSAGES.noSubject();
        return res.status(response.status).send(response);
      }

      subject.share = JSON.parse(subject.share).filter((user) => user.user_id);
      subject.shared = JSON.parse(subject.shared).filter(
        (user) => user.user_id
      );

      const allowedUsers = [
        ...subject.shared,
        ...subject.share,
        { user_id: subject.user_id },
      ];
      if (!allowedUsers.find((user) => user.user_id === userId)) {
        return res.status(400).send(RESPONSE_MESSAGES["non-memeber"]);
      }

      await connection.query(
        `
        DELETE FROM subject_share WHERE subject_id = ? AND user_id = ?;
        DELETE FROM subject_shared WHERE subject_id = ? AND user_id = ?;
      `,
        [subjectId, targetId, subjectId, targetId]
      );

      const subjectRequests = await notificationCache(targetId, 2);
      const subjectRequest = subjectRequests.find((subjectRequest) => {
        return subjectRequest.si === subjectId;
      });

      if (subjectRequest) {
        redisClient.hdel(`user:${targetId}:notifications`, subjectRequest.i);
      }

      res
        .status(200)
        .send({ success: true, status: 200, message: `Removed user!` });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.get("/subject/users", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { subject_id: subjectId } = req.query;

      const connection = pool.promise();
      const [[subject]] = await connection.query(
        `SELECT 
          s.name,
          s.user_id,
          JSON_ARRAYAGG(JSON_OBJECT('user_id', u.user_id, 'name', u.name)) AS share,
          JSON_ARRAYAGG(JSON_OBJECT('user_id', u2.user_id, 'name', u2.name)) AS shared
          FROM subjects s
          LEFT JOIN subject_share ss ON ss.subject_id = s.subject_id
          LEFT JOIN subject_shared ssd ON ssd.subject_id = s.subject_id
          LEFT JOIN users u ON u.user_id = ss.user_id
          LEFT JOIN users u2 ON u2.user_id = ssd.user_id
          WHERE s.user_id = ? AND s.subject_id = ?
          GROUP BY s.subject_id
          `,
        [userId, subjectId]
      );

      if (!subject) {
        const response = RESPONSE_MESSAGES.noSubject();
        return res.status(response.status).send(response);
      }

      subject.share = JSON.parse(subject.share).filter((user) => user.user_id);
      subject.shared = JSON.parse(subject.shared).filter(
        (user) => user.user_id
      );

      const allowedUsers = [
        ...subject.shared,
        ...subject.share,
        { user_id: subject.user_id },
      ];
      if (!allowedUsers.find((user) => user.user_id === userId)) {
        return res.status(400).send(RESPONSE_MESSAGES["non-memeber"]);
      }

      res.status(200).send({ success: true, status: 200, data: { subject } });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

module.exports = Router;
