const express = require("express");
const Router = express.Router();
const pool = require('../model/pool');
const notificationService = require('../services/notification');
const account = require('../Router/account');
const { io } = require("../socket");
const Ajv = require('ajv');
const ajv = new Ajv();
const NodeCache = require('node-cache');
const cache = new NodeCache();
const { DateTime } = require('luxon');
const crypto = require("crypto");
const redisClient = require("../model/redis");
const multer = require("multer");
const sharp = require("sharp");
const upload = multer();


const tester = { name: 't1', id: 'EoFObpf612bdJKt', timeZone: 'America/Los_Angeles', subjects: [] };

function generateRandomId(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};

function hashing(password) {
  let salt = crypto.randomBytes(32).toString('hex')
  return [salt, crypto.pbkdf2Sync(password, salt, 99097, 32, 'sha512').toString('hex')]
};

Router.post('/information/bring-subjects', async (req, res) => {
  const connection = pool.promise();
  const [subjectsInfo] = await connection.query(`SELECT id, name, icon, color, datum_point, timeline FROM subjects where user_id = ?`, [tester.id]);
  pool.releaseConnection(connection);
  for (const subject of subjectsInfo) {
    const redisSubject = { ...subject };
    delete redisSubject.timeline;
    await redisClient.hSet(`user:${tester.id}`, `subject:${subject.id}`, JSON.stringify(redisSubject));
    let prevTimeline = JSON.parse(subject.timeline);
    prevTimeline = prevTimeline.map(str => JSON.parse(str)).flat();
    const todayTimeline = (await redisClient.lRange(`user:${tester.id}:subject:${subject.id}:timeline`, 0, -1)).map(JSON.parse);
    subject.timeline = prevTimeline.concat(todayTimeline);
  }
  redisClient.hSet(`user:${tester.id}`, `ActiveSubject`, '0');
  res.send({ success: true, subjects: subjectsInfo });
});

Router.post('/information/accountinfo', async (req, res) => {
  const connection = pool.promise();
  const [[userInfo]] = await connection.query("SELECT user_id, name, email, language, groups FROM users WHERE user_id = ?", [tester.id]);
  pool.releaseConnection(connection);
  await redisClient.hSet(`user:${tester.id}`, `groups`, userInfo.groups);
  res.send({ success: true, userInfo: userInfo });
});

