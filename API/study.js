const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const notificationService = require('../services/notification');
const { io } = require("../socket");
const { generateRandomId, isValidJSON, autoSignin } = require("../tool");
const { subjectsCache, subjectsTimelineCache } = require("../services/redisLoader");

Router.post("/add-subject", async (req, res) => {
  autoSignin(req, res, (async() => {
    try {
      const userId = req.session.user_id;
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 30 },
          color: { type: 'string', minLength: 7, maxLength: 7 },
          icon: { type: 'string', minLength: 1, maxLength: 15 },
  
        },
        required: ['name', 'color', 'icon'],
        additionalProperties: false
      };
  
      const isValid = isValidJSON(req.body, schema);
      const subjectInfo = {
        ...req.body,
        datum_point: Math.floor(new Date().getTime() / 1000),
        timeline: JSON.stringify([0,0]),
        id: generateRandomId(10),
        user_id: userId,
      };
      if (isValid) {
        const connection = pool.promise();
        try {
          const insertSubject = await connection.query(`INSERT INTO subjects SET ?`, subjectInfo);
          /* const updateUser = await connection.query(`
          UPDATE users
          SET subjects = CASE
            WHEN subjects = '' THEN ?
            ELSE CONCAT(subjects, ',', ?)
          END
          WHERE user_id = ?
        `, [
            subjectInfo.id,
            subjectInfo.id,
            userId
          ]); */
          res.send({ success: true, msg: `Added Subject "${subjectInfo.name}"`, info: { subjectInfo: subjectInfo } });
          delete subjectInfo.timeline;
          delete subjectInfo.user_id;
          subjectInfo.timeline_sum = 0;
          redisClient.hSet(`user:${userId}:subjects`, subjectInfo.id, JSON.stringify(subjectInfo));
        } catch (err) {
          console.log(err);
        };
      } else {
        res.send({ success: false, reason: "Invalid Value" });
      }
    } catch (error) {
      console.log(error);
    };
  }));
})

Router.post("/start", async (req, res) => {
  autoSignin(req, res, (async() => {
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
            const io = req.app.get('socketio')
            io.to(groups).emit('reset', userId, groups);
          }
        };
      };
    });
    res.send({ success: false, msg: 'Timer Started!' });
  }));
});


Router.post("/stop", async (req, res) => {
  autoSignin(req, res, (async() => {
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
        io.to(groups).emit('stopStudying', userId, groups);
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
  autoSignin(req, res, (async() => {
    const connection = pool.promise();
    try {
      const userId = req.session.user_id;
      let searchingId = userId;

      const { searchId } = req.body;
      if (!!searchId){
        searchingId = searchId;
      }
      const subjectsInfo = await subjectsTimelineCache(searchingId);
      res.send({ success: true, subjects: subjectsInfo });
    } catch (err) {
      console.log(err);
    }
  }));
});

module.exports = Router;