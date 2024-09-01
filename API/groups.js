const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const crypto = require("crypto");
const { hashing, generateRandomId, autoSignin } = require("../Utils/tool");
const {
  activeSubjectCache,
  userCache,
  userGroupsCache,
  cacheUserGroups,
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
} = require("../Utils/validate");
const { DateTime } = require("luxon");
const { RESPONSE_CODES } = require("../Constant");
const { mainIo } = require("../sockets/mainIo");

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
    }));
    res.send({ success: true, groups: formattedGroups });
  } catch (err) {
    console.err("Error performing database queries:", err);
    res.status(500).send({ success: false, reason: "An err occurred" });
  }
});

/**
 * create group
 */
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
        return res.send({ success: false, reason: isValidName.reason });
      }

      const isValidExplanation = validateLength(
        description,
        "Description",
        200,
        1
      );
      if (!isValidExplanation.isValid) {
        return res.send({
          success: false,
          reason: isValidExplanation.reason,
        });
      }

      const isValidTags = validateArray(tags, "tags", 10);
      if (!isValidTags.isValid) {
        return res.send({ success: false, reason: isValidTags.reason });
      }

      const isValidMembers = validateInteger(
        max_members,
        "max members",
        100,
        1
      );
      if (!isValidMembers.isValid) {
        return res.send({ success: false, reason: isValidMembers.reason });
      }

      const isValidVisibility = validateInteger(visibility, "visibility", 1, 0);
      if (!isValidVisibility.isValid) {
        return res.send({ success: false, reason: isValidVisibility.reason });
      }

      if (!visibility) {
        const isValidPassword = validatePassword(password, 20, 4, false);
        if (!isValidPassword.isValid) {
          return res.send({ success: false, reason: isValidPassword.reason });
        }
      }

      const isValidColor = validateHEX(color, "Color");

      if (!isValidMembers.isValid) {
        return res.send({ success: false, reason: isValidColor.reason });
      }

      const isValidGodalHr = validateInteger(goal_hr, "goal time", 10);
      if (!isValidGodalHr.isValid) {
        return res.send({ success: false, reason: isValidGodalHr.reason });
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

      try {
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

        res.send({
          success: true,
          groupInfo,
          msg: `Group ${group.name} created!`,
          action: { code: 1, group_id },
        });
      } catch (err) {
        console.log(err);
        res.send(RESPONSE_CODES["error"]);
      }
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES["error"]);
    }
  });
});

Router.delete("/group", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { groupId } = req.body;

      const isValidGroupId = validateStrictString(groupId, "group id");
      if (!isValidGroupId.isValid) {
        return res.send({ success: false, reason: isValidGroupId.reason });
      }

      const connection = pool.promise();

      const [[groupInfo]] = await connection.query(
        `SELECT name FROM groups WHERE leader = ? AND group_id = ?`,
        [userId, groupId]
      );

      if (!groupInfo) {
        return res.send(RESPONSE_CODES["no-group"]);
      }

      await connection.query(`DELETE FROM group_members WHERE group_id = ?`, [
        groupId,
      ]);

      await connection.query(`DELETE FROM groups WHERE group_id = ?`, [
        groupId,
      ]);
      redisClient.srem(`user:${userId}:groups`, groupId);
      console.log(groupInfo);
      res.send({ success: true, msg: `Deleted ${groupInfo.name}` });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES["error"]);
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
        return res.send({ success: false, reason: isValidGroupId.reason });
      }

      const isValidName = validateString(name, "Name");
      if (!isValidName.isValid) {
        return res.send({ success: false, reason: isValidName.reason });
      }

      const isValidExplanation = validateLength(
        description,
        "Description",
        200,
        1
      );
      if (!isValidExplanation.isValid) {
        return res.send({ success: false, reason: isValidExplanation.reason });
      }

      const isValidTags = validateArray(tags, "tags", 10);
      if (!isValidTags.isValid) {
        return res.send({ success: false, reason: isValidTags.reason });
      }

      const isValidMembers = validateInteger(
        max_members,
        "max members",
        100,
        0
      );
      if (!isValidMembers.isValid) {
        return res.send({ success: false, reason: isValidMembers.reason });
      }

      const isValidVisibility = validateInteger(visibility, "visibility", 1, 0);
      if (!isValidVisibility.isValid) {
        return res.send({ success: false, reason: isValidVisibility.reason });
      }

      const isValidColor = validateHEX(color, "Color");
      if (!isValidMembers.isValid) {
        return res.send({ success: false, reason: isValidColor.reason });
      }

      const isValidGodalHr = validateInteger(goal_hr, "goal time", 10);
      if (!isValidGodalHr.isValid) {
        return res.send({ success: false, reason: isValidGodalHr.reason });
      }

      const connection = pool.promise();

      const groupInfo = await connection.query(
        `SELECT leader FROM \`groups\` WHERE group_id = ? AND leader = ?`,
        [group_id, userId]
      );
      if (!groupInfo)
        return res.send({
          success: false,
          reason: "You are not the leader of this group",
        });

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
          return res.send({ success: false, reason: isValidPassword.reason });
        }
        const hashed = hashing(password);
        group.salt = hashed[0];
        group.password = hashed[1];
      }

      try {
        await connection.query("UPDATE `groups` set ? WHERE group_id = ? ", [
          group,
          group_id,
        ]);
        res.send({
          success: true,
          data: { id: group_id },
          msg: `Group ${group.name} updated!`,
        });
      } catch (err) {
        console.log(err);
        res.send(RESPONSE_CODES["error"]);
      }
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES["error"]);
    }
  });
});

/**
 * join group
 */