Router.post("/ranking", async (req, res) => {
  const connection = pool.promise();
  try {
    const [users] = await connection.query(`SELECT datum_point, daily, weekly, monthly, name, user_id from users`);

    const dailyRanking = [];
    const weeklyRanking = [];
    const monthlyRanking = [];

    //const timeZone = req.session.userInfo.timeZone;
    const timeZone = 'America/Los_Angeles';
    const userDateTime = DateTime.now().setZone(timeZone);
    const twelveAmDateTime = userDateTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    const unixTimestamp = twelveAmDateTime.toMillis();
    const cachedDate = new Date(unixTimestamp);

    if (twelveAmDateTime.minute < 30) {
      cachedDate.setMinutes(0);
    } else {
      cachedDate.setMinutes(30);
    }
    const cachedData = cache.get(cachedDate.getTime());
    if (cachedData) {
      return res.send(cachedData);
    }

    const date = DateTime.now().setZone(timeZone).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

    const usersInfo = users.map(user => {
      const datum_point = DateTime.fromMillis(user.datum_point * 1000).setZone(timeZone).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      const daily = JSON.parse(user.daily);
      const weekly = JSON.parse(user.weekly);
      const monthly = JSON.parse(user.monthly);

      let missingDay = (date.toMillis() - datum_point.toMillis()) / (1000 * 60 * 60 * 24) - daily.length + 1;

      let dateWeekStart = date.startOf('week').toMillis();
      const day = datum_point.weekday == 7 ? 0 : datum_point.weekday;
      let datum_pointWeekStart = datum_point.startOf('week').toMillis();
      let missingWeek = (dateWeekStart - datum_pointWeekStart) / (1000 * 60 * 60 * 24 * 7) - weekly.length + 1;
      let missingMonth = 0 - monthly.length + 1;
      let datumYear = datum_point.year;
      let datumMonth = datum_point.month;
      let datumMonthStart = DateTime.local(datumYear, datumMonth, 1, { zone: timeZone }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      const dateMonthStart = DateTime.local(date.year, date.month, 1, { zone: timeZone }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      while (datumMonthStart < dateMonthStart) {
        datumMonth += 1;
        if (datumMonth >= 11) {
          datumMonth = 0;
          datumYear += 1;
        }
        missingMonth += 1;
        datumMonthStart = DateTime.local(datumYear, datumMonth, 1, { zone: timeZone }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      };

      for (let i = 0; i < missingDay; i++) {
        daily.push(0);
      }

      for (let i = 0; i < missingWeek; i++) {
        weekly.push(0);
      }

      for (let i = 0; i < missingMonth; i++) {
        monthly.push(0);
      }

      daily.reverse();
      weekly.reverse();
      monthly.reverse();

      daily.map((day, index) => {
        if (!dailyRanking[index]) {
          dailyRanking.push([]);
        }
        dailyRanking[index].push({ name: user.name, user_id: user.user_id, day: day })
      })

      weekly.map((week, index) => {
        if (!weeklyRanking[index]) {
          weeklyRanking.push([]);
        }
        weeklyRanking[index].push({ name: user.name, user_id: user.user_id, week: week })
      })

      monthly.map((month, index) => {
        if (!monthlyRanking[index]) {
          monthlyRanking.push([]);
        }
        monthlyRanking[index].push({ name: user.name, user_id: user.user_id, month: month })
      })

      return { userId: user.user_id, name: user.name, daily: daily, weekly: weekly, monthly: monthly, datumPoint: user.datum_point }
    });


    //sort ranking
    dailyRanking.map(dayRanking => {
      dayRanking.sort((a, b) => {
        return b.day - a.day;
      })
    })

    weeklyRanking.map(weekRanking => {
      weekRanking.sort((a, b) => {
        return b.week - a.week;
      })
    })

    monthlyRanking.map(monthRanking => {
      monthRanking.sort((a, b) => {
        return b.month - a.month;
      })
    })

    const result = { success: true, ranking: { dailyRanking: dailyRanking, weeklyRanking: weeklyRanking, monthlyRanking: monthlyRanking, usersInfo: usersInfo } };
    res.send(result);
    cache.set(cachedDate.getTime(), result);
  } catch (error) {
    console.log(error);
    res.send({ success: false, reason: 'error' });
  } finally {
    pool.releaseConnection(connection);
  };
});

//groups

Router.post('/groups/create-validate', async (req, res) => {
  const connection = pool.promise();
  try {
    let group = req.body;
    group.font = 1;
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string', maxLength: 100 },
        explanation: { type: 'string', maxLength: 400 },
        tags: { type: 'array', maxItems: 10 },
        max_members: { type: 'integer', minimum: 0, maximum: 100 },
        visibility: { type: 'integer', minimum: 0, maximum: 1 },
        password: { type: 'string', maxLength: 30 },
        color: { type: 'string', maxLength: 8 },
        goal_hr: { type: 'integer', maximum: 24 },
        font: { type: 'integer', maximum: 30 },
      },
      required: ['name', 'explanation', 'tags', 'max_members', 'visibility', 'password', 'color', 'goal_hr', 'font'],
      additionalProperties: false
    };

    const isValid = isValidJSON(group, schema);
    console.log(group)
    if (!isValid) {
      return res.send({ success: false, reason: 'Wrong Information' });
    }

    //check name
    /* if (!/^[a-zA-Z0-9]+$/.test(group.name) || group.name.length == 0) {
      return res.send({ success: false, reason: 'Invalid Name (Only A-Z, a-z, and 0-9 available)' });
    } */
    if (!group.name.length) {
      return res.send({ success: false, reason: 'Choose name for your study group' });
    };

    //check description
    if (!group.explanation.length) {
      return res.send({ success: false, reason: 'Add description for your study group' });
    };

    let hashed = hashing(req.body['password']);

    group.tags = JSON.stringify(group.tags);
    group.password = hashed[1];
    group.salt = hashed[0];
    group.date = Math.floor(new Date().getTime() / 1000);
    group.group_id = generateRandomId(10);
    group.leader = tester.id;
    group.members = tester.id;

    try {
      const updateGroup = await connection.query('INSERT INTO \`groups\` SET ?', group);
      const updateUser = await connection.query(`
        UPDATE users
        SET \`groups\` = CASE
          WHEN \`groups\` = '' THEN ?
          ELSE CONCAT(\`groups\`, ',', ?)
        END
        WHERE user_id = ?
      `, [
        group.group_id,
        group.group_id,
        tester.id,
      ]);

      let groups = await redisClient.hGet(`user:${tester.id}`, 'groups');
      groups = groups ? groups + group.group_id : group.group_id;
      redisClient.hSet(`user:${tester.id}`, `groups`, groups);
      const groupInfo = { ...group, likes: "" };
      delete groupInfo.password;
      delete groupInfo.salt;
      res.send({ success: true, data: { group: groupInfo }, msg: `JOINED GROUP "${group.name}"` })
      //create chat room
      const roomInfo = {
        id: generateRandomId(10),
        group_id: group.group_id,
        name: 'general',
      };

      const addGroupRoom = await connection.query('INSERT INTO chatrooms set ?', roomInfo);
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'Error' })
    }
  } catch (error) {
    console.log(error)
    res.send({ success: false, reason: 'Error' })
  } finally {
    pool.releaseConnection(connection);
  }
})

