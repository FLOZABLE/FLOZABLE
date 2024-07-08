const express = require("express");
const {
  autoSignin,
  generateRandomId,
  friendRecommendationGen,
} = require("../Utils/tool");
const {
  NotificationCache,
  userCache,
  activeSubjectCache,
  subjectCache,
  dmRoomsCache,
} = require("../services/redisLoader");
const redisClient = require("../model/redis");
const pool = require("../model/pool");
const { sendEmail } = require("../email");
const {
  validateEmail,
  validateStrictString,
  validateBoolean,
} = require("../Utils/validate");
const { DateTime } = require("luxon");
const { mainIo } = require("../sockets/mainIo");
const { responseCodes } = require("../Constant");
const Router = express.Router();

async function sendFriendRequest(userId, targetId) {
  try {
    const isValidTargetId = validateStrictString(targetId, "user id", 10);

    if (!isValidTargetId.isValid) {
      return { success: false, reason: isValidTargetId.reason };
    }

    if (userId === targetId)
      return {
        success: false,
        reason: "Cannot send request to yourself",
      };

    const targetUserInfo = await userCache(targetId);
    if (!targetUserInfo) return { success: false, reason: "No such user" };

    const { friends, name } = targetUserInfo;
    if (friends.includes(userId))
      return {
        success: false,
        reason: "You're already friends with this user",
      };

    const friendRequests = await NotificationCache(targetId, 0, false);
    console.log(friendRequests);
    const prevFriendReq = friendRequests.find((friendReq) => {
      return friendReq.f === userId;
    });
    if (prevFriendReq)
      return {
        success: false,
        reason: "You've already sent a request to this user",
      };

    const id = generateRandomId(5);
    const date = Math.floor(new Date().getTime() / (1000 * 60));
    const notificationUser = await userCache(userId);
    const socketNotif = { i: id, t: 0, f: notificationUser, d: date };
    const notification = { t: 0, f: userId, d: date };
    mainIo.to(targetId).emit("notification", socketNotif);
    //to target user
    redisClient.hSet(
      `user:${targetId}:notifications`,
      id,
      JSON.stringify(notification)
    );

    //to me
    const ongoing = { t: -2, f: targetId };
    redisClient.hSet(
      `user:${userId}:notifications`,
      id,
      JSON.stringify(ongoing)
    );
    ongoing.f = await userCache(targetId);
    ongoing.i = id;
    mainIo.to(userId).emit("notification", ongoing);
    return { success: true, msg: `Sent friend request to ${name}!` };
  } catch (err) {
    console.log(err);
    return { success: false, reason: "Error" };
  }
}

