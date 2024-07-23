const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const crypto = require("crypto");
const { hashing, generateRandomId, autoSignin } = require("../Utils/tool");
const { activeSubjectCache, userCache } = require("../services/redisLoader");
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
const { responseCodes } = require("../Constant");
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
    console.error("Error performing database queries:", err);
    res.status(500).send({ success: false, reason: "An error occurred" });
  }
});

/**
 * create group
 */
Router.put("/group", async (req, res) => {
  autoSignin(
    req,
    res,
    async (userId) => {
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

        const isValidVisibility = validateInteger(
          visibility,
          "visibility",
          1,
          0
        );
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
        const date = Math.floor(new Date().getTime() / 1000);
        const stringlifiedTags = JSON.stringify(tags);
        const group = {
          group_id,
          salt: hashed[0],
          password: hashed[1],
          date,
          name,
          description,
          leader: userId,
          tags: stringlifiedTags,
          max_members,
          visibility,
          color,
          goal_hr,
        };

        //update cached values
        const userInfo = await userCache(userId);
        if (!userInfo) {
          return res.send(responseCodes["no-user"]);
        }

        const { groups } = userInfo;

        groups.push(group_id);
        redisClient.hset(`user:${userId}`, "groups", groups.toString());

        try {
          const connection = pool.promise();

          await connection.query("INSERT INTO `groups` SET ?", group);
          await connection.query(
            `
        UPDATE users
        SET \`groups\` = ?
        WHERE user_id = ?
      `,
            [groups.toString(), userId]
          );

          const roomInfo = {
            id: group_id,
          };

          connection.query(`INSERT INTO chatrooms SET ?`, roomInfo);

          res.send({
            success: true,
            data: { id: group_id },
            msg: `Group ${group.name} created!`,
          });
        } catch (error) {
          console.log(error);
          res.send({ success: false, reason: "Error" });
        }
      } catch (error) {
        console.log(error);
        res.send({ success: false, reason: "Error" });
      }
    },
    () => {
      req.session.retrivedProgress = req.body;
      res.send({ success: false, reason: "not autenticated" });
    }
  );
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
      } catch (error) {
        console.log(error);
        res.send({ success: false, reason: "Error" });
      }
    } catch (error) {
      console.log(error);
      res.send({ success: false, reason: "Error" });
    }
  });
});

/**
 * join group
 */
Router.post("/join/:id", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const groupId = req.params.id;

      const isValidGroupId = validateStrictString(groupId, "group id", 10, 10);
      if (!isValidGroupId.isValid) {
        return res.send({ success: false, reason: isValidGroupId.reason });
      }

      const userInfo = await userCache(userId);

      if (!userInfo) return res.send(responseCodes["no-user"]);

      const connection = pool.promise();
      const [[groupInfo]] = await connection.query(
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
      );
      if (!groupInfo)
        return res.send({ success: false, reason: `Group does not exist` });

      if (groupInfo.members.includes(userId))
        return res.send({ success: false, reason: "Already Joined" });

      //private group
      if (!groupInfo.visibility) {
        const { password } = req.body;
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

      const newMember = {
        group_id: groupId,
        user_id: userId,
      };

      await connection.query(`INSERT INTO group_members SET ?`, newMember);

      mainIo.emit(`newMember:${groupId}`, userId);
      res.send({ success: true, msg: `Joined group "${groupInfo.name}"` });
      const { groups } = userInfo;
      groups.push(groupId);
      redisClient.hset(`user:${userId}`, "groups", groups.join(","));
      //send user's study information to group members
      const activeSubject = await activeSubjectCache(userId);
      const today = DateTime.now().setZone(userInfo.timezone);
      const timezoneOffset = Math.floor(today.offset / 60).toString();
      let totalTime = await redisClient.zscore(
        `users:${timezoneOffset}:dayTotal`,
        userId
      );
      totalTime = totalTime === null ? 0 : totalTime;
      mainIo.to(`chat:${groupId}`).emit(`newMemberInfo`, groupId, {
        ...userInfo,
        totalTime,
        activeSubject,
      });

      //update cached value only if it exists
      /* const isCached = await redisClient.exists(`room:${groupId}`);
      if (isCached) {
        redisClient.sadd(`room:${groupId}`, userId);
      } */

      mainIo.to(userId).emit("joinChatRoom", groupId);
    } catch (err) {
      // Handle any errors that may occur during the execution of queries
      console.error("Error performing database queries:", err);
    }
  });
});

