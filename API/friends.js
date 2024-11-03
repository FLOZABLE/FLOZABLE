const express = require("express");
const {
  generateRandomId,
  getDates,
  randomIntInRange,
} = require("../utils/tool");
const {
  notificationCache,
  userCache,
  activeSubjectCache,
  usersCache,
  activeGroupCache,
  userFriendsCache,
  cacheUserFriends,
} = require("../services/redisLoader");
const redisClient = require("../model/redis");
const pool = require("../model/pool");
const { sendEmail } = require("../email");
const {
  validateEmail,
  validateStrictString,
  validateBoolean,
} = require("../utils/validate");
const { DateTime } = require("luxon");
const { mainIo } = require("../sockets/io");
const { FRIENDS_LIMIT } = require("../Constant");
const Router = express.Router();
const { autoSignin } = require("./auth");
const RESPONSE_MESSAGES = require("../utils/responses");

async function sendFriendRequest(userId, targetId) {
  try {
    const isValidTargetId = validateStrictString(targetId, "user id", 10);

    if (!isValidTargetId.isValid) {
      return {
        success: false,
        status: 400,
        message: isValidTargetId.reason,
        error: { reason: isValidTargetId.reason },
      };
    }

    if (userId === targetId) {
      return {
        success: false,
        status: 400,
        message: "Cannot send request to yourself",
        error: { reason: "Cannot send request to yourself" },
      };
    }

    const connection = pool.promise();

    const [usersInfo, friends] = await Promise.all([
      usersCache(connection, [userId, targetId]),
      userFriendsCache(connection, userId),
    ]);

    const userInfo = usersInfo.find((user) => user.user_id === userId);

    const targetInfo = usersInfo.find((user) => user.user_id === targetId);

    if (!userInfo) {
      return RESPONSE_MESSAGES.noUser();
    }
    if (!targetInfo) {
      return RESPONSE_MESSAGES.noTargetUser();
    }

    if (friends.includes(userId)) {
      return {
        success: false,
        reason: "You're already friends with this user",
      };
    }

    if (friends.length > FRIENDS_LIMIT) {
      return RESPONSE_MESSAGES.friendsLimitReached();
    }

    const friendRequests = await notificationCache(targetId, 0);

    const prevFriendReq = friendRequests.find((friendReq) => {
      return friendReq.f === userId;
    });
    if (prevFriendReq) {
      return {
        success: false,
        status: 400,
        message: "You've already sent a request to this user",
        error: { reason: "You've already sent a request to this user" },
      };
    }

    const id = generateRandomId(5);
    const date = Math.floor(new Date().getTime() / 1000);
    const socketNotif = { i: id, t: 0, f: userInfo, d: date };
    const notification = { t: 0, f: userId, d: date };
    mainIo.to(targetId).emit("notification", socketNotif);
    //to target user
    redisClient.hset(
      `user:${targetId}:notifications`,
      id,
      JSON.stringify(notification)
    );

    //to me
    const ongoing = { t: -2, f: targetId };
    redisClient.hset(
      `user:${userId}:notifications`,
      id,
      JSON.stringify(ongoing)
    );
    ongoing.f = targetInfo;
    ongoing.i = id;
    mainIo.to(userId).emit("notification", ongoing);

    return {
      success: true,
      status: 200,
      message: `Sent friend request to ${targetInfo.name}!`,
    };
  } catch (err) {
    console.log(err);
    return RESPONSE_MESSAGES.error();
  }
}

