const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const crypto = require("crypto");
const { hashing, generateRandomId } = require("../utils/tool");
const {
  activeSubjectCache,
  userCache,
  userGroupsCache,
  cacheUserGroups,
  cacheChatroomMembers,
} = require("../services/redisLoader");
const {
  validateArray,
  validateStrictString,
  validateInteger,
  validateLength,
  validateHEX,
  validatePassword,
  validateBoolean,
  validateString,
} = require("../utils/validate");
const { DateTime } = require("luxon");
const { mainIo } = require("../sockets/io");
const { autoSignin } = require("./auth");
const RESPONSE_MESSAGES = require("../utils/responses");

Router.get("/", async (req, res) => {
  try {
    const connection = pool.promise();
    const [groups] = await connection.query(
      `
    SELECT 
      g.group_id, 
      g.name, 
      g.leader, 
      g.visibility, 
      g.description, 
      g.created_at, 
      g.max_members, 
      g.tags, 
      g.color, 
      g.goal_hr, 
    GROUP_CONCAT(DISTINCT m.user_id) AS members, 
    GROUP_CONCAT(DISTINCT l.user_id) AS likes
    FROM \`groups\` g
    LEFT JOIN group_members m ON g.group_id = m.group_id
    LEFT JOIN group_likes l ON g.group_id = l.group_id
    GROUP BY g.group_id
    `
    );

    const formattedGroups = groups.map((group) => ({
      ...group,
      members: group.members ? group.members.split(",") : [],
      likes: group.likes ? group.likes.split(",") : [],
      tags: group.tags ? JSON.parse(group.tags) : [],
      visibility: !!group.visibility,
    }));

    autoSignin(
      req,
      res,
      async (userId) => {
        try {
          const myGroups = await userGroupsCache(connection, userId);
          const myGroupsInfo = formattedGroups.filter((group) =>
            myGroups.includes(group.group_id)
          );

          return res.status(200).send({
            success: true,
            status: 200,
            data: { groups: formattedGroups, my_groups: myGroupsInfo },
          });
        } catch (err) {
          console.log(err);
          const response = RESPONSE_MESSAGES.error();
          return res.status(response.status).send(response);
        }
      },
      async () => {
        try {
          res.status(200).send({
            success: true,
            status: 200,
            data: { groups: formattedGroups, my_groups: [] },
          });
        } catch (err) {
          console.log(err);
          const response = RESPONSE_MESSAGES.error();
          return res.status(response.status).send(response);
        }
      }
    );
  } catch (err) {
    console.log(err);
    const response = RESPONSE_MESSAGES.error();
    return res.status(response.status).send(response);
  }
});

