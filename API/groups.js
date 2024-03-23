const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const crypto = require("crypto");
const { isValidJSON, hashing, generateRandomId, autoSignin } = require("../tool");
const { timerCache, activeSubjectCache, groupCache, userCache } = require("../services/redisLoader");
const { validateArray, validateStrictString, validateInteger, validateLength, validateHEX, validatePassword, validateBoolean, validateString } = require("../validate");
const { DateTime } = require("luxon");
const { mainIo } = require("../socket");
const { responseCodes } = require("../Constant");

Router.post('/create-validate', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const { name, explanation, tags, max_members, visibility, password, color, goal_hr } = req.body;
      /* const schema = {
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
        },
        required: ['name', 'explanation', 'tags', 'max_members', 'visibility', 'password', 'color', 'goal_hr'],
        additionalProperties: false
      };

      const isValid = isValidJSON(group, schema); */
      /* if (!isValid) {
        return res.send({ success: false, reason: 'Wrong Information' });
      } */

      const isValidName = validateString(name, 'Name');
      console.log(name)
      if (!isValidName.isValid) {
        return res.send({ success: false, reason: isValidName.reason });
      };

      const isValidExplanation = validateLength(explanation, 'Description', 200, 1);
      if (!isValidExplanation.isValid) {
        return res.send({ success: false, reason: isValidExplanation.reason });
      };

      const isValidTags = validateArray(tags, 'tags', 10);
      if (!isValidTags.isValid) {
        return res.send({ success: false, reason: isValidTags.reason });
      };

      const isValidMembers = validateInteger(max_members, 'max members', 100, 1);
      if (!isValidMembers.isValid) {
        return res.send({ success: false, reason: isValidMembers.reason });
      };

      const isValidVisibility = validateInteger(visibility, 'visibility', 1, 0);
      if (!isValidVisibility.isValid) {
        return res.send({ success: false, reason: isValidVisibility.reason });
      };

      if (!visibility) {
        const isValidPassword = validatePassword(password, 20, 4, false);
        if (!isValidPassword.isValid) {
          return res.send({ success: false, reason: isValidPassword.reason });
        };
      };

      const isValidColor = validateHEX(color, 'Color');

      if (!isValidMembers.isValid) {
        return res.send({ success: false, reason: isValidColor.reason });
      };

      const isValidGodalHr = validateInteger(goal_hr, 'goal time', 10);
      if (!isValidGodalHr.isValid) {
        return res.send({ success: false, reason: isValidGodalHr.reason });
      };

      const hashed = hashing(password);
      const group_id = generateRandomId(8);
      const date = Math.floor(new Date().getTime() / 1000);
      const stringlifiedTags = JSON.stringify(tags);
      const group = {
        group_id,
        salt: hashed[0],
        password: hashed[1],
        date,
        name,
        explanation,
        leader: userId,
        members: userId,
        tags: stringlifiedTags,
        max_members,
        visibility,
        color,
        goal_hr
      };

      /* group.tags = JSON.stringify(group.tags);
      group.password = hashed[1];
      group.salt = hashed[0];
      group.date = Math.floor(new Date().getTime() / 1000);
      group.group_id = groupId;
      group.leader = userId;
      group.members = userId; */

      //update cached values
      const userInfo = await userCache(userId);
      if (!userInfo) {
        return res.send(responseCodes['no-user']);
      };

      const { groups } = userInfo;

      groups.push(group_id);
      redisClient.hSet(`user:${userId}`, 'groups', groups.join(','));

      try {
        const connection = pool.promise();

        const updateGroup = await connection.query('INSERT INTO \`groups\` SET ?', group);
        const updateUser = await connection.query(`
        UPDATE users
        SET \`groups\` = CASE
          WHEN \`groups\` = '' THEN ?
          ELSE CONCAT(\`groups\`, ',', ?)
        END
        WHERE user_id = ?
      `, [
          group_id,
          group_id,
          userId,
        ]);

        const roomInfo = {
          id: group_id,
        }

        const updateRoom = connection.query(`INSERT INTO chatrooms SET ?`, roomInfo);

        res.send({ success: true, data: { id: group_id }, msg: `Group ${group.name} created!` })
      } catch (error) {
        console.log(error)
        res.send({ success: false, reason: 'Error' })
      }
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'Error' })
    };

  }), (() => {
    req.session.retrivedProgress = req.body;
    res.send({ success: false, reason: 'not autenticated' });
  }))
})