Router.post("/group/join", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { groupId, password } = req.body;

      const isValidGroupId = validateStrictString(groupId, "group id", 10, 10);
      if (!isValidGroupId.isValid) {
        return res.send({ success: false, reason: isValidGroupId.reason });
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

      if (!userInfo) return res.send(RESPONSE_CODES["no-user"]);

      if (!groupInfo)
        return res.send({ success: false, reason: `Group does not exist` });

      if (groupInfo.members.includes(userId))
        return res.send({ success: false, reason: "Already Joined" });

      //private group
      if (!groupInfo.visibility) {
        const isValidPassword = validateLength(password, "password", 100);

        if (!isValidPassword.isValid) {
          return res.send({ success: false, reason: isValidPassword.reason });
        }

        const hashedPassword = crypto
          .pbkdf2Sync(password, groupInfo.salt, 99097, 32, "sha512")
          .toString("hex");
        if (hashedPassword !== groupInfo.password) {
          return res.send({ success: false, reason: "Wrong Password" });
        }
      }

      const joined = {
        group_id: groupId,
        user_id: userId,
      };

      await connection.query(`INSERT INTO group_members SET ?`, joined);

      mainIo.emit(`joined:${groupId}`, userId);

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
      mainIo.to(groupId).emit(`newMember`, groupId, {
        ...userInfo,
        study_time,
        activeSubject,
      });

      mainIo.to(userId).emit("joinChatRoom", groupId);

      res.send({
        success: true,
        msg: `Joined group "${groupInfo.name}"`,
        action: { code: 1, group_id: groupId },
      });
    } catch (err) {
      // Handle any errors that may occur during the execution of queries
      console.err("Error performing database queries:", err);
    }
  });
});

/**
 * leave group
 */
Router.post("/group/leave", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { groupId } = req.body;
      const connection = pool.promise();

      const userInfo = await userCache(connection, userId);

      if (!userInfo) return res.send(RESPONSE_CODES["no-user"]);

      const [{ affectedRows }] = await connection.query(
        `DELETE FROM group_members WHERE user_id = ? AND group_id = ?`,
        [userId, groupId]
      );

      if (!affectedRows) return res.send(RESPONSE_CODES["no-group"]);

      redisClient.srem(`user:${userId}:groups`, groupId);

      redisClient.srem(`chatroom:${groupId}`, userId);

      mainIo.emit(`removeMember`, groupId, userId);

      return res.send({ success: true, msg: `Left group` });
    } catch (err) {
      console.log(err);
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

      if (!merberInfo) return res.send(RESPONSE_CODES["no-user"]);

      if (!groupInfo) return res.send(RESPONSE_CODES["no-group"]);

      if (groupInfo.leader !== userId) {
        return res.send({
          success: false,
          reason: "You do not have the permission to remove members",
        });
      }

      await connection.query(
        `DELETE FROM group_members WHERE group_id = ? AND user_id = ?`,
        [groupId, userId]
      );

      redisClient.srem(`user:${memberId}:groups`, groupId);

      redisClient.srem(`chatroom:${groupId}`, memberId);
      mainIo.emit(`removeMember`, groupId, memberId);

      return res.send({ success: true });
    } catch (err) {
      console.log(err);
    }
  });
});

Router.post("/transfer-ownership", async (req, res) => {
  const { memberId, groupId } = req.body;
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      const [[group]] = await connection.query(
        "SELECT leader FROM groups WHERE group_id = ?",
        [groupId]
      );

      if (group.leader != userId) {
        return res.send({
          success: false,
          reason: "You are not the owner of this group",
        });
      } else {
        await connection.query(
          "UPDATE groups SET leader = ? WHERE group_id = ?",
          [memberId, groupId]
        );
        mainIo.to(`chat:${groupId}`).emit("leaderChange", groupId, memberId);
        return res.send({ success: true });
      }
    } catch (err) {
      console.log(err);
    }
  });
});

Router.post("/like/:id", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    const groupId = req.params.id;
    const { liked } = req.body;

    const isValidGroupId = validateStrictString(groupId, "group id");

    if (!isValidGroupId.isValid) {
      return res.send({ success: false, reason: isValidGroupId.reason });
    }

    const isValidLiked = validateBoolean(liked, "like", true);

    if (!isValidLiked.isValid) {
      return res.send({ success: false, reason: isValidLiked.reason });
    }

    try {
      const connection = pool.promise();

      if (liked) {
        const newLike = {
          user_id: userId,
          group_id: groupId,
        };

        await connection.query(`INSERT INTO group_likes SET ?`, newLike);

        mainIo.emit(`liked:${groupId}`, userId);
      } else {
        await connection.query(
          `DELETE FROM group_likes WHERE user_id = ? AND group_id = ?`,
          [userId, groupId]
        );

        mainIo.emit(`unliked:${groupId}`, userId);
      }

      return res.send({ success: true });
    } catch (err) {
      console.err("Error performing database queries:", err);
      res.status(500).send({ success: false, reason: "An err occurred" });
    }
  });
});

Router.get("/group/members", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { groupId, timezone } = req.query;

      const isValidGroupId = validateStrictString(groupId, "group id");

      if (!isValidGroupId.isValid) {
        return res.send({ success: false, reason: isValidGroupId.reason });
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

      if (!groupInfo)
        return res.send({ success: false, reason: "No such group" });

      groupInfo.members = JSON.parse(`[${groupInfo.members}]`);

      if (
        !groupInfo.visibility &&
        !groupInfo.members.find((member) => member.user_id === userId)
      ) {
        return res.send(RESPONSE_CODES["non-memeber"]);
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

      return res.send({ success: true, members });
    } catch (err) {
      console.err("Error performing database queries:", err);
      res.status(500).send({ success: false, reason: "An err occurred" });
    }
  });
});

module.exports = Router;