async function replyFriendRequest(
  userId,
  targetId,
  accepted,
  notificationId,
  createChat = true
) {
  try {
    const isValidTargetId = validateStrictString(targetId, "user id", 10);

    if (!isValidTargetId.isValid) {
      return {
        success: false,
        status: 400,
        message: isValidTargetId.reason,
        error: { reason: isValidTargetId.reason },
      };
    }

    if (notificationId) {
      const isValidNotificationId = validateStrictString(
        notificationId,
        "notification id",
        10
      );
      if (!isValidNotificationId.isValid)
        return {
          success: false,
          status: 400,
          message: isValidNotificationId.reason,
          error: { reason: isValidNotificationId.reason },
        };
    }

    const isValidAcceped = validateBoolean(accepted, "accept", true);

    if (!isValidAcceped.isValid) {
      return {
        success: false,
        status: 400,
        message: isValidAcceped.reason,
        error: { reason: isValidAcceped.reason },
      };
    }

    let friendReq;

    if (!notificationId) {
      const friendRequests = await notificationCache(userId, 0);
      friendReq = friendRequests.find((friendReq) => {
        return friendReq.f === targetId;
      });

      if (!friendReq) return RESPONSE_MESSAGES.expiredRequest();
    } else {
      friendReq = await redisClient.hget(
        `user:${userId}:notifications`,
        notificationId
      );
      if (!friendReq) return RESPONSE_MESSAGES.expiredRequest();

      friendReq = { i: notificationId, ...JSON.parse(friendReq) };
    }

    redisClient.hdel(`user:${userId}:notifications`, friendReq.i);
    //remove it from ongoing friend req list
    redisClient.hdel(`user:${targetId}:notifications`, friendReq.i);
    if (!accepted) {
      return {
        success: true,
        status: 200,
        message: "Declined Friend Request!",
      };
    }

    const connection = pool.promise();
    const [usersInfo, userFriends, targetUserFriends] = await Promise.all([
      usersCache(connection, [userId, targetId]),
      userFriendsCache(connection, userId),
      userFriendsCache(connection, targetId),
    ]);

    const userInfo = usersInfo.find((user) => user.user_id === userId);

    const targetInfo = usersInfo.find((user) => user.user_id === targetId);
    if (!userInfo) {
      return RESPONSE_MESSAGES.noUser();
    }
    if (!targetInfo) {
      return RESPONSE_MESSAGES.noTargetUser();
    }

    if (userFriends.includes(targetId))
      return {
        success: true,
        status: 200,
        message: `You and ${targetInfo.name} were already friends!`,
      };

    if (
      userFriends.length >= FRIENDS_LIMIT ||
      targetUserFriends.length >= FRIENDS_LIMIT
    ) {
      return RESPONSE_MESSAGES.friendsLimitReached();
    }

    const date = Math.floor(new Date().getTime() / 1000);

    const newFriend = {
      user_id: userId,
      friend_id: targetId,
      date,
    };

    await connection.query(`INSERT INTO friends SET ?`, newFriend);

    const id = generateRandomId(5);
    const notification = { t: 1, f: userId, d: date };
    const socketNotif = { i: id, t: 1, f: userInfo, d: date };
    mainIo.to(targetId).emit("notification", socketNotif);
    redisClient.hset(
      `user:${targetId}:notifications`,
      id,
      JSON.stringify(notification)
    );

    userFriends.push(targetId);
    targetUserFriends.push(userId);

    cacheUserFriends(userId, userFriends);
    cacheUserFriends(targetId, targetUserFriends);

    //update cached value of user
    /* userInfo.friends.push(targetId);
    redisClient.hset(`user:${userId}`, "friends", userInfo.friends.join(","));
    targetInfo.friends.push(userId);
    redisClient.hset(
      `user:${targetId}`,
      "friends",
      targetInfo.friends.join(",")
    ); */

    //create chat only if it does not exist
    const [[chatroom]] = await connection.query(
      `
      SELECT c1.chatroom_id
      FROM chatroom_members c1
      JOIN chatroom_members c2 ON c1.chatroom_id = c2.chatroom_id
      WHERE c1.user_id = ? AND c2.user_id = ?
      `,
      [userId, targetId]
    );

    if (!chatroom && createChat) {
      const chatroom_id = generateRandomId(10);
      const chatroomName = userInfo.name + ", " + targetInfo.name;
      const roomInfo = {
        chatroom_id,
        type: 1,
        name: chatroomName,
      };
      await connection.query(
        `
          INSERT INTO chatrooms SET ?
        `,
        [roomInfo]
      );

      const newMember = [
        [userId, chatroom_id],
        [targetId, chatroom_id],
      ];

      await connection.query(
        `
        INSERT 
        INTO chatroom_members (user_id, chatroom_id) 
        VALUES ? 
        `,
        [newMember]
      );

      mainIo.to([userId, targetId]).emit("joinChatRoom");
    }

    return {
      success: true,
      status: 200,
      message: `You and ${targetInfo.name} are now friends!`,
    };
  } catch (err) {
    console.log(err);
    return RESPONSE_MESSAGES.error();
  }
}

