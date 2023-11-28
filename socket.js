const { server, sessionMiddleWare } = require("./app");
const cron = require('node-cron');
const pool = require("./model/pool");
const redisClient = require("./model/redis");
const { generateRandomId } = require("./tool");
const { lastMsgCache, groupCache, subjectsCache, activeSubjectCache, timerCache, chatRoomsCache, msgQueue } = require("./services/redisLoader");


const io = require('socket.io')(server, {
  cors: {
    origin: ["https://localhost:3001", "https://localhost:3000", "http://localhost:3001", "http://localhost:3000", "https://super-meme-qx696prxr4j264qx-3001.app.github.dev", "https://super-meme-qx696prxr4j264qx-3000.app.github.dev"],
    credentials: true,
    methods: ["GET", "POST"],
  },
  allowEIO3: true
});

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleWare));

const userIdToSocketIdMap = new Map();
let senderStream;
const streams = new Map();
const connection = io.of('/');
connection.on('connection', (socket) => {
  let session;

  if (process.env.NODE_ENV === "production") {
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
      user_id: 'EoFObpf612bdJKt',
      name: 't1',
      loggedin: true,
      userInfo: {
        userId: 'EoFObpf612bdJKt',
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

  userIdToSocketIdMap.set(socket.userId, socket.id);
  socket.join(socket.userId);

  socket.on('joinMyGroups', async () => {
    try {
      const chatRooms = await chatRoomsCache(userId);
      const chatRoomsId = chatRooms.map(chatRoom => {
        return chatRoom.id;
      });
      socket.join(chatRoomsId);
    } catch (err) {
      console.log(err);
    };
  });

  socket.on('myGroupsOnline', async () => {

    const connection = pool.promise();

    try {
      const [[userInfo]] = await connection.query(`SELECT groups from users where user_id = ?`, [session.user_id]);
      if (userInfo) {
        const myGroups = userInfo.groups.split(',');
        myGroups.map(group => {
          const socketsInRoom = io.sockets.in(group).sockets;
          //console.log(socketsInRoom);
        });
      };
    } catch (err) {
      console.log(err);
    } finally {
      connection.releaseConnection();
    }
  });

  socket.on('onlineMembers', () => {
    /* const onlineMembers = io.engine.clientsCount;
    io.emit() */
    /* const onlineMembers = Object.keys(socket.sockets).length;
    io.emit({success: true, totalLiveMembers: onlineMembers});
    console.log(onlineMembers); */
  });

  socket.on("disconnect", (reason) => {
    let socketIds = userIdToSocketIdMap.get(socket.userId);
    userIdToSocketIdMap.delete(socketIds);
    /* try {
      if (socketIds) {
        socketIds = socketIds.split(',');
        if (socketIds.length > 1) {
          socketIds.pop(socket.id);
        } else {
          userIdToSocketIdMap.delete(socket.userId);
        }
      }
    } catch (err) {
      console.log(err);
    }; */
  });

  //chat

  socket.on("sendMsg", async (roomId, msg) => {
    const isIn = await isInChatRoom(userId, roomId);
    console.log(isIn)
    if (isIn) {
      const msgId = generateRandomId(6);
      const time = Math.floor(new Date().getTime() / (1000 * 60));
      const msgInfo = { u: userId, m: msg, i: msgId, t: time };
      msgQueue(roomId, msgInfo);
      io.to(roomId).emit('msgReceived', roomId, msgInfo);
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
      const subjects = await subjectsCache(userId);
      const groups = await groupCache(userId);
      const subject = subjects.find(subjectInfo => subjectInfo.id === subjectId);
      if (subject) {
        if (groups.length) {
          io.to(groups).emit('studying', userId, groups);
        }
        const now = Math.floor(new Date().getTime() / 1000);
        const {timeline_sum, datum_point, id} = subject;
        const start = now - datum_point - timeline_sum;
        console.log('timelinesum', timeline_sum, start)
        const push = await redisClient.rPush(`user:${userId}:subject:${id}`, `[${start},0]`);
        redisClient.hSet(`user:${userId}`, `ActiveSubject`, `${id}:${now}`);
        subject.timeline_sum += start;
        redisClient.hSet(`user:${userId}:subjects`, id, JSON.stringify(subject));

        //total timer
        /* const timerInfo = await timerCache(userId, now);
        const {dp, ts} = timerInfo;
        const totalTimerStart = now - dp - ts;
        timerInfo.ts += totalTimerStart;
        redisClient.hSet(`user:${userId}`, 'timerInfo', JSON.stringify(timerInfo)); */
      }
    } catch (err) {
      console.log(err);
    };
  });


  socket.on("stop", async (subjectId) => {
    const groups = await groupCache(userId);
    const activeSubject = await activeSubjectCache(userId);
    const subjects = await subjectsCache(userId);
    const subject = subjects.find(subjectInfo => subjectInfo.id === subjectId);
    if (activeSubject.id === subjectId && subject) {
      if (groups.length) {
        io.to(groups).emit('stopStudying', userId, groups);
      };
      const activity = JSON.parse(await redisClient.rPop(`user:${userId}:subject:${subjectId}`));
      const now = Math.floor(new Date().getTime() / 1000);
      const start = activity[0];
      const {datum_point, timeline_sum} = subject;
      const duration = now - datum_point - timeline_sum;
      redisClient.rPush(`user:${userId}:subject:${subjectId}`, `[${start},${duration}]`);
      subject.timeline_sum += duration;
      redisClient.hSet(`user:${userId}:subjects`, subjectId, JSON.stringify(subject));

      //total timer update
      redisClient.incrBy(`user:${userId}:dayTotal`, duration);
      //this is unix time in sec of active subject's start
      /* const activeSubjectStart = activeSubject.time;
      const timerInfo = await timerCache(userId, now);
      const {dp, ts} = timerInfo;
      const timerStart = activeSubjectStart - dp - ts;
      const totalTimerDuration = now - dp - ts;
      timerInfo.ts += totalTimerDuration;
      redisClient.rPush(`user:${userId}:timer`, `[${timerStart},${totalTimerDuration}]`);
      redisClient.hSet(`user:${userId}`, 'timerInfo', JSON.stringify(timerInfo)); */
      redisClient.hDel(`user:${userId}`, `ActiveSubject`);
    };
  });

  socket.on("startDm", async(targetId) => {
    if (isUser(userId)) {

    } else {}
  })
});

async function isUser(userId) {
  const connection = pool.promise();
  const [[userInfo]] = await connection.query(`SELECT user_id FROM users WHERE user_id = ?`, [userId]);
  return userInfo ? true : false;
};

async function isInChatRoom(userId, roomId) {
  try {
    const rooms = await chatRoomsCache(userId);
    const roomIndex = rooms.findIndex(room => {return room.id === roomId});
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

module.exports = { io, userIdToSocketIdMap, connection };
//require('./videoServer')