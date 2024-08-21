const { DateTime } = require("luxon");
const redisClient = require("../model/redis");
const {
  userCache,
  msgQueue,
  subjectCache,
  activeSubjectCache,
  chatroomMemberCache,
  cacheActiveSubject,
  cacheActiveGroup,
  userFriendsCache,
  userGroupsCache,
} = require("../services/redisLoader");
const { generateRandomId } = require("../Utils/tool");
const { extensionIo } = require("./extensionIo");
const { io } = require("./io");
const pool = require("../model/pool");
const { MAX_STUDY_TIME, REDIS_EXP } = require("../Constant");

const mainIo = io.of("/");
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
        cacheActiveSubject(userId, { subject_id: "0", name: "break", now });
        socket.join(userId);

        const connection = pool.promise();

        // Use Promise.all to run multiple promises in parallel
        const [userInfo, friends, chatrooms, groups] = await Promise.all([
          userCache(connection, userId),
          userFriendsCache(connection, userId),
          connection
            .query(
              `SELECT chatroom_id FROM chatroom_members WHERE user_id = ?`,
              [userId]
            )
            .then(([chatrooms]) => chatrooms),
          userGroupsCache(connection, userId),
        ]);

        if (!userInfo) return;

        if (friends.length) {
          mainIo.to(friends).emit(`studying:${userId}`, { id: "0" });
        }

        const chatroomIds = chatrooms.map(
          (chatroom) => "chatroom:" + chatroom.chatroom_id
        );
        const groupIds = groups.map((group) => "chatroom:" + group);

        socket.join([...chatroomIds, ...groupIds]);
      } catch (err) {
        console.log(err);
      }
    })();
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

      const [subject, userInfo] = await Promise.all([
        subjectCache(connection, userId, subjectId),
        userCache(connection, userId),
      ]);

      if (!subject || !userInfo) return;
      const { groups, friends } = userInfo;
      if (groups.length) {
        mainIo.to(groups).emit(`studying:${userId}`, subject);
      }
      if (friends.length) {
        mainIo.to(friends).emit(`studying:${userId}`, subject);
      }
      redisClient.rpush(`user:${userId}:subject:${subjectId}`, `[${now},0]`);
      cacheActiveSubject(userId, subject, now);
      extensionIo.to(userId).emit("studying", { studying: true });
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("stop", async (subjectId) => {
    try {
      const connection = pool.promise();

      stopStudying(connection, userId, "rest");
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("changeGroup", async (groupId) => {
    try {
      const userInfo = await userCache(connection, userId);
      if (!userInfo) return;
      const { groups, friends } = userInfo;

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

      const connection = pool.promise();
      const [[groupInfo]] = await connection.query(
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
      if (!groupInfo) return;
      mainIo
        .to(friends)
        .emit(`activeGroup:${userId}`, { groupInfo, time: now });
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

  socket.on("volumeChange", ({ id, volume }) => {
    if (!id || typeof volume !== "number") {
      return;
    }
    mainIo.to(userId).emit(`volumeChange`, { id, volume });
    extensionIo.to(userId).emit(`volumeChange`, { id, volume });
  });

  //messages

  socket.join("chat/join", async () => {
    try {
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("chat/send", async (roomId, message) => {
    try {
      const connection = pool.promise();
      const isMember = await chatroomMemberCache(roomId, userId);
      if (!isMember || !message.length) return;

      const t = Math.floor(new Date().getTime() / 1000);
      const i = generateRandomId(8);
      const newMsg = {
        m: message,
        u: userId,
        t,
        i,
      };
      msgQueue(connection, roomId, newMsg);
      newMsg.r = roomId;
      mainIo.to(`chatroom:${roomId}`).emit("chat/message", newMsg);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("chat/read", async (messageId) => {
    try {
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
    mainIo.to(friends).emit(`deActiveGroup:${userId}`);
  } catch (err) {
    console.log(err);
  }
}

async function stopStudying(connection, userId, mode) {
  try {
    const now = Math.floor(new Date().getTime() / 1000);

    const [userInfo, groups, friends, activeSubject] = await Promise.all([
      userCache(connection, userId),
      userGroupsCache(connection, userId),
      userFriendsCache(connection, userId),
      activeSubjectCache(userId),
    ]);

    if (!userInfo) return;

    if (groups.length) {
      mainIo.to(groups).emit(`stopStudying:${userId}`, { status: mode });
    }
    if (friends.length) {
      mainIo.to(friends).emit(`stopStudying:${userId}`, { status: mode });
    }

    if (!activeSubject || activeSubject.id === "0") {
      return await redisClient.del(`user:${userId}:activeSubject`);
    }

    const activity = JSON.parse(
      await redisClient.rpop(`user:${userId}:subject:${activeSubject.id}`)
    );

    extensionIo.to(userId).emit("studying", { studying: false });

    if (!activity) return;

    const start = activity[0];

    const duration = now - start;

    console.log(duration);

    if (mode === "disconnect") {
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
      `user:${userId}:subject:${activeSubject.id}`,
      `[${start},${duration}]`
    );
  } catch (err) {
    console.log(err);
  }
}

module.exports = { mainIo };