async function replyFriendRequest(userId, targetId, accepted, notificationId) {
  try {
    const isValidTargetId = validateStrictString(targetId, "user id", 10);

    if (!isValidTargetId.isValid) {
      return { success: false, reason: isValidTargetId.reason };
    }

    if (notificationId) {
      const isValidNotificationId = validateStrictString(
        notificationId,
        "notification id",
        10
      );
      if (!isValidNotificationId.isValid)
        return { success: false, reason: isValidNotificationId.reason };
    }

    const isValidAcceped = validateBoolean(accepted, "accept", true);

    if (!isValidAcceped.isValid) {
      return { success: false, reason: isValidAcceped.reason };
    }

    let friendReq;

    if (!notificationId) {
      const friendRequests = await NotificationCache(userId, 0, false);
      friendReq = friendRequests.find((friendReq) => {
        return friendReq.f === targetId;
      });

      if (!friendReq) return { success: false, reason: "expired request" };
    } else {
      friendReq = await redisClient.hGet(
        `user:${userId}:notifications`,
        notificationId
      );
      if (!friendReq) return { success: false, reason: "expired request" };

      friendReq = { id: notificationId, ...JSON.parse(friendReq) };
    }

    redisClient.hDel(`user:${userId}:notifications`, friendReq.i);
    //remove it from ongoing friend req list
    redisClient.hDel(`user:${targetId}:notifications`, friendReq.i);
    if (!accepted) {
      return { success: true, msg: "Declined Friend Request!" };
    }

    const connection = pool.promise();
    const userInfo = await userCache(userId);

    if (!userInfo) return { success: false, reason: responseCodes["no-user"] };

    const targetInfo = await userCache(targetId);

    if (!targetInfo)
      return { success: false, reason: responseCodes["no-user"] };

    if (userInfo.friends.includes(userId))
      return {
        success: true,
        msg: `You and ${targetInfo.name} were already friends!`,
      };

    await connection.query(
      `
      UPDATE users
      SET friends = CASE
        WHEN friends = '' THEN ?
        ELSE CONCAT(friends, ',', ?)
      END
      WHERE user_id = ?
    `,
      [targetId, targetId, userId]
    );

    await connection.query(
      `
    UPDATE users
    SET friends = CASE
      WHEN friends = '' THEN ?
      ELSE CONCAT(friends, ',', ?)
    END
    WHERE user_id = ?
  `,
      [userId, userId, targetId]
    );

    const id = generateRandomId(5);
    const date = Math.floor(new Date().getTime() / (1000 * 60));
    const notification = { t: 1, f: userId, d: date };
    const notificationUser = await userCache(userId);
    const socketNotif = { i: id, t: 1, f: notificationUser, d: date };
    mainIo.to(targetId).emit("notification", socketNotif);
    redisClient.hSet(
      `user:${targetId}:notifications`,
      id,
      JSON.stringify(notification)
    );

    //update cached value of user
    userInfo.friends.push(targetId);
    redisClient.hSet(`user:${userId}`, "friends", userInfo.friends.join(","));
    targetInfo.friends.push(userId);
    redisClient.hSet(
      `user:${targetId}`,
      "friends",
      targetInfo.friends.join(",")
    );

    //create chat only if it does not exist
    const [[{ record_count }]] = await connection.query(
      `SELECT COUNT(*) AS record_count
    FROM chatrooms
    WHERE 
      (members LIKE ? AND members LIKE ?)
      OR
      (members LIKE ? AND members LIKE ?)
    LIMIT 1;`,
      [`%${userId}%`, `%${targetId}%`, `%${targetId}%`, `%${userId}%`]
    );

    if (!record_count) {
      const members = [userId, targetId];
      const roomInfo = {
        id: generateRandomId(10),
        type: 1,
        members: JSON.stringify(members).slice(1, -1).replaceAll(`"`, ""),
      };
      await connection.query(
        `
      INSERT INTO chatrooms SET ?
    `,
        [roomInfo]
      );

      /* const myDmRooms = await dmRoomsCache(userId);
      myDmRooms.push(roomInfo.id);
      const targetDmRooms = await dmRoomsCache(targetId);
      targetDmRooms.push(roomInfo.id);
      redisClient.hSet(`user:${userId}`, "dmRooms", JSON.stringify(myDmRooms));
      redisClient.hSet(
        `user:${targetId}`,
        "dmRooms",
        JSON.stringify(targetDmRooms)
      ); 
      redisClient.sAdd(`room:${roomInfo.id}`, members);*/

      redisClient.hDel(`user:${userId}`, "dmRooms");
      redisClient.hDel(`user:${targetId}`, "dmRooms");

      mainIo.to(userId).emit("joinChatRoom", roomInfo.id, true);
      mainIo.to(targetId).emit("joinChatRoom", roomInfo.id, true);

      //remove chat request if any
      /* const myChatRequests = await NotificationCache(userId, 4, false);
      const chatRequest = myChatRequests.find((chatRequest) => {
        return chatRequest.f === targetId;
      });
      if (chatRequest) {
        redisClient.hDel(`user:${userId}:notifications`, chatRequest.i);
      }

      const targetChatRequests = await NotificationCache(targetId, 4, false);
      const targetchatRequest = targetChatRequests.find((chatRequest) => {
        return chatRequest.f === targetId;
      });
      if (targetchatRequest) {
        redisClient.hDel(`user:${targetId}:notifications`, targetchatRequest.i);
      } */

      return {
        success: true,
        msg: `You and ${targetInfo.name} are now friends!`,
      };
    }
  } catch (error) {
    console.log(error);
    return { success: false, reason: "Error" };
  }
}