Router.put("/group", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const {
        name,
        description,
        tags,
        max_members,
        visibility,
        password,
        color,
        goal_hr,
      } = req.body;

      const isValidName = validateString(name, "Name");
      if (!isValidName.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidName.reason,
          error: { reason: isValidName.reason },
        });
      }

      const isValidExplanation = validateLength(
        description,
        "Description",
        200,
        1
      );
      if (!isValidExplanation.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidExplanation.reason,
          error: { reason: isValidExplanation.reason },
        });
      }

      const isValidTags = validateArray(tags, "tags", 10);
      if (!isValidTags.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidTags.reason,
          error: { reason: isValidTags.reason },
        });
      }

      const isValidMembers = validateInteger(
        max_members,
        "max members",
        100,
        1
      );
      if (!isValidMembers.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidMembers.reason,
          error: { reason: isValidMembers.reason },
        });
      }

      const isValidVisibility = validateInteger(visibility, "visibility", 1, 0);
      if (!isValidVisibility.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidVisibility.reason,
          error: { reason: isValidVisibility.reason },
        });
      }

      if (!visibility) {
        const isValidPassword = validatePassword(password, 20, 4, false);
        if (!isValidPassword.isValid) {
          return res.status(400).send({
            success: false,
            status: 400,
            message: isValidPassword.reason,
            error: { reason: isValidPassword.reason },
          });
        }
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

      const isValidGodalHr = validateInteger(goal_hr, "goal time", 10);
      if (!isValidGodalHr.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidGodalHr.reason,
          error: { reason: isValidGodalHr.reason },
        });
      }

      const hashed = hashing(password);
      const group_id = generateRandomId(10);
      const created_at = Math.floor(new Date().getTime() / 1000);
      const stringlifiedTags = JSON.stringify(tags);
      const group = {
        group_id,
        salt: hashed[0],
        password: hashed[1],
        created_at,
        name,
        description,
        leader: userId,
        tags: stringlifiedTags,
        max_members,
        visibility,
        color,
        goal_hr,
      };

      const newGroupMember = {
        group_id,
        user_id: userId,
        joined_at: created_at,
      };

      const connection = pool.promise();

      await connection.query("INSERT INTO `groups` SET ?", group);
      await connection.query(
        `
          INSERT INTO group_members SET ?
          `,
        [newGroupMember]
      );

      const roomInfo = {
        chatroom_id: group_id,
      };

      connection.query(`INSERT INTO chatrooms SET ?`, roomInfo);

      //update cached values
      const groups = await userGroupsCache(connection, userId);
      groups.push(group_id);
      cacheUserGroups(userId, groups);

      const groupInfo = {
        ...group,
        members: [userId],
        likes: [],
        tags,
      };

      delete groupInfo.password;
      delete groupInfo.salt;

      res.status(200).send({
        success: true,
        status: 200,
        message: `Group ${group.name} created!`,
        action: { code: 1, group_id },
        data: { group: groupInfo },
      });

      const chatroom = {
        chatroom_id: group_id,
        name: groupInfo.name,
        type: 0,
        members: groupInfo.members,
        lastMsg: null,
        lastRead: null,
        unreads: 0,
      };

      mainIo.to(userId).emit("new-chatroom", { chatroom });
      mainIo.in(userId).socketsJoin(`chatroom:${group.group_id}`);
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.delete("/group", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { group_id: groupId } = req.body;

      const isValidGroupId = validateStrictString(groupId, "group id");
      if (!isValidGroupId.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidGroupId.reason,
          error: { reason: isValidGroupId.reason },
        });
      }

      const connection = pool.promise();

      const [[groupInfo]] = await connection.query(
        `SELECT name FROM groups WHERE leader = ? AND group_id = ?`,
        [userId, groupId]
      );

      if (!groupInfo) {
        const response = RESPONSE_MESSAGES.noGroup();
        return res.status(response.status).send(response);
      }

      await connection.query(`DELETE FROM group_members WHERE group_id = ?`, [
        groupId,
      ]);

      await connection.query(`DELETE FROM groups WHERE group_id = ?`, [
        groupId,
      ]);
      redisClient.srem(`user:${userId}:groups`, groupId);

      res.status(200).send({
        success: true,
        status: 200,
        message: `Deleted ${groupInfo.name}`,
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

/**
 * modify group
 */
Router.patch("/group", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const {
        group_id,
        name,
        description,
        tags,
        max_members,
        visibility,
        password,
        color,
        goal_hr,
      } = req.body;

      const isValidGroupId = validateStrictString(group_id, "group id");
      if (!isValidGroupId.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidGroupId.reason,
          error: { reason: isValidGroupId.reason },
        });
      }

      const isValidName = validateString(name, "Name");
      if (!isValidName.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidName.reason,
          error: { reason: isValidName.reason },
        });
      }

      const isValidExplanation = validateLength(
        description,
        "Description",
        200,
        1
      );
      if (!isValidExplanation.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidExplanation.reason,
          error: { reason: isValidExplanation.reason },
        });
      }

      const isValidTags = validateArray(tags, "tags", 10);
      if (!isValidTags.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidTags.reason,
          error: { reason: isValidTags.reason },
        });
      }

      const isValidMembers = validateInteger(
        max_members,
        "max members",
        100,
        0
      );
      if (!isValidMembers.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidMembers.reason,
          error: { reason: isValidMembers.reason },
        });
      }

      const isValidVisibility = validateInteger(visibility, "visibility", 1, 0);
      if (!isValidVisibility.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidVisibility.reason,
          error: { reason: isValidVisibility.reason },
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

      const isValidGodalHr = validateInteger(goal_hr, "goal time", 10);
      if (!isValidGodalHr.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidGodalHr.reason,
          error: { reason: isValidGodalHr.reason },
        });
      }

      const connection = pool.promise();

      const [[groupInfo]] = await connection.query(
        `SELECT leader FROM \`groups\` WHERE group_id = ?`,
        [group_id]
      );
      if (!groupInfo) {
        const response = RESPONSE_MESSAGES.noGroup();
        return res.status(response.status).send(response);
      }

      if (groupInfo.leader !== userId) {
        const response = RESPONSE_MESSAGES.forbidden();
        return res.status(response.status).send(response);
      }

      const stringlifiedTags = JSON.stringify(tags);
      const group = {
        name,
        description,
        leader: userId,
        tags: stringlifiedTags,
        max_members,
        visibility,
        color,
        goal_hr,
      };

      if (!visibility && password !== "") {
        const isValidPassword = validatePassword(password, 30, 4, false);
        if (!isValidPassword.isValid) {
          return res.status(400).send({
            success: false,
            status: 400,
            message: isValidPassword.reason,
            error: { reason: isValidPassword.reason },
          });
        }
        const hashed = hashing(password);
        group.salt = hashed[0];
        group.password = hashed[1];
      }

      await connection.query("UPDATE `groups` set ? WHERE group_id = ? ", [
        group,
        group_id,
      ]);
      //delete cached chatroom name
      redisClient.del(`chatroom:${group_id}:name`);

      res.status(200).send({
        success: true,
        status: 200,
        message: `Group ${group.name} updated!`,
        data: { group_id },
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

/**
 * join group
 */
Router.post("/group/join", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { group_id: groupId, password } = req.body;

      const isValidGroupId = validateStrictString(groupId, "group id", 10, 10);
      if (!isValidGroupId.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidGroupId.reason,
          error: { reason: isValidGroupId.reason },
        });
      }

      const connection = pool.promise();

      const [userInfo, groups, [[groupInfo]]] = await Promise.all([
        userCache(connection, userId),
        userGroupsCache(connection, userId),
        connection.query(
          `SELECT 
          g.password, 
          g.salt, 
          g.visibility, 
          g.max_members, 
          g.name,
          GROUP_CONCAT(DISTINCT m.user_id) AS members
          FROM \`groups\` g
          LEFT JOIN group_members m ON g.group_id = m.group_id
          WHERE g.group_id = ?`,
          [groupId]
        ),
      ]);

      if (!userInfo) {
        const response = RESPONSE_MESSAGES.noUser();
        return res.status(response.status).send(response);
      }

      if (!groupInfo) {
        const response = RESPONSE_MESSAGES.noGroup();
        return res.status(response.status).send(response);
      }

      groupInfo.members = groupInfo.members ? groupInfo.members.split(",") : [];

      if (groupInfo.members.includes(userId)) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: "Already Joined",
          error: {
            reason: "Already Joined",
          },
        });
      }

      //private group
      if (!groupInfo.visibility) {
        const isValidPassword = validateLength(password, "password", 100);

        if (!isValidPassword.isValid) {
          return res.status(400).send({
            success: false,
            status: 400,
            message: isValidPassword.reason,
            error: { reason: isValidPassword.reason },
          });
        }

        const hashedPassword = crypto
          .pbkdf2Sync(password, groupInfo.salt, 99097, 32, "sha512")
          .toString("hex");
        if (hashedPassword !== groupInfo.password) {
          return res.status(400).send({
            success: false,
            status: 400,
            message: "Wrong Password",
            error: { reason: "Wrong Password" },
          });
        }
      }

      const joined = {
        group_id: groupId,
        user_id: userId,
      };

      await connection.query(`INSERT INTO group_members SET ?`, joined);

      mainIo.emit(`joined:${groupId}`, { userId });

      groups.push(groupId);
      cacheUserGroups(userId, groups);

      //send user's study information to group members
      const activeSubject = await activeSubjectCache(userId);
      const today = DateTime.now().setZone(userInfo.timezone);
      const timezoneOffset = Math.floor(today.offset / 60).toString();
      let study_time = await redisClient.zscore(
        `users:${timezoneOffset}:dayTotal`,
        userId
      );
      study_time = study_time === null ? 0 : study_time;
      mainIo.to(groupId).emit(`group:member:new`, {
        groupId,
        userInfo: {
          ...userInfo,
          study_time,
          activeSubject,
        },
      });

      cacheChatroomMembers(connection, groupId, userId, false);

      const chatroom = {
        chatroom_id: groupId,
        name: groupInfo.name,
        type: 0,
        members: groupInfo.members,
        lastMsg: null,
        lastRead: null,
        unreads: 0,
      };

      mainIo.to(userId).emit("new-chatroom", { chatroom });
      mainIo.in(userId).socketsJoin(`chatroom:${groupId}`);

      res.status(200).send({
        success: true,
        status: 200,
        message: `Joined group "${groupInfo.name}"`,
        action: { code: 1, group_id: groupId },
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

/**
 * leave group
 */
Router.post("/group/leave", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { group_id: groupId } = req.body;
      const connection = pool.promise();

      const userInfo = await userCache(connection, userId);

      if (!userInfo) {
        const response = RESPONSE_MESSAGES.noUser();
        return res.status(response.status).send(response);
      }

      const [{ affectedRows }] = await connection.query(
        `DELETE FROM group_members WHERE user_id = ? AND group_id = ?`,
        [userId, groupId]
      );

      if (!affectedRows) {
        const response = RESPONSE_MESSAGES.noGroup();
        return res.status(response.status).send(response);
      }

      redisClient.srem(`user:${userId}:groups`, groupId);

      redisClient.srem(`chatroom:${groupId}`, userId);

      mainIo.emit(`group:member:left`, { groupId, userId });

      return res.status(200).send({
        success: true,
        status: 200,
        message: `Left group`,
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.delete("/member", async (req, res) => {
  const { memberId, groupId } = req.body;
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();

      const [merberInfo, [[groupInfo]]] = await Promise.all([
        userCache(memberId),
        connection.query("SELECT leader, name FROM groups WHERE group_id = ?", [
          groupId,
        ]),
      ]);

      if (!merberInfo) {
        const response = RESPONSE_MESSAGES.noTargetUser();
        return res.status(response.status).send(response);
      }

      if (!groupInfo) {
        const response = RESPONSE_MESSAGES.noGroup();
        return res.status(response.status).send(response);
      }

      if (groupInfo.leader !== userId) {
        const response = RESPONSE_MESSAGES.forbidden();
        return res.status(response.status).send(response);
      }

      await connection.query(
        `DELETE FROM group_members WHERE group_id = ? AND user_id = ?`,
        [groupId, userId]
      );

      redisClient.srem(`user:${memberId}:groups`, groupId);

      redisClient.srem(`chatroom:${groupId}`, memberId);
      mainIo.emit(`removeMember`, { groupId, memberId });

      return res.status(200).send({ success: true, status: 200 });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.post("/transfer-ownership", async (req, res) => {
  const { group_id: groupId, member_id: memberId } = req.body;
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      const [[group]] = await connection.query(
        "SELECT leader FROM groups WHERE group_id = ?",
        [groupId]
      );

      if (group.leader != userId) {
        const response = RESPONSE_MESSAGES.forbidden();
        return res.status(response.status).send(response);
      }

      await connection.query(
        "UPDATE groups SET leader = ? WHERE group_id = ?",
        [memberId, groupId]
      );
      mainIo.to(`chat:${groupId}`).emit("leaderChange", groupId, memberId);
      return res.status(200).send({ success: true, status: 200 });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.post("/group/like", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { like, group_id: groupId } = req.body;

      const isValidGroupId = validateStrictString(groupId, "group id");

      if (!isValidGroupId.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidGroupId.reason,
          error: { reason: isValidGroupId.reason },
        });
      }

      const isValidlike = validateBoolean(like, "like", true);

      if (!isValidlike.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidlike.reason,
          error: { reason: isValidlike.reason },
        });
      }

      const connection = pool.promise();

      if (like) {
        const newLike = {
          user_id: userId,
          group_id: groupId,
        };

        await connection.query(`INSERT INTO group_likes SET ?`, newLike);

        mainIo.emit(`group:like:${groupId}`, { userId });
      } else {
        await connection.query(
          `DELETE FROM group_likes WHERE user_id = ? AND group_id = ?`,
          [userId, groupId]
        );

        mainIo.emit(`group:unlike:${groupId}`, { userId });
      }

      return res.status(200).send({ success: true, status: 200 });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.get("/group/members", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { group_id: groupId, timezone } = req.query;

      const isValidGroupId = validateStrictString(groupId, "group id");

      if (!isValidGroupId.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidGroupId.reason,
          error: { reason: isValidGroupId.reason },
        });
      }

      const connection = pool.promise();

      const today = DateTime.now().setZone(timezone);
      const timezoneOffset = Math.floor(today.offset / 60).toString();
      const [[groupInfo]] = await connection.query(
        `SELECT 
            g.visibility, 
            GROUP_CONCAT(
              JSON_OBJECT('user_id', u.user_id, 'name', u.name)
            ) AS members
          FROM groups g
          JOIN group_members m ON m.group_id = g.group_id
          JOIN users u ON u.user_id = m.user_id
          WHERE g.group_id = ?
          GROUP BY g.group_id`,
        [groupId]
      );

      if (!groupInfo) {
        const response = RESPONSE_MESSAGES.noGroup();
        return res.status(response.status).send(response);
      }

      groupInfo.members = JSON.parse(`[${groupInfo.members}]`);

      if (
        !groupInfo.visibility &&
        !groupInfo.members.find((member) => member.user_id === userId)
      ) {
        return res.status(400).send(RESPONSE_MESSAGES["non-memeber"]);
      }

      const members = await Promise.all(
        groupInfo.members.map(async (member) => {
          let study_time = await redisClient.zscore(
            `users:${timezoneOffset}:dayTotal`,
            member.user_id
          );
          study_time = study_time === null ? 0 : parseInt(study_time);
          const activeSubject = await activeSubjectCache(member.user_id);
          return { ...member, study_time, activeSubject };
        })
      );

      return res
        .status(200)
        .send({ success: true, status: 200, data: { members } });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

module.exports = Router;
