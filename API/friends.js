const express = require("express");
const {
  generateRandomId,
  getDates,
  randomIntInRange,
} = require("../utils/tool");
const {
  userCache,
  activeSubjectCache,
  usersCache,
  activeGroupCache,
  userFriendsCache,
  cacheUserFriends,
  getDevicePushTokens,
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
const { FRIENDS_LIMIT, NOTIFICATION_MESSAGES } = require("../Constant");
const Router = express.Router();
const { autoSignin } = require("./auth");
const RESPONSE_MESSAGES = require("../utils/responses");
const { default: Expo } = require("expo-server-sdk");
const { sendExpoPushNotifications } = require("../services/notification");

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

    if (friends.includes(targetId)) {
      return {
        success: false,
        status: 400,
        message: "You're already friends with this user",
      };
    }

    if (friends.length > FRIENDS_LIMIT) {
      return RESPONSE_MESSAGES.friendsLimitReached();
    }

    const friendship_id = generateRandomId(10);
    const date = Math.floor(Date.now() / 1000);

    //user_id = me (one who sent), friend_id = other user (one who is receiving)
    const friendRequest = {
      friendship_id,
      user_id: userId,
      friend_id: targetId,
      date,
    };

    const notification = {
      ...friendRequest,
      notification_id: friendship_id,
      userinfo: userInfo,
      type: "friend_request",
      message: NOTIFICATION_MESSAGES.friendRequest(userInfo.name),
    };

    const myNotification = {
      ...friendRequest,
      notification_id: friendship_id,
      userinfo: targetInfo,
      type: "friend_request_sent",
    };

    await connection.query(`INSERT INTO friends SET ?`, [friendRequest]);

    mainIo.to(targetId).emit("notification", notification);

    mainIo.to(userId).emit("notification", myNotification);

    //since there are conditions where friends are filtered, getting device tokens is not used on promiss.all
    const pushTokens = await getDevicePushTokens(connection, targetId);
    const pushMessages = [];

    console.log("push tokens", pushTokens);

    pushTokens.map((token) => {
      console.log(Expo.isExpoPushToken(token));
      if (!Expo.isExpoPushToken(token)) return;
      pushMessages.push({
        to: token,
        sound: "default",
        title: `New Friend Request from ${userInfo.name}`,
        body: notification.message.title,
        data: {
          type: "friend_request",
          url: `/notifications/notifications`,
        },
      });
    });

    sendExpoPushNotifications(pushMessages);

    return {
      success: true,
      status: 200,
      message: `Sent friend request to ${targetInfo.name}!`,
    };
  } catch (err) {
    console.log(err);
    if (err?.code === "ER_DUP_ENTRY") {
      return {
        success: false,
        status: 400,
        message: `You've already sent a request to this user`,
        error: { reason: "You've already sent a request to this user" },
      };
    }
    return RESPONSE_MESSAGES.error();
  }
}