Router.post('/groups/join/:id', async (req, res) => {
  const sessionDataHeader = req.headers['x-session-data'];
  if (sessionDataHeader) {
    const sessionData = JSON.parse(sessionDataHeader);
    if (sessionData.user_id && sessionData.loggedin) {
      tester.id = sessionData.user_id;
      req.session.loggedin = sessionData.loggedin;
    }
  }

  /*   if (!req.session.loggedin) {
      return res.send({ success: false, reason: 'not authenticated' });
    } */

  const groupId = req.params.id;
  const userId = tester.id;
  const connection = pool.promise();
  try {
    let [[groupInfo]] = await connection.query(`SELECT password, salt, visibility, max_members, name from \`groups\` where group_id = ?`, [groupId]);

    if (groupInfo.visibility) {
      await connection.query(
        `UPDATE users SET \`groups\` = CASE
          WHEN \`groups\` = '' THEN ?
          ELSE CONCAT(\`groups\`, ',', ?)
          END
          WHERE user_id = ?`,
        [groupId, groupId, userId]
      );

      await connection.query(
        `UPDATE \`groups\` 
        SET members = CASE 
            WHEN members = '' THEN ?
            WHEN members LIKE ? OR members LIKE ? OR members LIKE ? THEN
              members
            ELSE CONCAT(members, ',', ?)
          END WHERE group_id = ?`,
        [userId, `%,${userId},%`, `${userId},%`, `%,${userId}`, userId, groupId]
      );
    } else {
      if (!req.body.password) {
        return res.send({ success: false, reason: 'Wrong Password' });
      }
      let password = crypto.pbkdf2Sync(req.body.password, groupInfo.salt, 99097, 32, 'sha512').toString('hex');
      if (password == groupInfo.password) {
        await connection.query(
          `UPDATE users SET \`groups\` = CASE
            WHEN \`groups\` = '' THEN ?
            ELSE CONCAT(\`groups\`, ',', ?)
            END
            WHERE user_id = ?`,
          [groupId, groupId, userId]
        );

        await connection.query(
          `UPDATE \`groups\` 
          SET members = CASE 
            WHEN members = '' THEN ?
            WHEN members LIKE ? OR members LIKE ? OR members LIKE ? THEN
              members
            ELSE CONCAT(members, ',', ?)
          END WHERE group_id = ?`,
          [userId, `%,${userId},%`, `${userId},%`, `%,${userId}`, userId, groupId]
        );
      } else {
        return res.send({ success: false, reason: 'Wrong Password' });
      }
    }

    const io = req.app.get('socketio');
    io.emit('addUser', groupId, tester.id);
    res.send({ success: true, msg: `Joined group "${groupInfo.name}"` });
  } catch (err) {
    // Handle any errors that may occur during the execution of queries
    console.error('Error performing database queries:', err);
    res.send({ success: false, reason: 'An error occurred' });
  } finally {
    pool.releaseConnection(connection);
  }
})