//send friend request
Router.post("/request", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { targetId } = req.body;

      const response = await sendFriendRequest(userId, targetId);
      return res.send(response);
    } catch (error) {
      console.log(error);
      res.send({ success: false, reason: "An Error Occured" });
    }
  });
});

Router.delete("/request", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { targetId } = req.body;

      const isValidTargetId = validateStrictString(targetId, "user id", 10);

      if (!isValidTargetId.isValid) {
        return res.send({ success: false, reason: isValidTargetId.reason });
      }

      const friendRequests = await NotificationCache(targetId, 0, false);
      const friendReq = friendRequests.find((friendReq) => {
        return friendReq.f === userId;
      });
      if (!friendReq)
        return res.send({ success: false, reason: "expired request" });
      redisClient.hDel(`user:${targetId}:notifications`, friendReq.i);
      //remove it from ongoing friend req list
      redisClient.hDel(`user:${userId}:notifications`, friendReq.i);
      res.send({ success: true });
    } catch (error) {
      console.log(error);
      res.send({ success: false, reason: "Failed" });
    }
  });
});

//accept/decline friend request
Router.post("/request/reply", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { targetId, accepted, notificationId } = req.body;

      const response = await replyFriendRequest(
        userId,
        targetId,
        accepted,
        notificationId
      );

      console.log(response);
      return res.send(response);
    } catch (error) {
      console.log(error);
      res.send({ success: false, reason: "Failed" });
    }
  });
});

Router.get("/recommended", async (req, res) => {
  autoSignin(
    req,
    res,
    async (userId) => {
      try {
        const userInfo = await userCache(userId);
        if (!userInfo) {
          const users = await friendRecommendationGen();
          return res.send({ success: true, users });
        }
        const { friends } = userInfo;

        const excluded = [...friends, userId];

        const users = await friendRecommendationGen(excluded);
        return res.send({ success: true, users });
      } catch (error) {
        console.log(error);
        res.send({ success: false, reason: "An Error Occured" });
      }
    },
    async () => {
      try {
        const users = await friendRecommendationGen();
        console.log("users");
        return res.send({ success: true, users });
      } catch (err) {
        console.log(err);
      }
    }
  );
});

Router.get("/status", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const userInfo = await userCache(userId);
      if (!userInfo)
        return res.send({ success: false, reason: `no such user` });
      const friendsInfo = [];

      const today = DateTime.now().setZone(userInfo.timezone);
      const timezoneOffset = Math.floor(today.offset / 60).toString();

      await Promise.all(
        userInfo.friends.map(async (friend) => {
          friend = await userCache(friend);
          if (!friend) return;
          const totalTime = await redisClient.zScore(
            `user:${friend.user_id}:dayTotal`,
            timezoneOffset
          );
          friend.totalTime = totalTime === null ? 0 : totalTime;
          const activeSubject = await activeSubjectCache(friend.user_id);
          if (activeSubject) {
            const subject = await subjectCache(
              friend.user_id,
              activeSubject.id
            );
            if (subject) {
              friend.activeSubject = {
                ...subject,
                total: activeSubject.total,
                time: activeSubject.time,
              };
            } else {
              friend.activeSubject = activeSubject;
            }
          }

          if (friend.ActiveGroup) {
            const ActiveGroup = JSON.parse(friend.ActiveGroup);
            const connection = pool.promise();
            const [[groupInfo]] = await connection.query(
              "SELECT group_id, name, leader, visibility, explanation, date, members, max_members, tags, color, goal_hr, average_hr, likes FROM `groups` WHERE group_id = ?",
              [ActiveGroup.id]
            );
            if (groupInfo) {
              friend.ActiveGroup = { ...groupInfo, time: ActiveGroup.time };
            }
          }
          friendsInfo.push(friend);
        })
      );
      res.send({ success: true, friendsInfo });
    } catch (error) {
      console.log(error);
      res.send({ success: false, reason: "An Error Occured" });
    }
  });
});