//send friend request
Router.post("/request", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { target_id: targetId } = req.body;

      const response = await sendFriendRequest(userId, targetId);
      return res.status(response.status).send(response);
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.delete("/request", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { targetId } = req.body;

      const isValidTargetId = validateStrictString(targetId, "user id", 10);

      if (!isValidTargetId.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidTargetId.reason,
          error: { reason: isValidTargetId.reason },
        });
      }

      const friendRequests = await notificationCache(targetId, 0);
      const friendReq = friendRequests.find((friendReq) => {
        return friendReq.f === userId;
      });
      if (!friendReq) {
        const response = RESPONSE_MESSAGES.expiredRequest();
        return res.status(response.status).send(response);
      }

      redisClient.hdel(`user:${targetId}:notifications`, friendReq.i);
      //remove it from ongoing friend req list
      redisClient.hdel(`user:${userId}:notifications`, friendReq.i);
      res.status(200).send({ success: true, status: 200 });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

//accept/decline friend request
Router.post("/request/reply", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const {
        target_id: targetId,
        notification_id: notificationId,
        accepted,
      } = req.body;

      const response = await replyFriendRequest(
        userId,
        targetId,
        accepted,
        notificationId
      );

      console.log(response);
      return res.status(response.status).send(response);
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

async function getRecommendedFriends(connection, excluded = []) {
  try {
    const userIds = await redisClient.smembers(`month1`);
    const users = [];
    for (let i = 0; i < 100; i++) {
      if (users.length >= 7) {
        break;
      }
      const index = randomIntInRange(0, userIds.length - 1);
      const userId = userIds[index];
      if (![...excluded, ...users].includes(userId)) {
        users.push(userId);
      }
    }

    const usersInfo = await usersCache(connection, users);

    return usersInfo;
  } catch (err) {
    console.log(err);
    return [];
  }
}

Router.get("/recommended", async (req, res) => {
  autoSignin(
    req,
    res,
    async (userId) => {
      try {
        const connection = pool.promise();

        const friends = await userFriendsCache(connection, userId);
        const excluded = [...friends, userId];

        const users = await getRecommendedFriends(connection, excluded);
        return res
          .status(200)
          .send({ success: true, status: 200, data: { users } });
      } catch (err) {
        console.log(err);
        const response = RESPONSE_MESSAGES.error();
        return res.status(response.status).send(response);
      }
    },
    async () => {
      try {
        const connection = pool.promise();
        const users = await getRecommendedFriends(connection);
        return res.status(400).send({ success: true, data: { users } });
      } catch (err) {
        console.log(err);
        const response = RESPONSE_MESSAGES.error();
        return res.status(response.status).send(response);
      }
    }
  );
});

Router.get("/status", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();

      const [userInfo, friendsIds] = await Promise.all([
        userCache(connection, userId),
        userFriendsCache(connection, userId),
      ]);

      if (!userInfo) {
        const response = RESPONSE_MESSAGES.noUser();
        return res.status(response.status).send(response);
      }

      const { timezone } = req.query;

      const dateTime = DateTime.now().setZone(timezone).startOf("day");

      const timezoneOffset = Math.floor(dateTime.offset / 60).toString();

      const friends = await usersCache(connection, friendsIds);

      if (!friends.length) {
        return res.status(400).send({
          success: false,
          status: 400,
          error: { reason: "No friends" },
        });
      }

      const studyTotal = await redisClient.zmscore(
        `users:${timezoneOffset}:dayTotal`,
        friends.map((friend) => friend.user_id)
      );

      const friendGroups = [];

      await Promise.all(
        friends.map(async (friend, i) => {
          friend.study_time = studyTotal[i] ? parseInt(studyTotal[i]) : 0;

          const activeSubject = await activeSubjectCache(friend.user_id);

          friend.activeSubject = activeSubject;

          const activeGroup = await activeGroupCache(friend.user_id);

          if (activeGroup) {
            friendGroups.push(activeGroup.id);
            friend.activeGroup = { ...activeGroup };
          }
        })
      );

      if (friendGroups.length) {
        const [friendGroupsInfo] = await connection.query(
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
          WHERE g.group_id IN (?)
          GROUP BY g.group_id
          `,
          [friendGroups]
        );
        friendGroupsInfo.map((group) => {
          group.members = group.members ? group.members.split(",") : [];
          group.likes = group.likes ? group.likes.split(",") : [];
          group.tags = group.tags ? JSON.parse(group.tags) : [];
        });
        friends.map((friend) => {
          if (friend.activeGroup) {
            const activeGroup = friendGroupsInfo.find(
              (group) => group.group_id === friend.activeGroup.id
            );
            if (activeGroup) {
              friend.activeGroup = { ...friend.activeGroup, ...activeGroup };
            } else {
              friend.activeGroup = null;
            }
          }
        });
      }
      return res
        .status(200)
        .send({ success: true, status: 200, data: { friends } });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

Router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    const isValidQuery = validateStrictString(query, "query", 10, 2);

    if (!isValidQuery.isValid) {
      return res.status(400).send({
        success: false,
        status: 400,
        message: isValidQuery.reason,
        error: { reason: isValidQuery.reason },
      });
    }

    const connection = pool.promise();
    const [users] = await connection.query(
      `SELECT user_id, name, timezone from users where name like ? LIMIT 20`,
      `%${query}%`
    );
    res.status(200).send({ success: true, status: 200, data: { users } });
  } catch (err) {
    console.log(err);
    const response = RESPONSE_MESSAGES.error();
    return res.status(response.status).send(response);
  }
});

const MAX_DURATION = 60 * 60 * 24 * 7;

async function createFriendLink(userId) {
  try {
    let linkId = await redisClient.get(`link:friend:${userId}`);
    if (!linkId) {
      linkId = generateRandomId(5);
      redisClient.setex(`link:friend:${userId}`, MAX_DURATION, linkId);
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
      return res
        .status(200)
        .send({ success: true, status: 200, data: { linkId } });
    } else {
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
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
        return res
          .status(400)
          .send({ success: false, reason: isValidId.reason });
      }

      const linkId = await redisClient.get(`link:friend:${targetId}`);
      console.log(linkId);
      if (!linkId || linkId !== id)
        return res
          .status(400)
          .send({ success: false, reason: "Expired or invalid link" });

      const response = await replyFriendRequest(userId, targetId, true);

      if (!response.success) return response;

      const [myNotifications, targetNotifications] = await Promise.all([
        notificationCache(userId),
        notificationCache(targetId),
      ]);

      //remove friend request if any from target & me
      const myFriendReqs = myNotifications.filter((notification) => {
        return (
          notification.f === targetId &&
          (notification.t === 0 || notification.t === -2)
        );
      });
      myFriendReqs.map((friendReq) => {
        redisClient.hdel(`user:${userId}:notifications`, friendReq.i);
      });

      const targetFriendReqs = targetNotifications.filter((notification) => {
        return (
          notification.f === userId &&
          (notification.t === 0 || notification.t === -2)
        );
      });
      targetFriendReqs.map((friendReq) => {
        redisClient.hdel(`user:${targetId}:notifications`, friendReq.i);
      });

      res.status(response.status).send(response);
    } catch (error) {
      console.log(error);
      res.status(400).send({ success: false, reason: "An Error Occured" });
    }
  });
});

Router.post("/invitation/email", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { email } = req.body;

      const isValidEmail = validateEmail(email);

      if (!isValidEmail.isValid) {
        return res
          .status(400)
          .send({ success: false, reason: isValidEmail.reason });
      }

      const linkId = await createFriendLink(userId);
      if (!linkId)
        return res.status(400).send({ success: false, reason: "Error" });

      const userInfo = await userCache(connection, userId);
      if (!userInfo)
        return res.status(400).send({ success: false, reason: "Error" });
      const params = {
        name: userInfo.name,
        userId: userInfo.user_id,
        link: linkId,
      };
      const to = [{ email }];
      sendEmail(to, params, 3);
      res.status(400).send({ success: true });
    } catch (err) {
      console.log(err);
      res.status(400).send({ success: false });
    }
  });
});

Router.get("/trends", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { timezone } = req.query;
      const mode = "day";

      const connection = pool.promise();

      const [userInfo, userFriends] = await Promise.all([
        userCache(connection, userId),
        userFriendsCache(connection, userId),
      ]);

      if (!userInfo) {
        const response = RESPONSE_MESSAGES.noUser();
        return res.status(response.status).send(response);
      }

      const now = DateTime.now().setZone(timezone).startOf("day");
      const dates = getDates(now.toISO(), timezone, "day", 7);

      const friends = await usersCache(connection, userFriends);

      friends.push(userInfo);

      const [rankings] = await connection.query(
        `
        SELECT
          r.date,
          CASE 
            WHEN COUNT(rd.user_id) = 0 THEN '[]'
            ELSE JSON_ARRAYAGG(JSON_OBJECT('user_id', rd.user_id, 'study_time', rd.study_time))
          END AS users
        FROM rankings r
        LEFT JOIN ranking_details rd ON rd.ranking_id = r.ranking_id AND rd.user_id IN (?)
        WHERE r.date IN (?) AND r.mode = ?
        GROUP BY r.date
      `,
        [
          friends.map((friend) => friend.user_id),
          dates.map((date) => date.toSeconds()),
          mode,
        ]
      );

      rankings.map((ranking) => {
        ranking.users = JSON.parse(ranking.users);
      });

      const trends = await Promise.all(
        dates.map(async (date, index) => {
          if (date.toSeconds() === now.toSeconds()) {
            const timezoneOffset = Math.floor(now.offset / 60).toString();

            const studyTotal = await redisClient.zmscore(
              `users:${timezoneOffset}:${mode}Total`,
              friends.map((friend) => friend.user_id)
            );

            friends.map((friend, i) => {
              friend.study_time = studyTotal[i] ? parseInt(studyTotal[i]) : 0;
            });

            return {
              date: date.toSeconds(),
              friends: JSON.parse(JSON.stringify(friends)),
            };
          }

          const dateRankings = rankings.find(
            (ranking) => ranking.date === date.toSeconds()
          );

          if (!dateRankings) {
            return {
              date: date.toSeconds(),
              friends: friends.map((friend) => ({ ...friend, study_time: 0 })),
            };
          }

          friends.map((friend) => {
            const friendRanking = dateRankings.users.find(
              (ranking) => ranking.user_id === friend.user_id
            );
            friend.study_time = friendRanking ? friendRanking.study_time : 0;
          });

          return {
            date: date.toSeconds(),
            friends: JSON.parse(JSON.stringify(friends)),
          };
        })
      );

      return res
        .status(200)
        .send({ success: true, status: 200, data: { trends } });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

module.exports = { Router, sendFriendRequest, replyFriendRequest };
