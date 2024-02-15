const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const notificationService = require('../services/notification');
const { mainIo } = require("../socket");
const { generateRandomId, isValidJSON, autoSignin } = require("../tool");
const { subjectsCache, subjectsTimelineCache } = require("../services/redisLoader");
const { validateString, validateHEX, validateStrictString, validateArray } = require("../validate");

Router.post("/add-subject", async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const { name, color, icon } = req.body;

      const isValidName = validateString(name, "subject name");

      if (!isValidName.isValid) {
        return res.send({ success: false, reason: isValidName.reason });
      };

      const isValidColor = validateHEX(color, 'Color');

      if (!isValidColor.isValid) {
        return res.send({ success: false, reason: isValidColor.reason });
      };

      const isValidIcon = validateStrictString(icon, "icon name");

      if (!isValidIcon.isValid) {
        return res.send({ success: false, reason: isValidIcon.reason });
      };

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
        const insertSubject = await connection.query(`INSERT INTO subjects SET ?`, subjectInfo);
        subjectInfo.tools = '';
        res.send({ success: true, msg: `Added Subject "${subjectInfo.name}"`, info: { subjectInfo: subjectInfo } });
        delete subjectInfo.timeline;
        delete subjectInfo.user_id;
        subjectInfo.timeline_sum = 0;
        subjectInfo.tools = '';
        redisClient.hSet(`user:${userId}:subjects`, subjectInfo.id, JSON.stringify(subjectInfo));
      } catch (err) {
        console.log(err);
      };
    } catch (error) {
      console.log(error);
    };
  }));
})


Router.post("/modify-subject", async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const { name, color, icon, id, tools } = req.body;

      const isValidName = validateString(name, "subject name");

      if (!isValidName.isValid) {
        return res.send({ success: false, reason: isValidName.reason });
      };

      const isValidColor = validateHEX(color, 'Color');

      if (!isValidColor.isValid) {
        return res.send({ success: false, reason: isValidColor.reason });
      };

      const isValidIcon = validateStrictString(icon, "icon name");

      if (!isValidIcon.isValid) {
        return res.send({ success: false, reason: isValidIcon.reason });
      };

      const isValidId = validateStrictString(id, "subject id", 10, 10);

      if (!isValidId.isValid) {
        return res.send({ success: false, reason: isValidId.reason });
      };

      const isValidTools = validateArray(tools, "tools", 10, 0);

      if (!isValidTools.isValid) {
        return res.send({ success: false, reason: isValidTools.reason });
      };

      const subjectInfo = {
        name,
        color,
        icon,
        id,
        tools: tools.join(",")
      };

      const connection = pool.promise();
      try {
        const updateSubject = await connection.query("UPDATE subjects SET ? WHERE id = ? AND user_id = ?", [subjectInfo, id, userId]);
        res.send({ success: true, msg: `Modified Subject "${name}"`, subjectInfo: subjectInfo });

        const previousSubject = JSON.parse(await redisClient.hGet(`user:${userId}:subjects`, subjectInfo.id));
        previousSubject.name = subjectInfo.name;
        previousSubject.icon = subjectInfo.icon;
        previousSubject.color = subjectInfo.color;
        previousSubject.tools = subjectInfo.tools;
        redisClient.hSet(`user:${userId}:subjects`, subjectInfo.id, JSON.stringify(previousSubject));
      } catch (err) {
        console.log(err);
      };
    } catch (error) {
      console.log(error);
    };
  }));
});