Router.post('/join/:id', async (req, res) => {
  /* const sessionDataHeader = req.headers['x-session-data'];
  if (sessionDataHeader) {
    const sessionData = JSON.parse(sessionDataHeader);
    if (sessionData.user_id && sessionData.loggedin) {
      req.session.user_id = sessionData.user_id;
      req.session.loggedin = sessionData.loggedin;
    }
  }; */

  autoSignin(req, res, (async (userId) => {
    const groupId = req.params.id;

    const isValidGroupId = validateStrictString(groupId, 'group id', 10, 8);
    if (!isValidGroupId.isValid) {
      return res.send({ success: false, reason: isValidGroupId.reason });
    };

    const connection = pool.promise();
    try {
      const [[groupInfo]] = await connection.query(`SELECT password, salt, visibility, max_members, members, name from \`groups\` where group_id = ?`, [groupId]);
      if (!groupInfo) return res.send({ success: false, reason: `Group does not exist` });

      if (groupInfo.members.includes(userId)) return res.send({ success: false, reason: 'Already Joined' });

      if (groupInfo.visibility) {
        await connection.query(
          `UPDATE users SET \`groups\` = CASE
            WHEN \`groups\` = '' THEN ?
            WHEN \`groups\` LIKE ? THEN \`groups\`
            ELSE CONCAT(\`groups\`, ',', ?)
            END
            WHERE user_id = ?`,
          [groupId, `%${groupId}%`, groupId, userId]
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
        const { password } = req.body;
        const isValidPassword = validateLength(password, 100);

        if (!isValidPassword.isValid) {
          return res.send({ success: false, reason: isValidPassword.reason });
        };

        const hashedPassword = crypto.pbkdf2Sync(password, groupInfo.salt, 99097, 32, 'sha512').toString('hex');
        if (hashedPassword == groupInfo.password) {
          await connection.query(
            `UPDATE users SET \`groups\` = CASE
              WHEN \`groups\` = '' THEN ?
              WHEN \`groups\` LIKE ? THEN \`groups\`
              ELSE CONCAT(\`groups\`, ',', ?)
              END
              WHERE user_id = ?`,
            [groupId, `%${groupId}%`, groupId, userId]
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

      mainIo.emit(`newMember:${groupId}`, userId);
      res.send({ success: true, msg: `Joined group "${groupInfo.name}"` });
      const groups = await groupCache(userId);
      groups.push(groupId);
      redisClient.hSet(`user:${userId}`, 'groups', groups.join(','));
      //send user's study information to group members
      const activeSubject = await activeSubjectCache(userId);
      const userInfo = await userCache(userId);
      let timezoneOffset = 0;
      if (userInfo) {
        const today = DateTime.now().setZone(userInfo.timezone);
        timezoneOffset = Math.floor(today.offset / 60).toString();
      }
      let totalTime = await redisClient.zScore(`user:${userId}:dayTotal`, timezoneOffset);
      totalTime = totalTime === null ? 0 : totalTime;
      mainIo.to(`${groupId}`).emit(`newMemberInfo`, { ...userInfo, totalTime, activeSubject });

      //update cached value only if it exists
      const isCached = await redisClient.exists(`room:${groupId}`);
      if (isCached) {
        redisClient.sAdd(`room:${groupId}`, userId);
      }

      mainIo.to(userId).emit("joinChatRoom", groupId);

    } catch (err) {
      // Handle any errors that may occur during the execution of queries
      console.error('Error performing database queries:', err);
    };
  }));
})


Router.post('/bring-groups', async (req, res) => {
  try {
    const connection = pool.promise();
    const [groups] = await connection.query(
      "SELECT group_id, name, leader, visibility, explanation, date, members, max_members, tags, color, goal_hr, average_hr, likes, font FROM \`groups\`"
    );
    /*const allMembersIds = [];
    groups.map((group) => {
      const members = group.members.split(',');
      members.map((member) => {
        if (!allMembersIds.includes(member)) {
          allMembersIds.push(member);
        };
      });
    });*/
    //let membersInfo = [];
    res.send({ success: true, groups: groups });
  } catch (err) {
    console.error('Error performing database queries:', err);
    res.status(500).send({ success: false, reason: 'An error occurred' });
  };
});

Router.get('/mine', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const user = await userCache(userId);
      if (!user) return res.send({ success: false, reason: 'Invalid User' });

      const connection = pool.promise();
      const [groups] = await connection.query(
        "SELECT group_id, name, leader, visibility, explanation, date, members, max_members, tags, color, goal_hr, average_hr, likes, font FROM \`groups\` WHERE group_id IN(?)", [user.groups]
      );

      return res.send({ success: true, groups })
    } catch (err) {
      console.log(err);
    }
  }));
});

