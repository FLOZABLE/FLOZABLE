const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');
const crypto = require("crypto");
const account = require('./account');
const Ajv = require('ajv');
const ajv = new Ajv();

function isValidJSON(data, schema) {
  const validate = ajv.compile(schema);
  const isValid = validate(data);

  if (!isValid) {
    return false;
  } else {
    return true;
  }
}

function hashing(password) {
  let salt = crypto.randomBytes(32).toString('hex')
  return [salt, crypto.pbkdf2Sync(password, salt, 99097, 32, 'sha512').toString('hex')]
}

function generateGroupId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 8;
  let groupId = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    groupId += characters.charAt(randomIndex);
  }

  return groupId;
}


Router.get("/", async (req, res) => {
  account.autoSignin(req, res, (() => {
    res.render("group/groups");
  }), (() => {
    res.redirect('/account/signin');
  }))
})

Router.get('/create', (req, res) => {
  account.autoSignin(req, res, (() => {
    res.render("group/create");
  }), (() => {
    res.redirect('/account/signin');
  }))
})

Router.get('/:id', async (req, res) => {
  const groupId = req.params.id;
})

Router.post('/create/retriveProgress', (req, res) => {
  res.send({ retrivedProgress: req.session.retrivedProgress });
})

Router.post('/create-validate', async (req, res) => {
  account.autoSignin(req, res, (async () => {
    const connection = pool.promise();
    try {
      let group = req.body;
      console.log(group)
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

      console.log(JSON.stringify(group))
      console.log(isValid, group.tags)
      let hashed = hashing(req.body['password']);

      group.tags = JSON.stringify(group.tags);
      group.password = hashed[1];
      group.salt = hashed[0];
      group.date = Math.floor(new Date().getTime() / 1000);
      group.group_id = generateGroupId();
      group.leader = req.session.user_id;
      group.members = req.session.user_id;
  
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
          req.session.user_id,
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
  }

  if (!req.session.loggedin) {
    return res.send({success: false, reason: 'not authenticated'});
  }

  const groupId = req.params.id;
  const userId = req.session.user_id;
  const connection = pool.promise();
  try {
    let [groupInfo] = await connection.query(`SELECT password, salt, visibility, max_members from \`groups\` where group_id = ?`, [groupId]);

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
        return res.send({success: false, reason: 'Wrong Password'});
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
        return res.send({success: false, reason: 'Wrong Password'});
      }
    }

    const io = req.app.get('socketio');
    io.emit('addUser', groupId, req.session.user_id);
    res.send({ success: true });
  } catch (err) {
    // Handle any errors that may occur during the execution of queries
    console.error('Error performing database queries:', err);
    res.send({ success: false, reason: 'An error occurred' });
  } finally {
    pool.releaseConnection(connection);
  }
})

// ... (other imports and setup code)

Router.post('/leave/:id', async (req, res) => {
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
    `, [groupId, req.session.user_id]);

      const updateGroups = await connection.query(`
    UPDATE \`groups\`
    SET members = 
    CASE
      WHEN members = ? THEN ''
      ELSE TRIM(BOTH ',' FROM REPLACE(CONCAT(',', members, ','), ',${req.session.user_id},', ','))
    END WHERE group_id = ?;
  `, [req.session.user_id, groupId]);
      res.send({ success: true });
      const io = req.app.get('socketio');
      io.emit('removeUser', groupId, req.session.user_id);
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


Router.post('/bring-groups', async (req, res) => {
  const connection = pool.promise();
  try {
    const userId = req.session.user_id;
    const groupList = await connection.query(
      "SELECT group_id, name, leader, visibility, explanation, date, members, max_members, tags, color, goal_hr, average_hr, likes, font FROM \`groups\`"
    );
    let groupWithUser = [];
    let likedList = [];
    groupList.forEach((group, index) => {
      group.members = group.members.split(',').filter(member => member !== '');
      if (group.members && group.members.includes(userId)) {
        groupWithUser.push(group.group_id);
      }

      if (group.likes && group.likes.includes(userId)) {
        likedList.push(group.group_id);
      }
    });
    res.send({success: true, groupList: groupList,  groupWithUser : groupWithUser, userId: userId, likedList: likedList});
  } catch (err) {
    // Handle any errors that may occur during the execution of queries
    console.error('Error performing database queries:', err);
    res.status(500).send({ success: false, reason: 'An error occurred' });
  } finally {
    pool.releaseConnection(connection);
  }
});

Router.post('/like/:id', async (req, res) => {
  if (!req.session.loggedin) {
    return res.send({success: false, reason: 'not authenticated'})
  }

  const groupId = req.params.id;
  const connection = pool.promise();
  try {
    const userId = req.session.user_id;
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
    res.send({success: true});
    /* let groupInfo = await connection.query(
      "SELECT likes from \`groups\` where group_id = ?",
      [groupId]
    );
    groupInfo = groupInfo[0];
    if (!groupInfo.likes || !groupInfo.likes.includes(req.session.user_id)) {
      const query1 = await connection.query(
        "UPDATE \`groups\` SET likes = CASE WHEN likes IS NULL THEN ? WHEN likes = '' THEN ? ELSE CONCAT(likes, ',', ?) END WHERE group_id = ?",
        [req.session.user_id, req.session.user_id, req.session.user_id, groupId]
      );
      if (query1.affectedRows >= 1) {
        res.send({ state: 'liked' });
      }
    } else if (groupInfo.likes && groupInfo.likes.includes(req.session.user_id)) {
      const query1 = await connection.query(
        "UPDATE \`groups\` SET likes = CONCAT_WS(',', REPLACE(likes, ?, '')) WHERE group_id = ?",
        [`${req.session.user_id},`, groupId]
      );
      const query2 = await connection.query(
        "UPDATE \`groups\` SET likes = CONCAT_WS(',', REPLACE(likes, ?, '')) WHERE group_id = ?",
        [req.session.user_id, groupId]
      );
      if (query1.affectedRows + query2.affectedRows >= 1) {
        res.send({ state: 'unliked' });
      }
    } else {
      res.send({ state: 'fail' });
    } */

  } catch (err) {
    // Handle any errors that may occur during the execution of queries
    console.error('Error performing database queries:', err);
    res.status(500).send({ success: false, reason: 'An error occurred' });
  } finally {
    pool.releaseConnection(connection);
  }
});

module.exports = Router;