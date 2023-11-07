const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const crypto = require("crypto");
const {isValidJSON, hashing, generateRandomId, autoSignin} = require("../tool");
const { timerCache, activeSubjectCache } = require("../services/redisLoader");

Router.post('/create-validate', async (req, res) => {
  autoSignin(req, res, (async () => {
    const connection = pool.promise();
    const userId = req.session.user_id;
    try {
      let group = req.body;
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 100 },
          explanation: { type: 'string', maxLength: 100},
          tags: { type: 'array', maxItems: 10},
          max_members: { type: 'integer', minimum: 0, maximum: 100},
          visibility: { type: 'integer', minimum: 0, maximum: 1},
          password: { type: 'string', maxLength: 30},
          color: { type: 'string', maxLength: 8},
          goal_hr: { type: 'integer', maximum: 24},
          font: {type: 'integer', maximum: 30},
        },
        required: ['name', 'explanation', 'tags', 'max_members', 'visibility', 'password', 'color', 'goal_hr', 'font'],
        additionalProperties: false
      };

      const isValid = isValidJSON(group, schema);
      if (!isValid) {
        return res.send({success: false, reason: 'Wrong Information'});
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
      group.group_id = generateRandomId(8);
      group.leader = userId;
      group.members = userId;
  
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
          userId,
        ]);
  
        res.send({success: true, data: {id: group.group_id}})
      } catch(error) {
        console.log(error)
        res.send({ success: false, reason: 'Error' })
      }
    } catch(error) {
      console.log(error)
      res.send({success: false, reason: 'Error'})
    } finally {
      pool.releaseConnection(connection);
    }


  }), (() => {
    req.session.retrivedProgress = req.body;
    res.send({ success: false, reason: 'not autenticated' });
  }))
})

Router.post('/join/:id', async (req, res) => {
  const sessionDataHeader = req.headers['x-session-data'];
  if (sessionDataHeader) {
    const sessionData = JSON.parse(sessionDataHeader);
    if (sessionData.user_id && sessionData.loggedin) {
      req.session.user_id = sessionData.user_id;
      req.session.loggedin = sessionData.loggedin;
    }
  };

  autoSignin(req, res, (async() => {
    const groupId = req.params.id;
    const userId = req.session.user_id;
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
      io.emit('addUser', groupId, userId);
      res.send({ success: true, msg: `Joined group "${groupInfo.name}"` });
    } catch (err) {
      // Handle any errors that may occur during the execution of queries
      console.error('Error performing database queries:', err);
      res.send({ success: false, reason: 'An error occurred' });
    } finally {
      pool.releaseConnection(connection);
    }
  }));
})


Router.post('/bring-groups', async (req, res) => {
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
      await Promise.all(membersInfo.map(async (member) => {
        let memberTimer = await redisClient.hGet(`user:${member.user_id}`, 'timerInfo');
        const timerInfo = await timerCache(member.user_id);
        const activeSubject = await activeSubjectCache(member.user_id);
        const timer = await redisClient.lRange(`user:${member.user_id}:timer`, 0, -1);
        /* if (!memberTimer) {
          memberTimer = `{"datum":${now},"timeline":[[0,0]],"study":0}`
        } */
        memberTimer = `{"datum":${now},"timeline":[[0,0]],"study":0}`
        member.study = memberTimer;
        member.timer = timer;
        member.timerInfo = timerInfo;
        member.activeSubject = activeSubject;
      }));

    };
    res.send({ success: true, groups: groups, membersInfo: membersInfo });
  } catch (err) {
    console.error('Error performing database queries:', err);
    res.status(500).send({ success: false, reason: 'An error occurred' });
  } finally {
    pool.releaseConnection(connection);
  }
});

Router.post('/like/:id', async (req, res) => {
  autoSignin(req, res, (async() => {
    const groupId = req.params.id;
    const connection = pool.promise();
    const userId = req.session.user_id;
    try {
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
      console.error('Error performing database queries:', err);
      res.status(500).send({ success: false, reason: 'An error occurred' });
    } finally {
      pool.releaseConnection(connection);
    }
  }));
});

module.exports = Router;