Router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    const isValidQuery = validateStrictString(query, "query", 10, 2);

    if (!isValidQuery.isValid) {
      return res.send({ success: false, reason: isValidQuery.reason });
    }

    const connection = pool.promise();
    const [users] = await connection.query(
      `SELECT user_id, name, timezone from users where name like ? LIMIT 10`,
      `%${query}%`
    );
    res.send({ success: true, users });
  } catch (err) {
    console.log(err);
  }
});

const MAX_DURATION = 60 * 60 * 24 * 7;

async function createFriendLink(userId) {
  try {
    let linkId = await redisClient.get(`link:friend:${userId}`);
    if (!linkId) {
      linkId = generateRandomId(5);
      redisClient.setEx(`link:friend:${userId}`, MAX_DURATION, linkId);
    }
    return linkId;
  } catch (error) {
    console.log(error);
    return false;
  }
}

Router.post("/link/create", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    const linkId = await createFriendLink(userId);
    if (linkId) {
      return res.send({ success: true, linkId });
    } else {
      return res.send({ success: false, reason: "Err" });
    }
  });
});

/**
 * add using link
 */

Router.get("/link/add", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { id } = req.query;
      const targetId = req.query.user;

      const isValidId = validateStrictString(id, "add id", 10);

      if (!isValidId.isValid) {
        return res.send({ success: false, reason: isValidId.reason });
      }

      const linkId = await redisClient.get(`link:friend:${targetId}`);
      console.log(linkId);
      if (!linkId || linkId !== id)
        return res.send({ success: false, reason: "Expired or invalid link" });

      const response = await replyFriendRequest(userId, targetId, true);

      if (!response.success) return response;

      const myNotifications = await NotificationCache(userId, -1, false);
      const targetNotifications = await NotificationCache(targetId, -1, false);

      //remove friend request if any from target & me
      const myFriendReqs = myNotifications.filter((notification) => {
        return (
          notification.f === targetId &&
          (notification.t === 0 || notification.t === -2)
        );
      });
      myFriendReqs.map((friendReq) => {
        redisClient.hDel(`user:${userId}:notifications`, friendReq.i);
      });

      const targetFriendReqs = targetNotifications.filter((notification) => {
        return (
          notification.f === userId &&
          (notification.t === 0 || notification.t === -2)
        );
      });
      targetFriendReqs.map((friendReq) => {
        redisClient.hDel(`user:${targetId}:notifications`, friendReq.i);
      });

      res.send(response);
    } catch (error) {
      console.log(error);
      res.send({ success: false, reason: "An Error Occured" });
    }
  });
});

Router.post("/invitation/email", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { email } = req.body;

      const isValidEmail = validateEmail(email);

      if (!isValidEmail.isValid) {
        return res.send({ success: false, reason: isValidEmail.reason });
      }

      const linkId = await createFriendLink(userId);
      if (!linkId) return res.send({ success: false, reason: "Error" });

      const userInfo = await userCache(userId);
      if (!userInfo) return res.send({ success: false, reason: "Error" });
      const params = {
        name: userInfo.name,
        userId: userInfo.user_id,
        link: linkId,
      };
      const to = [{ email }];
      sendEmail(to, params, 3);
      res.send({ success: true });
    } catch (err) {
      console.log(err);
      res.send({ success: false });
    }
  });
});

module.exports = { Router, sendFriendRequest, replyFriendRequest };
