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
} = require("../services/redisLoader");
const { generateRandomId } = require("../utils/tool");
const { extensionIo, mainIo } = require("../sockets/io");
const pool = require("../model/pool");
const { MAX_STUDY_TIME, REDIS_EXP } = require("../Constant");

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

  if (userId) {
    (async () => {
      try {
        const now = Math.floor(new Date().getTime() / 1000);
        cacheActiveSubject(userId, { subject_id: "0", name: "break" }, now);
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

        mainIo
          .to([...friends, ...groups, userId])
          .emit(`studying`, { userId, subject: { subject_id: "0" } });

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
      console.log("disconnection");
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
        .emit(`studying`, { userId, subject });

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

    mainIo
      .to([...groups, ...friends, userId])
      .emit(`stopStudying`, { userId, status });

    if (!activeSubject || activeSubject.subject_id === "0") {
      return await redisClient.del(`user:${userId}:activeSubject`);
    }

    const activity = JSON.parse(
      await redisClient.rpop(
        `user:${userId}:subject:${activeSubject.subject_id}`
      )
    );

    extensionIo.to(userId).emit("stopStudying");

    if (!activity) return;

    const start = activity[0];

    const duration = now - start;

    console.log(duration);

    if (status === "disconnect") {
    } else {
      cacheActiveSubject(userId, { subject_id: "0", name: "break" }, now);
    }

    if (duration > MAX_STUDY_TIME) {
      console.log("max study exceeded: ", duration);
      return;
    }

    if (typeof duration !== "number") return;

    for (let i = -12; i < 12; i++) {
      redisClient.zincrby(`users:${i}:dayTotal`, duration, userId);
      redisClient.zincrby(`users:${i}:weekTotal`, duration, userId);
      redisClient.zincrby(`users:${i}:monthTotal`, duration, userId);
    }

    redisClient.rpush(
      `user:${userId}:subject:${activeSubject.subject_id}`,
      `[${start},${duration}]`
    );
  } catch (err) {
    console.log(err);
  }
}