Router.post('/like/:id', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    const groupId = req.params.id;
    const { liked } = req.body;

    const isValidGroupId = validateStrictString(groupId, 'group id');

    if (!isValidGroupId.isValid) {
      return res.send({ success: false, reason: isValidGroupId.reason });
    };

    const isValidLiked = validateBoolean(liked, 'like', true);

    if (!isValidLiked.isValid) {
      return res.send({ success: false, reason: isValidLiked.reason });
    };

    try {
      const connection = pool.promise();
      /* const [update] = await connection.query(
        `UPDATE \`groups\` 
        SET likes = CASE 
          WHEN likes = '' THEN ?
          WHEN likes LIKE ? OR likes LIKE ? OR likes LIKE ? OR likes = ? THEN
          TRIM(BOTH ',' FROM REPLACE(CONCAT(',', likes, ','), ',${userId},', ','))
          ELSE CONCAT(likes, ',', ?) 
          END WHERE group_id = ?`,
        [userId, `%,${userId},%`, `${userId},%`, `%,${userId}`, userId, userId, groupId]
      ); */
      if (liked) {
        /* const [[{ verified }]] = await connection.query(`SELECT verified FROM users WHERE user_id = ?`, [userId]);
        if (!verified) {
          //return res.send({ success: false, reason: "Please verify your email" });
        } */
        const [{ changedRows }] = await connection.query(
          `UPDATE \`groups\` 
          SET likes = CASE 
            WHEN likes = '' THEN ?
            WHEN NOT likes LIKE ? THEN
            CONCAT(likes, ',', ?)
            ELSE likes
            END WHERE group_id = ?`,
          [userId, `%${userId}%`, userId, groupId]
        );
        if (changedRows) {
          mainIo.emit(`liked:${groupId}`, userId);
        };
      } else {
        const [update] = await connection.query(
          `UPDATE \`groups\` 
          SET likes = 
            TRIM(BOTH ',' FROM REPLACE(CONCAT(',', likes, ','), ',${userId},', ','))
            WHERE group_id = ?`,
          [groupId]
        );
        mainIo.emit(`unliked:${groupId}`, userId);
      };
      res.send({ success: true });
    } catch (err) {
      console.error('Error performing database queries:', err);
      res.status(500).send({ success: false, reason: 'An error occurred' });
    };
  }));
});

Router.get('/members', async (req, res) => {
  autoSignin(req, res, (async (userId, timezone) => {
    const { groupId } = req.query;

    const isValidGroupId = validateStrictString(groupId, 'group id');

    if (!isValidGroupId.isValid) {
      return res.send({ success: false, reason: isValidGroupId.reason });
    };

    const connection = pool.promise();
    try {
      const today = DateTime.now().setZone(timezone);
      const timezoneOffset = Math.floor(today.offset / 60).toString();
      const [[groupInfo]] = await connection.query(`SELECT visibility, members FROM groups WHERE group_id = ?`, [groupId]);
      if (!groupInfo) return res.send({ success: false, reason: 'No such group' });
      const { visibility, members } = groupInfo;
      const membersArr = members === "" ? [] : members.split(",");
      if (visibility || membersArr.includes(userId) && membersArr.length) {
        const [membersData] = await connection.query(`SELECT name, user_id FROM users WHERE user_id IN (?)`, [membersArr]);
        const memberStudyDataPromises = membersData.map(async (member) => {
          const { user_id } = member;
          let totalTime = await redisClient.zScore(`user:${user_id}:dayTotal`, timezoneOffset);
          totalTime = totalTime === null ? 0 : totalTime;
          const activeSubject = await activeSubjectCache(user_id);
          return { ...member, totalTime, activeSubject };
        });
        const memberStudyData = await Promise.all(memberStudyDataPromises);
        res.send({ success: true, membersData: memberStudyData });
      }
    } catch (err) {
      console.error('Error performing database queries:', err);
      res.status(500).send({ success: false, reason: 'An error occurred' });
    };
  }));
});