Router.post('/groups/leave/:id', async (req, res) => {
  if (req.session.loggedin == true) {
    const groupId = req.params.id;
    const connection = pool.promise();
    try {
      const updateUser = await connection.query(`
      UPDATE users
      SET \`groups\` = 
      CASE
        WHEN \`groups\` = ? THEN ''
        ELSE TRIM(BOTH ',' FROM REPLACE(CONCAT(',', \`groups\`, ','), ',${groupId},', ','))
      END WHERE user_id = ?;
    `, [groupId, tester.id]);

      const updateGroups = await connection.query(`
    UPDATE \`groups\`
    SET members = 
    CASE
      WHEN members = ? THEN ''
      ELSE TRIM(BOTH ',' FROM REPLACE(CONCAT(',', members, ','), ',${tester.id},', ','))
    END WHERE group_id = ?;
  `, [tester.id, groupId]);
      res.send({ success: true });
      const io = req.app.get('socketio');
      io.emit('removeUser', groupId, tester.id);
    } catch (err) {
      console.error('Error performing database queries:', err);
      res.send({ success: false, reason: 'An error occurred' });
    } finally {
      pool.releaseConnection(connection);
    }
  } else {
    res.send({ success: false });
  }
});


Router.post('/groups/bring-groups', async (req, res) => {
  const connection = pool.promise();
  try {
    const [groups] = await connection.query(
      "SELECT group_id, name, leader, visibility, explanation, date, members, max_members, tags, color, goal_hr, average_hr, likes, font FROM \`groups\`"
    );
    const allMembersIds = [];
    groups.map((group) => {
      const members = group.members.split(',');
      members.map((member) => {
        if (!allMembersIds.includes(member)) {
          allMembersIds.push(member);
        };
      });
    });
    let membersInfo = [];
    const now = Math.floor(new Date().getTime() / 1000);
    if (allMembersIds.length) {
      [membersInfo] = await connection.query('SELECT user_id, name, timezone FROM users WHERE user_id IN (?)', [allMembersIds]);
      // Use Promise.all to wait for all asynchronous operations to complete
      await Promise.all(membersInfo.map(async (member) => {
        let memberTimer = await redisClient.hGet(`user:${member.user_id}`, 'timerInfo');
        if (!memberTimer) {
          memberTimer = `{"datum":${now},"timeline":[[0,0]],"study":0}`
        }
        member.study = memberTimer; // Set the study property for each member
      }));

    };
    res.send({ success: true, groups: groups, membersInfo: membersInfo });
  } catch (err) {
    // Handle any errors that may occur during the execution of queries
    console.error('Error performing database queries:', err);
    res.status(500).send({ success: false, reason: 'An error occurred' });
  } finally {
    pool.releaseConnection(connection);
  }
});

Router.post('/groups/like/:id', async (req, res) => {
  const groupId = req.params.id;
  const connection = pool.promise();
  try {
    const userId = tester.id;
    const [update] = await connection.query(
      `UPDATE \`groups\` 
      SET likes = CASE 
        WHEN likes = '' THEN ?
        WHEN likes LIKE ? OR likes LIKE ? OR likes LIKE ? OR likes = ? THEN
        TRIM(BOTH ',' FROM REPLACE(CONCAT(',', likes, ','), ',${userId},', ','))
        ELSE CONCAT(likes, ',', ?) 
        END WHERE group_id = ?`,
      [userId, `%,${userId},%`, `${userId},%`, `%,${userId}`, userId, userId, groupId]
    );
    res.send({ success: true });
  } catch (err) {
    // Handle any errors that may occur during the execution of queries
    console.error('Error performing database queries:', err);
    res.status(500).send({ success: false, reason: 'An error occurred' });
  } finally {
    pool.releaseConnection(connection);
  }
});

