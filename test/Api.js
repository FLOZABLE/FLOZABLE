const express = require("express");
const Router = express.Router();
const pool = require('../model/pool');
const notificationService = require('../services/notification');
const account = require('../Router/account');
const Ajv = require('ajv');
const ajv = new Ajv();
const NodeCache = require('node-cache');
const cache = new NodeCache();
const { DateTime } = require('luxon');
const crypto = require("crypto");


const tester = { name: 't1', id: 'EoFObpf612bdJKt' };
function generateRandomId(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

Router.post('/information/bring-subjects', async (req, res) => {
  const connection = await (await pool).getConnection();
  const [userInfo] = await connection.query("SELECT subjects FROM users WHERE name = ?", [tester.name]);
  connection.release();
  res.send({ success: true, subjects: userInfo.subjects });
});

Router.post('/information/accountinfo', async (req, res) => {
  const connection = await (await pool).getConnection();
  const [userInfo] = await connection.query("SELECT user_id, name, email, language, groups FROM users WHERE user_id = ?", [tester.id]);
  console.log(userInfo, tester.id)
  connection.release();
  res.send({ success: true, userInfo: userInfo });
});

Router.post("/ranking", async (req, res) => {
  const connection = await (await pool).getConnection();
  try {
    const users = await connection.query(`SELECT datum_point, daily, weekly, monthly, name, user_id from users`);

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
    connection.release();
  };
});

//groups

Router.post('/groups/create-validate', async (req, res) => {
  const connection = await (await pool).getConnection();
  try {
    let group = req.body;
    console.log(group)
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string', maxLength: 100 },
        explanation: { type: 'string', maxLength: 100 },
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

    console.log(JSON.stringify(group))
    console.log(isValid, group.tags)
    let hashed = hashing(req.body['password']);

    group.tags = JSON.stringify(group.tags);
    group.password = hashed[1];
    group.salt = hashed[0];
    group.date = Math.floor(new Date().getTime() / 1000);
    group.group_id = generateGroupId();
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

      res.send({ success: true, data: { id: group.group_id } })
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'Error' })
    }
  } catch (error) {
    console.log(error)
    res.send({ success: false, reason: 'Error' })
  } finally {
    connection.release();
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
  const connection = await (await pool).getConnection();
  try {
    let [groupInfo] = await connection.query(`SELECT password, salt, visibility, max_members, name from \`groups\` where group_id = ?`, [groupId]);

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
      console.log(password, groupInfo.password)
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
    connection.release();
  }
})

// ... (other imports and setup code)

Router.post('/groups/leave/:id', async (req, res) => {
  if (req.session.loggedin == true) {
    const groupId = req.params.id;
    const connection = await (await pool).getConnection();
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
      connection.release();
    }
  } else {
    res.send({ success: false });
  }
});


Router.post('/groups/bring-groups', async (req, res) => {
  const connection = await (await pool).getConnection();
  try {
    const userId = tester.id;
    const groups = await connection.query(
      "SELECT group_id, name, leader, visibility, explanation, date, members, max_members, tags, color, goal_hr, average_hr, likes, font FROM \`groups\`"
    );
    res.send({ success: true, groups: groups });
  } catch (err) {
    // Handle any errors that may occur during the execution of queries
    console.error('Error performing database queries:', err);
    res.status(500).send({ success: false, reason: 'An error occurred' });
  } finally {
    connection.release();
  }
});

Router.post('/groups/like/:id', async (req, res) => {
  if (!req.session.loggedin) {
    return res.send({ success: false, reason: 'not authenticated' })
  }

  const groupId = req.params.id;
  const connection = await (await pool).getConnection();
  try {
    const userId = tester.id;
    const update = await connection.query(
      `UPDATE \`groups\` 
      SET likes = CASE 
        WHEN likes = '' THEN ?
        WHEN likes LIKE ? OR likes LIKE ? OR likes LIKE ? OR likes = ? THEN
        TRIM(BOTH ',' FROM REPLACE(CONCAT(',', likes, ','), ',${userId},', ','))
        ELSE CONCAT(likes, ',', ?) 
        END WHERE group_id = ?`,
      [userId, `%,${userId},%`, `${userId},%`, `%,${userId}`, userId, userId, groupId]
    );
    console.log(update)
    res.send({ success: true });
  } catch (err) {
    // Handle any errors that may occur during the execution of queries
    console.error('Error performing database queries:', err);
    res.status(500).send({ success: false, reason: 'An error occurred' });
  } finally {
    connection.release();
  }
});

function isValidJSON(data, schema) {
  const validate = ajv.compile(schema);
  const isValid = validate(data);

  if (!isValid) {
    return false;
  } else {
    return true;
  }
}

module.exports = Router;