/**
 * leave group
 */
Router.post("/leave", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { groupId } = req.body;
      const userInfo = await userCache(userId);

      if (!userInfo) return res.send(responseCodes["no-user"]);

      const connection = pool.promise();

      const [{ changedRows }] = await connection.query(
        `DELETE FROM group_members WHERE user_id = ? AND group_id = ?`,
        [userId, groupId]
      );

      if (!changedRows) return res.send(responseCodes["no-group"]);

      userInfo.groups = [
        ...new Set(userInfo.groups.filter((g) => g !== groupId)),
      ];

      redisClient.hset(`user:${userId}`, "groups", userInfo.groups.toString());

      redisClient.srem(`room:${groupId}`, userId);

      mainIo.emit(`removeMember`, groupId, userId);

      return res.send({ success: true });
    } catch (err) {
      console.log(err);
    }
  });
});

Router.delete("/member", async (req, res) => {
  const { memberId, groupId } = req.body;
  autoSignin(req, res, async (userId) => {
    try {
      const merberInfo = await userCache(memberId);

      if (!merberInfo) return res.send(responseCodes["no-user"]);

      const connection = pool.promise();
      const [[group]] = await connection.query(
        "SELECT leader, name, members FROM groups WHERE group_id = ?",
        [groupId]
      );

      if (group.leader !== userId) {
        return res.send({
          success: false,
          reason: "You do not have the permission to remove members",
        });
      }

      group.members = group.members.split(",");
      group.members = [
        ...new Set(group.members.filter((mem) => mem != memberId)),
      ];
      await connection.query(
        "UPDATE groups SET members = ? WHERE group_id = ?",
        [group.members.toString(), groupId]
      );

      merberInfo.groups = merberInfo.groups.filter((g) => g != groupId);
      redisClient.hset(
        `user:${memberId}`,
        "groups",
        merberInfo.groups.toString()
      );

      redisClient.srem(`room:${groupId}`, memberId);
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

        const [{ changedRows }] = await connection.query(
          `INSERT INTO group_likes SET ?`,
          newLike
        );

        if (changedRows) {
          mainIo.emit(`liked:${groupId}`, userId);
        }
      } else {
        const [{ changedRows }] = await connection.query(
          `DELETE FROM group_likes WHERE user_id = ? AND group_id = ?`,
          [userId, groupId]
        );

        if (changedRows) {
          mainIo.emit(`liked:${groupId}`, userId);
        }
      }

      return res.send({ success: true });
    } catch (err) {
      console.error("Error performing database queries:", err);
      res.status(500).send({ success: false, reason: "An error occurred" });
    }
  });
});

Router.get("/members", async (req, res) => {
  autoSignin(
    req,
    res,
    async (userId, timezone) => {
      const { groupId } = req.query;

      const isValidGroupId = validateStrictString(groupId, "group id");

      if (!isValidGroupId.isValid) {
        return res.send({ success: false, reason: isValidGroupId.reason });
      }

      const connection = pool.promise();
      try {
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
          groupInfo.visibility ||
          groupInfo.members.find((member) => member.user_id === userId)
        ) {
          const membersData = await Promise.all(
            groupInfo.members.map(async (member) => {
              let totalTime = await redisClient.zscore(
                `users:${timezoneOffset}:dayTotal`,
                member.user_id
              );
              totalTime = totalTime === null ? 0 : totalTime;
              const activeSubject = await activeSubjectCache(member.user_id);
              return { ...member, totalTime, activeSubject };
            })
          );

          console.log(membersData);
          return res.send({ success: true, membersData });
        }
        res.send(responseCodes["non-memeber"]);
      } catch (err) {
        console.error("Error performing database queries:", err);
        res.status(500).send({ success: false, reason: "An error occurred" });
      }
    },
    undefined,
    true
  );
});

module.exports = Router;