Router.post("/start", async (req, res) => {
  autoSignin(req, res, (async () => {
    const userId = req.session.user_id;
    const subjectId = req.body.subjectId;
    const userInfo = await redisClient.hGetAll(`user:${userId}`);

    Object.keys(userInfo).forEach(async (info) => {
      if (info.includes('subject:')) {
        const infoSubjectId = info.split(':')[1];
        if (infoSubjectId === subjectId) {
          const subjectInfo = JSON.parse(userInfo[info]);
          const now = Math.floor(new Date().getTime() / 1000);
          const start = now - subjectInfo.datum_point;
          const push = await redisClient.rPush(`user:${userId}:subject:${subjectId}`, `[${start},${start}]`);
          redisClient.hSet(`user:${userId}`, `ActiveSubject`, JSON.stringify(subjectInfo));
          const prevTimer = await redisClient.hGet(`user:${userId}`, 'timerInfo');
          if (prevTimer) {
            const newTimer = JSON.parse(prevTimer);
            const datum = newTimer.datum;
            //remove old timeline
            const MAXSTORELEN = 24 * 60 * 60;
            const lastVal = newTimer.timeline[newTimer.timeline.length - 1];
            const missingTotal = Math.floor((lastVal ? lastVal[1] : 0) / (MAXSTORELEN * 2));
            const newDatum = datum + missingTotal * MAXSTORELEN;
            const start = now - newDatum;
            /* while (newTimer.timeline[newTimer.timeline.length - 1] >= MAXSTORELEN) {
              newTimer.timeline = newTimer.timeline.map(([start, stop]) => {
                const newStart = start - MAXSTORELEN;
                const newStop = stop - MAXSTORELEN;
                if (newStart >= 0 && newStop >= 0) {
                  return [newStart, newStop];
                };
              });
            }; */
            if (missingTotal) {
              newTimer.timeline.map(([start, stop]) => {
                const newStart = start - missingTotal * MAXSTORELEN;
                const newStop = stop - missingTotal * MAXSTORELEN;
                if (newStart >= 0 && newStop >= 0) {
                  return [newStart, newStop];
                };
              });
            };
            newTimer.timeline.push([start, start]);
            newTimer.datum = newDatum;
            newTimer.study = 1;
            redisClient.hSet(`user:${userId}`, 'timerInfo', JSON.stringify(newTimer));
          } else {
            const newTimer = { datum: now, timeline: [[0, 0]], study: 1 };
            redisClient.hSet(`user:${userId}`, 'timerInfo', JSON.stringify(newTimer));
          };
          const groups = userInfo.groups.split(',');
          if (groups.length) {
            /* groups.map(group => {
              const socketsInRoom = io.sockets.in(group).sockets;
              console.log(group)
              // Iterate through the sockets and access socket properties
              for (const socketId in socketsInRoom) {
                const socket = socketsInRoom[socketId];
                console.log(`Socket ID: ${socket.id}, User ID: ${socket.userId}`);
              }
            }) */
            mainIo.to(groups).emit('reset', userId, groups);
          }
        };
      };
    });
    res.send({ success: false, msg: 'Timer Started!' });
  }));
});


Router.post("/stop", async (req, res) => {
  autoSignin(req, res, (async () => {
    const userId = req.session.user_id;
    const subjectId = req.body.subjectId;
    const groups = (await redisClient.hGet(`user:${userId}`, "groups")).split(',');
    const activeSubject = JSON.parse(await redisClient.hGet(`user:${userId}`, 'ActiveSubject'));
    if (activeSubject.id === subjectId) {
      const activity = JSON.parse(await redisClient.rPop(`user:${userId}:subject:${subjectId}`));
      const now = Math.floor(new Date().getTime() / 1000);
      const start = activity[0];
      const stop = now - activeSubject.datum_point;
      redisClient.rPush(`user:${userId}:subject:${subjectId}`, `[${start},${stop}]`);
      redisClient.hSet(`user:${userId}`, `ActiveSubject`, '0');
      if (groups.length) {
        mainIo.to(groups).emit('stopStudying', userId, groups);
      };
      const timerInfo = await redisClient.hGet(`user:${userId}`, 'timerInfo');
      if (timerInfo) {
        const newTimer = JSON.parse(timerInfo);
        const lastActivity = newTimer.timeline.pop();
        lastActivity[1] = now - newTimer.datum;
        newTimer.timeline.push(lastActivity);
        newTimer.study = 0;
        redisClient.hSet(`user:${userId}`, 'timerInfo', JSON.stringify(newTimer));
      };
    };
    res.send({ success: true, msg: 'Timer Stopped!' });
  }));
});

Router.post('/bring-subjects', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const searchId = req.body.searchId ? req.body.searchId : userId;

      const subjectsInfo = await subjectsTimelineCache(searchId);
      res.send({ success: true, subjects: subjectsInfo });
    } catch (err) {
      console.log(err);
    }
  }));
});

module.exports = Router;