const { DateTime } = require("luxon");
const redisClient = require("../model/redis");
const {
  userCache,
  subjectCache,
  activeSubjectCache,
  cacheActiveSubject,
  cacheActiveGroup,
  userFriendsCache,
  userGroupsCache,
  chatroomMembersCache,
  getDevicePushTokens,
} = require("../services/redisLoader");
const { generateRandomId } = require("../utils/tool");
const { extensionIo, mainIo } = require("../sockets/io");
const pool = require("../model/pool");
const { MAX_STUDY_TIME, REDIS_EXP } = require("../Constant");
const expo = require("../expoInstance");
const { default: Expo } = require("expo-server-sdk");

mainIo.on("connection", (socket) => {
  let session;

  if (
    process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "test"
  ) {
    try {
      session = socket.request.session;
    } catch (err) {
      console.log(err);
    }
  } else {
    session = {
      cookie: {
        path: "/",
        _expires: null,
        originalMaxAge: null,
        httpOnly: true,
        secure: false,
      },
      user_id: process.env.TESTER_ID,
    };
  }
  const userId = session.user_id;
  console.log("socket joined");

  if (userId) {
    (async () => {
      try {
        //join my socket server
        socket.join(userId);

        const connection = pool.promise();

        // Use Promise.all to run multiple promises in parallel
        const [friends, chatrooms, groups] = await Promise.all([
          userFriendsCache(connection, userId),
          connection
            .query(
              `SELECT chatroom_id FROM chatroom_members WHERE user_id = ?`,
              [userId]
            )
            .then(([chatrooms]) => chatrooms),
          userGroupsCache(connection, userId),
        ]);

        const activeSubject = await activeSubjectCache(userId);
        if (!activeSubject) {
          const now = Math.floor(new Date().getTime() / 1000);
          cacheActiveSubject(userId, { subject_id: "0", name: "break" }, now);
          mainIo.to([...friends, ...groups, userId]).emit("studying", {
            userId,
            subject: { subject_id: "0", time: now },
          });
        }

        const chatroomIds = chatrooms.map(
          (chatroom) => "chatroom:" + chatroom.chatroom_id
        );
        const groupIds = groups.map((group) => "chatroom:" + group);

        //join my chatrooms
        socket.join([...chatroomIds, ...groupIds]);
      } catch (err) {
        console.log(err);
      }
    })();
  } else {
    return;
  }

  socket.on("disconnect", async (reason) => {
    try {
      const connection = pool.promise();
      const device = socket.handshake.query?.device;
      console.log("disconnection", device);

      //won't terminate if it's mobile
      if (device === "mobile") return;

      stopStudying(connection, userId, "disconnect");
      deActiveGroup(connection, userId, socket);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("start", async (subjectId) => {
    try {
      const now = Math.floor(new Date().getTime() / 1000);

      const connection = pool.promise();

      const [subject, groups, friends] = await Promise.all([
        subjectCache(connection, userId, subjectId),
        userGroupsCache(connection, userId),
        userFriendsCache(connection, userId),
      ]);

      if (!subject) return;

      mainIo
        .to([...friends, ...groups, userId])
        .emit("studying", { userId, subject: { ...subject, time: now } });

      redisClient.rpush(`user:${userId}:subject:${subjectId}`, `[${now},0]`);
      cacheActiveSubject(userId, subject, now);
      extensionIo.to(userId).emit("studying");
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("stop", async () => {
    try {
      const connection = pool.promise();

      stopStudying(connection, userId, "rest");
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("changeGroup", async (groupId) => {
    try {
      const connection = pool.promise();
      const [friends, groups] = await Promise.all([
        userFriendsCache(connection, userId),
        userGroupsCache(connection, userId),
      ]);
      if (groupId === null) {
        groups.map((group) => {
          socket.leave(group);
        });
        redisClient.del(`user:${userId}:activeGroup`);
        if (friends.length) {
          mainIo.to(friends).emit(`deActiveGroup`, { userId });
        }
        return;
      }
      if (!groups.includes(groupId)) return;
      groups.map((group) => {
        if (group !== groupId) {
          socket.leave(group);
        }
      });
      socket.join(groupId);
      const now = DateTime.now().toSeconds().toFixed();
      cacheActiveGroup(userId, groupId, now);

      if (!friends.length) return;

      const [[group]] = await connection.query(
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
        WHERE g.group_id = ?
        GROUP BY g.group_id
        `,
        [groupId]
      );
      if (!group) return;

      group.members = group.members ? group.members.split(",") : [];
      group.likes = group.likes ? group.likes.split(",") : [];
      group.tags = group.tags ? JSON.parse(group.tags) : [];

      mainIo.to(friends).emit(`activeGroup`, { userId, group });
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("exitSession", async () => {
    try {
      const connection = pool.promise();
      deActiveGroup(connection, userId, socket);
      stopStudying(connection, userId, "rest");
    } catch (err) {
      console.log(err);
    }
  });

  //messages

  socket.on("chat/send", async (roomId, message) => {
    try {
      if (!roomId || !message) return;

      const connection = pool.promise();
      const members = await chatroomMembersCache(connection, roomId);

      if (!members.includes(userId) || !message.length) return;

      const sent_at = Math.floor(new Date().getTime() / 1000);
      const message_id = generateRandomId(8);
      const newMsg = {
        message,
        user_id: userId,
        sent_at,
        message_id,
      };

      redisClient.rpush(`chatroom:${roomId}:messages`, JSON.stringify(newMsg));

      newMsg.chatroom_id = roomId;
      connection.query(
        `
        INSERT INTO chatroom_messages SET ?
        `,
        newMsg
      );

      mainIo.to(`chatroom:${roomId}`).emit("chat/message", { message: newMsg });

      /*
      add unread messages to chatroom members who is not me.
      room:ROOMID:last_read_message stores last message's (current sent message) id
      room:ROOMID:unreads stores total number of unread messages
      */
      members
        .filter((member) => member !== userId)
        .map((member) => {
          redisClient.hincrby(
            `user:${member}:chatrooms`,
            `room:${roomId}:unreads`,
            1
          );
          redisClient.expire(
            `user:${member}:chatrooms`,
            REDIS_EXP.USER_CHAT_READS
          );
        });

      /**
       * for me, set last_read_message id as same as other members, but hset room:ROOMID:unreads as 0 instead of hincryby.
       */
      redisClient.hset(
        `user:${userId}:chatrooms`,
        `room:${roomId}:last_read_message`,
        message_id
      );
      redisClient.hset(`user:${userId}:chatrooms`, `room:${roomId}:unreads`, 0);
      redisClient.expire(`user:${userId}:chatrooms`, REDIS_EXP.USER_CHAT_READS);

      const pushMessages = [];
      await Promise.all(
        members.map(async (member) => {
          const tokens = await getDevicePushTokens(connection, member);
          tokens.map((token) => {
            console.log(Expo.isExpoPushToken(token));
            if (!Expo.isExpoPushToken(token)) return;
            pushMessages.push({
              to: token,
              sound: "default",
              body: "This is a test notification",
              data: { withSome: "data" },
            });
          });
        })
      );

      console.log(pushMessages);

      // The Expo push notification service accepts batches of notifications so
      // that you don't need to send 1000 requests to send 1000 notifications. We
      // recommend you batch your notifications to reduce the number of requests
      // and to compress them (notifications with similar content will get
      // compressed).
      const chunks = expo.chunkPushNotifications(pushMessages);
      const tickets = [];
      (async () => {
        // Send the chunks to the Expo push notification service. There are
        // different strategies you could use. A simple one is to send one chunk at a
        // time, which nicely spreads the load out over time:
        for (let chunk of chunks) {
          try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(ticketChunk);
            tickets.push(...ticketChunk);
            // NOTE: If a ticket contains an error code in ticket.details.error, you
            // must handle it appropriately. The error codes are listed in the Expo
            // documentation:
            // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
          } catch (error) {
            console.error(error);
          }
        }
      })();
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("chat/read", async (roomId) => {
    try {
      if (!userId || !roomId) return;

      const chatroomMembers = await chatroomMembersCache(null, roomId);

      if (!chatroomMembers.includes(userId)) {
        return;
      }

      const [lastMsg] = (
        await redisClient.lrange(`chatroom:${roomId}:messages`, -1, -1)
      ).map(JSON.parse);

      console.log("read", lastMsg?.message_id, roomId);

      if (lastMsg) {
        redisClient.hset(
          `user:${userId}:chatrooms`,
          `room:${roomId}:last_read_message`,
          lastMsg.message_id
        );
      }

      redisClient.hset(`user:${userId}:chatrooms`, `room:${roomId}:unreads`, 0);
    } catch (err) {
      console.log(err);
    }
  });
});

async function deActiveGroup(connection, userId, socket) {
  try {
    const [groups, friends] = await Promise.all([
      userGroupsCache(connection, userId),
      userFriendsCache(connection, userId),
    ]);
    groups.map((group) => {
      socket.leave(group);
    });
    redisClient.del(`user:${userId}:activeGroup`);
    console.log("gdddd");
    if (!friends.length) return;
    mainIo.to(friends).emit(`deActiveGroup`, { userId });
  } catch (err) {
    console.log(err);
  }
}

async function stopStudying(connection, userId, status) {
  try {
    const now = Math.floor(new Date().getTime() / 1000);

    const [userInfo, groups, friends, activeSubject] = await Promise.all([
      userCache(connection, userId),
      userGroupsCache(connection, userId),
      userFriendsCache(connection, userId),
      activeSubjectCache(userId),
    ]);

    if (!userInfo) return;

    const subject =
      status !== "disconnect"
        ? { subject_id: "0", name: "break", time: now }
        : null;

    extensionIo.to(userId).emit("stopStudying");

    if (subject) {
      cacheActiveSubject(userId, subject, now);
    } else {
      redisClient.del(`user:${userId}:activeSubject`);
    }

    if (!activeSubject || activeSubject.subject_id === "0") {
      emitStopStudying({ groups, friends, userId, subject, activeSubject });
      return;
    }

    const activity = JSON.parse(
      await redisClient.rpop(
        `user:${userId}:subject:${activeSubject.subject_id}`
      )
    );

    if (!activity) {
      emitStopStudying({ groups, friends, userId, subject, activeSubject });
      return;
    }

    const start = activity[0];

    const duration = now - start;

    console.log(duration);

    if (duration > MAX_STUDY_TIME || typeof duration !== "number") {
      emitStopStudying({ groups, friends, userId, subject, activeSubject });
      return;
    }
    emitStopStudying({
      groups,
      friends,
      userId,
      subject,
      duration,
      activeSubject,
    });

    redisClient.rpush(
      `user:${userId}:subject:${activeSubject.subject_id}`,
      `[${start},${duration}]`
    );

    for (let i = -12; i < 12; i++) {
      redisClient.zincrby(`users:${i}:dayTotal`, duration, userId);
      redisClient.zincrby(`users:${i}:weekTotal`, duration, userId);
      redisClient.zincrby(`users:${i}:monthTotal`, duration, userId);
    }
  } catch (err) {
    console.log(err);
  }
}

async function emitStopStudying({
  groups,
  friends,
  userId,
  subject,
  duration = 0,
  activeSubject,
}) {
  try {
    const receivers = [...groups, ...friends, userId];

    mainIo.to(receivers).emit("stopStudying", {
      userId,
      subject,
      duration,
      stopped_subject: activeSubject,
    });
  } catch (err) {
    console.log(err);
  }
}