Router.post('/modify', async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const { group_id, name, explanation, tags, max_members, visibility, password, color, goal_hr } = req.body;

      const isValidGroupId = validateStrictString(group_id, 'group id');
      if (!isValidGroupId.isValid) {
        return res.send({ success: false, reason: isValidGroupId.reason });
      };

      const isValidName = validateStrictString(name, 'Name');
      if (!isValidName.isValid) {
        return res.send({ success: false, reason: isValidName.reason });
      };

      const isValidExplanation = validateLength(explanation, 'Description', 200, 1);
      if (!isValidExplanation.isValid) {
        return res.send({ success: false, reason: isValidExplanation.reason });
      };

      const isValidTags = validateArray(tags, 'tags', 10);
      if (!isValidTags.isValid) {
        return res.send({ success: false, reason: isValidTags.reason });
      };

      const isValidMembers = validateInteger(max_members, 'max members', 100, 0);
      if (!isValidMembers.isValid) {
        return res.send({ success: false, reason: isValidMembers.reason });
      };

      const isValidVisibility = validateInteger(visibility, 'visibility', 1, 0);
      if (!isValidVisibility.isValid) {
        return res.send({ success: false, reason: isValidVisibility.reason });
      };

      const isValidColor = validateHEX(color, 'Color');
      if (!isValidMembers.isValid) {
        return res.send({ success: false, reason: isValidColor.reason });
      };

      const isValidGodalHr = validateInteger(goal_hr, 'goal time', 10);
      if (!isValidGodalHr.isValid) {
        return res.send({ success: false, reason: isValidGodalHr.reason });
      };
      /* const schema = {
        type: 'object',
        properties: {
          group_id: { type: 'string', maxLength: 11 },
          name: { type: 'string', maxLength: 100 },
          explanation: { type: 'string', maxLength: 100 },
          tags: { type: 'array', maxItems: 10 },
          max_members: { type: 'integer', minimum: 0, maximum: 100 },
          visibility: { type: 'integer', minimum: 0, maximum: 1 },
          password: { type: 'string', maxLength: 30 },
          color: { type: 'string', maxLength: 8 },
          goal_hr: { type: 'integer', maximum: 24 },
        },
        required: ['group_id', 'name', 'explanation', 'tags', 'max_members', 'visibility', 'password', 'color', 'goal_hr'],
        additionalProperties: false
      };

      const isValid = isValidJSON(group, schema);
      if (!isValid) {
        return res.send({ success: false, reason: 'Wrong Information' });
      } */

      const connection = pool.promise();

      const groupInfo = await connection.query(`SELECT leader FROM \`groups\` WHERE group_id = ? AND leader = ?`, [group_id, userId])
      if (!groupInfo) return res.send({ success: false, reason: 'You are not the leader of this group' });

      const date = Math.floor(new Date().getTime() / 1000);
      const stringlifiedTags = JSON.stringify(tags);
      const group = {
        date,
        name,
        explanation,
        leader: userId,
        members: userId,
        tags: stringlifiedTags,
        max_members,
        visibility,
        color,
        goal_hr
      };


      if (!visibility && password !== "") {
        const isValidPassword = validatePassword(password);
        if (!isValidPassword.isValid) {
          return res.send({ success: false, reason: isValidPassword.reason });
        };
        const hashed = hashing(password);
        group.salt = hashed[0];
        group.password = hashed[1];
      };

      try {
        const connection = pool.promise();
        const updateGroup = await connection.query('UPDATE \`groups\` set ? WHERE group_id = ? ', [group, group_id]);
        res.send({ success: true, data: { id: group_id }, msg: `Group ${group.name} updated!` })
      } catch (error) {
        console.log(error)
        res.send({ success: false, reason: 'Error' })
      }
    } catch (error) {
      console.log(error)
      res.send({ success: false, reason: 'Error' })
    };
  }))
})

module.exports = Router;