async function replyFriendRequest({
  notificationId,
  userId,
  accepted,
  createChat = true,
}) {
  try {
    const connection = pool.promise();

    const [userInfo, friends, [[friendRequest]]] = await Promise.all([
      userCache(connection, userId),
      userFriendsCache(connection, userId),
      connection.query(
        `
        SELECT
        u.name as target_name,
        f.user_id as target_user_id
        FROM friends f
        LEFT JOIN users u ON u.user_id = f.user_id
        WHERE f.friendship_id = ? AND f.friend_id = ? AND status = "pending"
      `,
        [notificationId, userId]
      ),
    ]);

    if (!userInfo) {
      const response = RESPONSE_MESSAGES.noUser();
      return response;
    }

    if (!friendRequest) {
      const response = RESPONSE_MESSAGES.expiredRequest();
      return response;
    }

    const targetId = friendRequest.target_user_id;
    const targetName = friendRequest.target_name;

    if (!accepted) {
      await connection.query(
        `DELETE FROM friends WHERE friendship_id = ? AND friend_id = ?`,
        [notificationId, userId]
      );
      return {
        success: true,
        status: 200,
        message: "Declined friend request!",
      };
    }

    if (friends.length >= FRIENDS_LIMIT) {
      const response = RESPONSE_MESSAGES.friendsLimitReached();
      return response;
    }

    const date = Math.floor(Date.now() / 1000);

    const friend = {
      date,
      status: "accepted",
    };

    await connection.query(
      `UPDATE friends SET ? WHERE friendship_id = ? AND friend_id = ?`,
      [friend, notificationId, userId]
    );

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
      const chatroomName = userInfo.name + ", " + targetName;
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

      roomInfo.members = [userId, targetId];
      roomInfo.lastMsg = null;
      roomInfo.lastRead = null;
      roomInfo.unreads = 0;

      mainIo
        .to([targetId, userId])
        .emit("new-chatroom", { chatroom: roomInfo });
      mainIo.in([targetId, userId]).socketsJoin(`chatroom:${chatroom_id}`);
    }

    const notification_id = generateRandomId(10);
    const notification = {
      from_user_id: userId,
      user_id: targetId,
      notification_id,
      sent_at: date,
      type: "friend_request_accepted",
      related_id: userId,
    };

    await connection.query(`INSERT INTO notifications SET ?`, [notification]);

    notification.userinfo = userInfo;
    notification.message = NOTIFICATION_MESSAGES.friendRequestAccept(
      userInfo.name
    );
    mainIo.to(targetId).emit("notification", notification);

    friends.push(targetId);
    cacheUserFriends(userId, friends);

    //remove target's friends cache sunce it's mutated
    redisClient.del(`user:${targetId}:friends`);

    return {
      success: true,
      status: 200,
      message: `You and ${targetName} are now friends!`,
    };
  } catch (err) {
    console.log(err);
    return RESPONSE_MESSAGES.error();
  }
}

Router.get("/", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();

      const [friendsData] = await connection.query(
        `SELECT friend_id, user_id, friendship_id, date FROM friends WHERE (user_id = ? OR friend_id = ?) AND status = "accepted"`,
        [userId, userId]
      );

      const friends = friendsData.map((friend) => {
        const friend_id =
          friend.friend_id !== userId ? friend.friend_id : friend.user_id;
        return {
          friend_id,
          friendship_id: friend.friendship_id,
          date: friend.date,
        };
      });

      return res.send({ success: true, status: 200, data: { friends } });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

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
      const { notification_id: notificationId } = req.body;

      const isValidNotificationId = validateStrictString(
        notificationId,
        "user id",
        10
      );

      if (!isValidNotificationId.isValid) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidNotificationId.reason,
          error: { reason: isValidNotificationId.reason },
        });
      }

      const connection = pool.promise();

      const [result] = await connection.query(
        `
        DELETE FROM friends WHERE friendship_id = ? AND status = "pending" AND user_id = ?
      `,
        [notificationId, userId]
      );

      if (!result.affectedRows) {
        const response = RESPONSE_MESSAGES.expiredRequest();
        return res.send(response);
      }

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
      const { notification_id: notificationId, accepted } = req.body;

      const response = await replyFriendRequest({
        userId,
        notificationId,
        accepted,
      });

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

//delete friends
Router.delete("/friend", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { friend_id: friendId } = req.body;

      const isValidFriendId = validateStrictString(friendId, "friend id", 10);

      if (!isValidFriendId.isValid) {
        const response = RESPONSE_MESSAGES.validationError(isValidFriendId);
        return res.status(response.status).send(response);
      }

      const connection = pool.promise();
      const [result] = await connection.query(
        `DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`,
        [userId, friendId, friendId, userId]
      );

      if (!result.affectedRows) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: "Not a friend",
          error: { reason: "Not a friend" },
        });
      }

      //update cache values
      redisClient.srem(`user:${userId}:friends`, friendId);
      redisClient.srem(`user:${friendId}:friends`, userId);

      return res.send({
        success: true,
        message: "Deleted friend!",
        status: 200,
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

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
        return res.status(200).send({ success: true, data: { users } });
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
