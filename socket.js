const { server, sessionMiddleWare } = require("./app");
const cron = require('node-cron');
const pool = require("./model/pool");
const redisClient = require("./model/redis");
const { generateRandomId } = require("./tool");
const { lastMsgCache, subjectsCache, activeSubjectCache, timerCache, chatRoomsCache, msgQueue, userCache, subjectCache, dmRoomMembersCache, groupMembersCache, zsetIncrAll } = require("./services/redisLoader");
const { DateTime } = require("luxon");
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:4000", "http://localhost:4001","https://localhost:3001", "https://localhost:3000", "http://localhost:3001", "http://localhost:3000", "https://super-meme-qx696prxr4j264qx-3001.app.github.dev", "https://super-meme-qx696prxr4j264qx-3000.app.github.dev", "http://localhost:3002"],
    credentials: true,
    methods: ["GET", "POST"],
  },
  allowEIO3: true
});

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleWare));

const mainIo = io.of('/');
mainIo.on('connection', (socket) => {
  let session;

  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test") {
    try {
      session = socket.request.session;
    } catch (err) {
      console.log(err);
    };
  } else {
    session = {
      cookie: {
        path: '/',
        _expires: null,
        originalMaxAge: null,
        httpOnly: true,
        secure: false
      },
      user_id: 'EoFObpf612',
      name: 't1',
      loggedin: true,
      userInfo: {
        userId: 'EoFObpf612',
        name: 't1',
        loggedin: true,
        email: 't1@t.t',
        myinfo: null,
        timeZone: 'America/Los_Angeles'
      }
    };
  };
  socket.userId = session.user_id;
  const userId = session.user_id;

  if (userId) {
    (async() => {
      const now = Math.floor(new Date().getTime() / 1000);
      redisClient.hSet(`user:${userId}`, `ActiveSubject`, `0:${now}`);
      socket.join(userId);
      const userInfo = await userCache(userId);
      if (!userInfo) return;
  
      const { friends } = userInfo;
      if (friends.length) {
        io.to(friends).emit(`studying:${userId}`, {id: '0'});
      };
    })();
  }


  socket.on('joinMyGroups', async () => {
    try {
      const chatRooms = await chatRoomsCache(userId);
      const chatRoomsId = chatRooms.map(chatRoom => {
        console.log('join', chatRoom.id);
        return `chat:${chatRoom.id}`;
      });
      socket.join(chatRoomsId);
    } catch (err) {
      console.log(err);
    };
  });

  socket.on('joinChatRoom', async (roomId) => {
    try {
      socket.join(`chat:${roomId}`);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on('onlineMembers', () => {
    /* const onlineMembers = io.engine.clientsCount;
    io.emit() */
    /* const onlineMembers = Object.keys(socket.sockets).length;
    io.emit({success: true, totalLiveMembers: onlineMembers});
    console.log(onlineMembers); */
  });

  socket.on("disconnect", async (reason) => {
    const userInfo = await userCache(userId);

    if (!userInfo) {
      redisClient.hDel(`user:${userId}`, `ActiveSubject`);
      return;
    };

    const { groups, friends } = userInfo;

    const activeSubject = await activeSubjectCache(userId);
    if (!activeSubject) {
      if (groups.length) {
        io.to(groups).emit(`stopStudying:${userId}`, {status: 'disconnect'});
      };
      if (friends.length) {
        io.to(friends).emit(`stopStudying:${userId}`, {status: 'disconnect'});
      };
      return;
    };
    redisClient.hDel(`user:${userId}`, `ActiveSubject`);

    const now = Math.floor(new Date().getTime() / 1000);
    /* const subjects = await subjectsCache(userId);
    const subject = subjects.find(subjectInfo => subjectInfo.id === subjectId); */
    const subjectId = activeSubject.id;
    const subject = await subjectCache(userId, subjectId);

    if (!subject) return;

    const { datum_point, timeline_sum } = subject;

    const duration = now - datum_point - timeline_sum;
    subject.timeline_sum += duration;

    if (groups.length) {
      io.to(groups).emit(`stopStudying:${userId}`, {status: 'disconnect', duration});
    };
    if (friends.length) {
      io.to(friends).emit(`stopStudying:${userId}`, {status: 'disconnect', duration});
    };
    
    redisClient.hSet(`user:${userId}:subjects`, subjectId, JSON.stringify(subject));
    //redisClient.incrBy(`user:${userId}:dayTotal`, duration);
    //zsetIncrAll(`user:${userId}:dayTotal`, duration);

    const activity = JSON.parse(await redisClient.rPop(`user:${userId}:subject:${subjectId}`));

    if (activity) {
      const start = activity[0];
      redisClient.rPush(`user:${userId}:subject:${subjectId}`, `[${start},${duration}]`);
    };
    extensionIo.to(userId).emit("studying", { studying: false });
    //total timer update
    //this is unix time in sec of active subject's start
    /* const activeSubjectStart = activeSubject.time;
    const timerInfo = await timerCache(userId, now);
    const {dp, ts} = timerInfo;
    const timerStart = activeSubjectStart - dp - ts;
    const totalTimerDuration = now - dp - ts;
    timerInfo.ts += totalTimerDuration;
    redisClient.rPush(`user:${userId}:timer`, `[${timerStart},${totalTimerDuration}]`);
    redisClient.hSet(`user:${userId}`, 'timerInfo', JSON.stringify(timerInfo)); */
    for (let i = -12; i < 12; i++) {
      redisClient.zIncrBy(`user:${userId}:dayTotal`, duration, i.toString());
    };
  });

  //chat

  socket.on("sendMsg", async (roomId, msg) => {
    const isIn = await isInChatRoom(userId, roomId);
    if (isIn) {
      const msgId = generateRandomId(6);
      const time = Math.floor(new Date().getTime() / (1000 * 60));
      const msgInfo = { u: userId, m: msg, i: msgId, t: time };
      msgQueue(roomId, msgInfo);
      io.to(`chat:${roomId}`).emit('msgReceived', roomId, msgInfo);
      const now = Math.floor(new Date().getTime() / 1000 / 60);
      redisClient.hSet(`user:${userId}:chats`, roomId, `${msgId}:${now}`);
    };
  });

  //webcam
  socket.on("camOn", async () => {
    const userId = socket.userId;
    let userGroups = await redisClient.hGet(`user:${userId}`, 'groups');
    if (userGroups) {
      userGroups = userGroups.split(',');
      if (userGroups.length) {
        redisClient.hSet(`user:${userId}`, 'groups');
      }
    }
  });

  socket.on("start", async (subjectId) => {
    try {
      /* const subjects = await subjectsCache(userId);
      const groups = await groupCache(userId);
      const subject = subjects.find(subjectInfo => subjectInfo.id === subjectId); */
      const subject = await subjectCache(userId, subjectId);
      const userInfo = await userCache(userId);
      const now = Math.floor(new Date().getTime() / 1000);
      if (!subject || !userInfo) return;
      const { groups, friends } = userInfo;
      if (groups.length) {
        mainIo.to(groups).emit(`studying:${userId}`, subject);
      };
      if (friends.length) {
        io.to(friends).emit(`studying:${userId}`, subject);
      };
      const { timeline_sum, datum_point, id } = subject;
      const start = now - datum_point - timeline_sum;
      redisClient.rPush(`user:${userId}:subject:${id}`, `[${start},0]`);
      redisClient.hSet(`user:${userId}`, `ActiveSubject`, `${id}:${now}`);
      subject.timeline_sum += start;
      redisClient.hSet(`user:${userId}:subjects`, id, JSON.stringify(subject));
      extensionIo.to(userId).emit("studying", { studying: true });
      //total timer
      /* const timerInfo = await timerCache(userId, now);
      const {dp, ts} = timerInfo;
      const totalTimerStart = now - dp - ts;
      timerInfo.ts += totalTimerStart;
      redisClient.hSet(`user:${userId}`, 'timerInfo', JSON.stringify(timerInfo)); */
    } catch (err) {
      console.log(err);
    };
  });


  socket.on("stop", async (subjectId) => {
    const activeSubject = await activeSubjectCache(userId);
    if (!activeSubject || !activeSubject.id === subjectId || activeSubject.id === '0') return;
    const now = Math.floor(new Date().getTime() / 1000);
    const subject = await subjectCache(userId, subjectId);
    const userInfo = await userCache(userId);
    if (!userInfo || !subject) return;

    const { datum_point, timeline_sum } = subject;

    const duration = now - datum_point - timeline_sum;
    subject.timeline_sum += duration;
    redisClient.hSet(`user:${userId}:subjects`, subjectId, JSON.stringify(subject));
    //redisClient.incrBy(`user:${userId}:dayTotal`, duration);
    //zsetIncrAll(`user:${userId}:dayTotal`, duration);

    const { groups, friends } = userInfo;

    if (groups.length) {
      io.to(groups).emit(`stopStudying:${userId}`, {status: 'rest', duration});
    };
    if (friends.length) {
      io.to(friends).emit(`stopStudying:${userId}`, {status: 'rest', duration});
    };

    const activity = JSON.parse(await redisClient.rPop(`user:${userId}:subject:${subjectId}`));

    if (activity) {
      const start = activity[0];
      redisClient.rPush(`user:${userId}:subject:${subjectId}`, `[${start},${duration}]`);
    };
    extensionIo.to(userId).emit("studying", { studying: false });
    //total timer update
    //this is unix time in sec of active subject's start
    /* const activeSubjectStart = activeSubject.time;
    const timerInfo = await timerCache(userId, now);
    const {dp, ts} = timerInfo;
    const timerStart = activeSubjectStart - dp - ts;
    const totalTimerDuration = now - dp - ts;
    timerInfo.ts += totalTimerDuration;
    redisClient.rPush(`user:${userId}:timer`, `[${timerStart},${totalTimerDuration}]`);
    redisClient.hSet(`user:${userId}`, 'timerInfo', JSON.stringify(timerInfo)); */
    redisClient.hSet(`user:${userId}`, `ActiveSubject`, `0:${now}`);
    for (let i = -12; i < 12; i++) {
      redisClient.zIncrBy(`user:${userId}:dayTotal`, duration, i.toString());
    };
  });

  socket.on("startDm", async (targetId) => {
    if (isUser(userId)) {

    } else { }
  });

  socket.on("changeGroup", async (groupId) => {
    const userInfo = await userCache(userId);
    if (!userInfo) return;
    const {groups, friends} = userInfo;

    if (!groups.includes(groupId)) return;
    groups.map(group => {
      if (group !== groupId) {
        socket.leave(group);
      };
    });
    socket.join(groupId);
    const now = DateTime.now().toSeconds().toFixed();
    redisClient.hSet(`user:${userId}`, `ActiveGroup`, JSON.stringify({ id: groupId, time: now }));
    if (!friends.length) return;
    const connection = pool.promise();
    const [[groupInfo]] = await connection.query("SELECT group_id, name, leader, visibility, explanation, date, members, max_members, tags, color, goal_hr, average_hr, likes, font FROM \`groups\` WHERE group_id = ?", [groupId]);
    if (!groupInfo) return;
    io.to(friends).emit(`activeGroup:${userId}`, { groupInfo, time: now });
  });

  socket.on('readMsg', async ({ roomId, type }) => {
    if (!roomId) return;
    //dm
    let members = [];
    if (!type) {
      members = await dmRoomMembersCache(roomId);
    } else {
      members = await groupMembersCache(roomId);
    };

    //user not member of the chatroom
    if (!members.includes(userId)) return;

    const [lastMsg] = await redisClient.lRange(`room:${roomId}:chats`, -1, -1);
    if (!lastMsg) return;
    //i ==  msg id
    const { i } = JSON.parse(lastMsg);
    const now = Math.floor(new Date().getTime() / 1000 / 60);
    redisClient.hSet(`user:${userId}:chats`, roomId, `${i}:${now}`);
  });

  socket.on("volumeChange", ({ id, volume }) => {
    if (!id || typeof volume !== "number") {
      return;
    };
    socket.to(userId).emit(`volumeChange`, { id, volume });
    extensionIo.to(userId).emit(`volumeChange`, { id, volume });
  })

  socket.on('exitSession', async () => {
    deActiveGroup(userId, socket);
  });

  socket.on('disconnect', async () => {
    deActiveGroup(userId, socket);
  });
});

const extensionIo = io.of("/extension");

extensionIo.on("connection", (socket) => {
  socket.on("auth", async ({ authId }) => {
    if (!authId) return;
    const userId = await redisClient.get(`extension:auth:${authId}`);
    //invalid auth id
    if (!userId) return;
    const userInfo = await userCache(userId);

    if (!userInfo) return;

    const dateTime = DateTime.now().setZone(userInfo.timezone);
    const score = Math.floor(dateTime.offset / 60) + 12;
    redisClient.zAdd(`extensionUsers`, [{ value: userId, score }]);
    socket.userId = userId;
    socket.join(userId);
    const activeSubject = await activeSubjectCache(userId);
    extensionIo.to(userId).emit("studying", { studying: activeSubject && activeSubject.id !== '0' ? true : false });
  });

  /*   socket.on("setting-update", async({d, target, value}) => {
      if (!socket.userId) return;
      extensionIo.to(socket.userId).emit("setting-updated", {d, target, value});
    });
  
    socket.on("setting-create", async({d, block, timer}) => {
      console.log(socket.userId, block, timer, 'created')
      if (!socket.userId) return;
      extensionIo.to(socket.userId).emit("setting-created", {d, block, timer});
    }); */

  socket.on("update-tabs", async ({ domain, duration }) => {
    if (!socket.userId || !domain || !duration) return;
    redisClient.zIncrBy(`user:${socket.userId}:tabs:timer`, duration, domain);
    redisClient.zIncrBy(`user:${socket.userId}:tabs:usage`, 1, domain);

  });

  socket.on("volumeChange", async ({ id, volume }) => {
    if (!socket.userId || !id) return;
    io.to(socket.userId).emit(`volumeChange`, { id, volume });
  })
})

async function deActiveGroup(userId, socket) {
  const userInfo = await userCache(userId);
  if (!userInfo) return;
  const {groups, friends} = userInfo; 
  groups.map(group => {
    socket.leave(group);
  });
  redisClient.hDel(`user:${userId}`, `ActiveGroup`);
  if (!friends.length) return;
  io.to(friends).emit(`deActiveGroup:${userId}`);
}

async function isUser(userId) {
  const connection = pool.promise();
  const [[userInfo]] = await connection.query(`SELECT user_id FROM users WHERE user_id = ?`, [userId]);
  return userInfo ? true : false;
};

async function isInChatRoom(userId, roomId) {
  try {
    const rooms = await chatRoomsCache(userId);
    const roomIndex = rooms.findIndex(room => { return room.id === roomId });
    return roomIndex === -1 ? false : true;
  } catch (err) {
    console.log(err);
  };
};

async function isInGroupRoom(userId, groupId, roomId) {
  try {
    let userGroups = await redisClient.hGet(`user:${userId}`, 'groups');
    if (!userGroups) {
      const connection = pool.promise();
      try {
        userGroups = await connection.query(`SELECT groups FROM users WHERE user_id = ?`, [userId]);
      } catch (err) {
        console.log(err);
      };
    };
    userGroups = userGroups.split(',');
    if (userGroups.includes(groupId)) {
      let rooms = await redisClient.sMembers(`group:${groupId}:rooms`);
      let roomInfo = rooms.find(room => {
        room = JSON.parse(room);
        return room.id === roomId;
      });
      if (roomInfo) {
        return true;
      }
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
};

cron.schedule('*/10 * * * * *', () => {
  const onlineMembers = io.engine.clientsCount;
  io.emit('onlineMembers', onlineMembers);

  const allRooms = io.sockets.adapter.rooms;
  for (const [groupId, socketIdsSet] of allRooms) {
    const users = [];
    for (const socketId of socketIdsSet) {
      const socket = io.sockets.sockets.get(socketId);
      if (socket && socket.userId) {
        if (!users.includes(socket.userId)) {
          users.push(socket.userId);
        };
      }
    };
    io.to(groupId).emit('groupOnlineMembers', groupId, users);
  };
});

module.exports = { io, mainIo, extensionIo };
//require('./videoServer')

//require('./SFUServer');