function isValidJSON(data, schema) {
  const validate = ajv.compile(schema);
  const isValid = validate(data);

  if (!isValid) {
    return false;
  } else {
    return true;
  };
};

Router.post("/plan/bring-plans", async (req, res) => {
  const connection = pool.promise();
  let [plans] = await connection.query(`SELECT id, title, start, end, \`repeat\`, description, notification, subject, priority, completed FROM plans where user_id = ?`, [tester.id]);
  res.send({ success: true, plans: plans });
  pool.releaseConnection(connection);
});

Router.post('/plan/update-plan', async (req, res) => {
  try {
    const planInfo = req.body;
    const now = new Date();
    const maxPlanVal = Math.floor(new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).getTime() / 1000 / 60);
    const schema = {
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 1, maxLength: 100 },
        id: { type: 'string', minLength: 10, maxLength: 10 },
        start: { type: 'integer', minimum: 0, maximum: maxPlanVal },
        end: { type: 'integer', minimum: 0, maximum: maxPlanVal },
        repeat: { type: 'integer', minimum: 0, maximum: 3 },
        description: { type: 'string', minLength: 0, maxLength: 1000 },
        subject: { type: 'string', minLength: 10, maxLength: 10 },
        notification: { type: 'integer', minimum: -1, maximum: 60 },
        priority: { type: 'integer', minimum: 0, maximum: 100 },
        completed: { type: 'integer', minimum: 0, maximum: 1 }
      },
      required: ['title', 'id', 'start', 'end', 'repeat', 'description', 'notification', 'subject', 'priority', 'completed'],
      additionalProperties: false
    };

    const isValid = isValidJSON(planInfo, schema);

    if (planInfo.start > planInfo.end) {
      return res.send({ success: false, reason: 'Invalid Time' });
    };

    if (!planInfo.title.length) {
      return res.send({ success: false, reason: 'Enter Plan Title' });
    }
    if (isValid) {
      const connection = pool.promise();
      try {
        const insertInfo = { ...planInfo, user_id: tester.id };
        const [deletePrev] = await connection.query(`DELETE FROM plans WHERE user_id = ? AND id = ?`, [tester.id, planInfo.id]);
        if (!deletePrev.affectedRows) {
          notificationService.removePrevNotification(tester.id, planInfo.id);
        }
        const [userInfo] = await connection.query(`SELECT user_id, name, email, notification_setting, key_salt, iv, subscription from users where user_id = ?`, [tester.id]);
        const startTime = planInfo * 1000 * 60;
        notificationService.planNotification(insertInfo, userInfo[0], startTime)
        const insert = await connection.query(`INSERT INTO plans SET ?`, insertInfo);
        res.send({ success: true, msg: 'Plan Saved!' })
      } catch (error) {
        res.send({ success: false, reason: 'An error occurred' });
        console.log('Mysql Err', error);
      } finally {
        pool.releaseConnection(connection);
      }
    }
  } catch (error) {
    console.error('An error occurred:', error);
    res.send({ success: false, reason: 'An error occurred' });
  }
});

Router.post("/plan/status-change", async (req, res) => {
  try {
    const planInfo = req.body;

    console.log(planInfo)
    const schema = {
      type: 'object',
      properties: {
        id: { type: 'string', minLength: 10, maxLength: 10 },
        completed: { type: 'integer', minimum: 0, maximum: 1 }
      },
      required: ['id', 'completed'],
      additionalProperties: false
    };

    const isValid = isValidJSON(planInfo, schema);
    if (isValid) {
      const connection = pool.promise();
      try {
        await connection.query(`UPDATE plans SET completed = ? WHERE id = ?`, [planInfo.completed, planInfo.id])
        res.send({ success: true, msg: 'Updated' })
      } catch (err) {
        console.log(err);
      } finally {
        connection.releaseConnection();
      };
    } else {
      res.send({ success: false, reason: "Invalid data" });
    }
  } catch (err) {
    console.log(err);
    res.send({ success: false, reason: "Err" });
  };
})

//redis study part

Router.post("/study/add-subject", async (req, res) => {
  try {
    const now = new Date()
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
      timeline: JSON.stringify([]),
      id: generateRandomId(10),
      user_id: tester.id
    };
    if (isValid) {
      const connection = pool.promise();
      try {
        const insertSubject = await connection.query(`INSERT INTO subjects SET ?`, subjectInfo);
        const updateUser = await connection.query(`
        UPDATE users
        SET subjects = CASE
          WHEN subjects = '' THEN ?
          ELSE CONCAT(subjects, ',', ?)
        END
        WHERE user_id = ?
      `, [
          subjectInfo.id,
          subjectInfo.id,
          tester.id
        ]);
        res.send({ success: true, msg: `Added Subject "${subjectInfo.name}"`, info: { subjectInfo: subjectInfo } })
      } catch (err) {
        console.log(err);
      } finally {
        pool.releaseConnection();
      }
      res.send({ success: true, msg: `Added Subject "${subjectInfo.name}"`, info: { subjectInfo: subjectInfo } })
    } else {
      res.send({ success: false, reason: "Invalid Value" });
    }
  } catch (error) {

  };

  /* const connection = pool.promise();
  const subject = {
    ...req.body,
    datum_point: Math.floor(new Date().getTime() / 1000),
    timeline: [],
    id: generateRandomId(10)
  };

  const selectQuery = "SELECT subjects FROM users WHERE user_id = ?";
  const selectParams = [req.session.user_id];
  const select = await connection.query(selectQuery, selectParams);
  const userInfo = select[0];
  const subjects = JSON.parse(userInfo.subjects || "[]");
  subjects.push(subject);
  const updatedJson = JSON.stringify(subjects);
  const updateQuery = "UPDATE users SET subjects = ? WHERE user_id = ?";
  const updateParams = [updatedJson, req.session.user_id];
  const update = await connection.query(updateQuery, updateParams);
  pool.releaseConnection(connection);


  res.send({success: true, id: subject.id}); */
})

Router.post("/study/start", async (req, res) => {
  const subjectId = req.body.subjectId;
  const userInfo = await redisClient.hGetAll(`user:${tester.id}`)

  Object.keys(userInfo).forEach(async (info) => {
    if (info.includes('subject:')) {
      const infoSubjectId = info.split(':')[1];
      if (infoSubjectId === subjectId) {
        const subjectInfo = JSON.parse(userInfo[info]);
        const now = Math.floor(new Date().getTime() / 1000);
        const start = now - subjectInfo.datum_point;
        const push = await redisClient.rPush(`user:${tester.id}:subject:${subjectId}`, `[${start},${start}]`);
        redisClient.hSet(`user:${tester.id}`, `ActiveSubject`, JSON.stringify(subjectInfo));
        const prevTimer = await redisClient.hGet(`user:${tester.id}`, 'timerInfo');
        console.log('prev', prevTimer);
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
          redisClient.hSet(`user:${tester.id}`, 'timerInfo', JSON.stringify(newTimer));
        } else {
          const newTimer = { datum: now, timeline: [[0, 0]], study: 1 };
          redisClient.hSet(`user:${tester.id}`, 'timerInfo', JSON.stringify(newTimer));
        };
        //redisClient.hSet(`user:${tester.id}`, 'timer', JSON.stringify(subjectInfo));
        const groups = userInfo.groups.split(',');
        console.log(groups)
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
          io.to(groups).emit('studying', tester.id, groups);
        }
        //io.to.emit("study")
      };
    };
  });
  res.send({ success: false, msg: 'Timer Started!' });
});

Router.post("/study/stop", async (req, res) => {
  const subjectId = req.body.subjectId;
  const groups = (await redisClient.hGet(`user:${tester.id}`, "groups")).split(',');
  const activeSubject = JSON.parse(await redisClient.hGet(`user:${tester.id}`, 'ActiveSubject'));
  if (activeSubject.id === subjectId) {
    const activity = JSON.parse(await redisClient.rPop(`user:${tester.id}:subject:${subjectId}`));
    const now = Math.floor(new Date().getTime() / 1000);
    const start = activity[0];
    const stop = now - activeSubject.datum_point;
    redisClient.rPush(`user:${tester.id}:subject:${subjectId}`, `[${start},${stop}]`);
    redisClient.hSet(`user:${tester.id}`, `ActiveSubject`, '0');
    console.log(groups)
    if (groups.length) {
      io.to(groups).emit('stopStudying', tester.id, groups);
    };
    const timerInfo = await redisClient.hGet(`user:${tester.id}`, 'timerInfo');
    if (timerInfo) {
      const newTimer = JSON.parse(timerInfo);
      const lastActivity = newTimer.timeline.pop();
      lastActivity[1] = now - newTimer.datum;
      newTimer.timeline.push(lastActivity);
      newTimer.study = 0;
      redisClient.hSet(`user:${tester.id}`, 'timerInfo', JSON.stringify(newTimer));
    };
  };
  res.send({ success: true, msg: 'Timer Stopped!' });
});

Router.post("/study/get-today", async (req, res) => {
  const userInfo = await redisClient.get(`user:${tester.id}`);
  if (!userInfo) {
    redisClient.hSet(`user:${tester.id}`);
  }
})

//get total live 
Router.post("/live-members", (req, res) => {
  const totalLiveMembers = Object.keys(io.socket.sockets).length;
  res.send({ success: true, totalLiveMembers: totalLiveMembers });
})

//chat

Router.post("/chat/bring-rooms", async (req, res) => {
  /* 
  let userGroups = await redisClient.hGet(`user:${tester.id}`, 'groups');
  if (userGroups) {
    try {
      userGroups = userGroups.split(',');
      const connection = pool.promise();
      const totalChats = [];

      const [groupInfo] = userGroups.length ? await connection.query(`SELECT group_id, name, leader, color FROM groups where group_id IN (?)`, [userGroups]) : [];
      //const [groupChatRooms] = await conneR
      console.log('groups', groupInfo)
      for (let i = 0; i < groupInfo.length; i++) {
        const groupId = groupInfo[i].group_id;
        let groupRooms = await redisClient.sMembers(groupId);
        console.log('groupRoom', groupRooms)
        if (!groupRooms.length) {
          [groupRooms] = await connection.query(`SELECT * FROM chatrooms WHERE group_id = ?`, [groupId]);
          const redisGroupRooms = groupRooms.map(room => JSON.stringify(room));
          //redisClient.sAdd(...redisGroupRooms);
          console.log('rooms', groupRooms, redisGroupRooms)
        }

        //const chat
        let chats = (await redisClient.lRange(`group:${groupId}:chat`, 0, -1));
        //bring mariadb stored value if no chat exist/too short
        if (chats.length < 30) {

        }
        totalChats.push({ ...groupInfo[i], room: groupRooms });
      };
      res.send({ success: true, chats: totalChats });
    } catch (err) {
      console.log(err)
    }
  }; */
  const groupInfo = await redisClient.hGet(`user:${tester.id}`, 'groups');
  console.log("gggg", groupInfo)
  try {
    if (!groupInfo) {
      const connection = pool.promise();
      const [[userInfo]] = await connection.query(`SELECT groups FROM users WHERE user_id = ?` , [tester.id]);
      const userGroups = userInfo.groups.split(',');
      const groupRooms = await Promise.all(userGroups.map(async (group) => {
        let chatRooms = await redisClient.sMembers(`group:${group}:rooms`);
        chatRooms = chatRooms.map(room => {
          room = JSON.parse(room);
          room.status = -1;
          return room;
        });
        return chatRooms;
      }));
      res.send({success: true, groupRooms: groupRooms});
    } else {
      const userGroups = groupInfo.split(',');
      res.send({success: true, groupRooms: ""});
    };
  } catch (err) {
    console.log(err);
  }
});

//account update

Router.post('/account/update/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.send({ success: false, reason: 'No image file found' });
    }
    const imageBuffer = req.file.buffer; // Get the image buffer from the request
    await sharp(imageBuffer)
      .toFormat('jpeg')
      .resize({ width: 800, height: 800 })
      .jpeg({ quality: 40 })
      .toFile(`../public/profile-images/${req.session.user_id}.jpeg`);
    res.send({ success: true });
  } catch (error) {
    res.send({ success: false, reason: 'Unsupported File Type' })
  }
});


module.exports = Router;