const { server, sessionMiddleWare } = require("./app");
const cron = require('node-cron');
const pool = require("./model/pool");
const redisClient = require("./model/redis");
const Peer = require("simple-peer");
const { generateRandomId } = require("./tool");
const { lastMsgCache, groupCache, subjectsCache, activeSubjectCache, timerCache } = require("./services/redisLoader");


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
      const groups = await groupCache(userId);
      const groupRooms = await Promise.all(groups.map(async (group) => {
        let chatRooms = await redisClient.sMembers(`group:${group}:rooms`);
        chatRooms = chatRooms.map(room => {
          room = JSON.parse(room);
          room.status = -1;
          socket.join(room.id);
          return room;
        });
        return { groupId: group, rooms: chatRooms };
      }));
      socket.join(groups)
      io.to(socket.id).emit('joinMyGroups', groupRooms);

      //handle cache
      lastMsgCache();
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
    console.log(socket.userId)
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

  socket.on("sendMsg", async (groupId, roomId, msg) => {
    console.log(groupId, roomId, msg);
    const userId = socket.userId;
    if (isInGroupRoom(userId, groupId, roomId)) {
      const msgId = generateRandomId(10);
      const time = Math.floor(new Date().getTime() / 1000);
      const msgInfo = { u: userId, m: msg, i: msgId, t: time };
      redisClient.rPush(`room:${roomId}:chat`, JSON.stringify(msgInfo));
      io.to(roomId).emit('msgReceived', groupId, roomId, msgInfo);
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


  socket.on("bringChat", async (groupId, roomId) => {
    console.log(groupId, roomId);
    const userId = socket.userId;
    if (isInGroupRoom(userId, groupId, roomId)) {
      const chats = (await redisClient.lRange(`room:${roomId}:chat`, 0, -1));
      io.to(socket.id).emit("bringChat", { chats: chats });
    };
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
        const timelineSum = subject.timeline_sum;
        const start = now - subject.datum_point - timelineSum;
        console.log('timelinesum', timelineSum, start)
        const push = await redisClient.rPush(`user:${userId}:subject:${subjectId}`, `[${start},0]`);
        redisClient.hSet(`user:${userId}`, `ActiveSubject`, `${subjectId}:${now}`);
        //const timer = await redisClient.lRange(`user:${userId}:timer`, 0, -1);
        /* if (prevTimer) {
          const newTimer = JSON.parse(prevTimer);
          const datum = newTimer.datum;
          //remove old timeline
          const MAXSTORELEN = 24 * 60 * 60;
          const lastVal = newTimer.timeline[newTimer.timeline.length - 1];
          const missingTotal = Math.floor((lastVal ? lastVal[1] : 0) / (MAXSTORELEN * 2));
          const newDatum = datum + missingTotal * MAXSTORELEN;
          const start = now - newDatum;
          if (missingTotal) {
            newTimer.timeline.map(([start, stop]) => {
              const newStart = start - missingTotal * MAXSTORELEN;
              const newStop = stop - missingTotal * MAXSTORELEN;
              if (newStart >= 0 && newStop >= 0) {
                return [newStart, newStop];
              };
            });
          };

          newTimer.timeline.push([start, start]);
          newTimer.datum = newDatum;
          newTimer.study = 1;
          redisClient.hSet(`user:${userId}`, 'timerInfo', JSON.stringify(newTimer));
        } else {
          const newTimer = { datum: now, timeline: [[0, 0]], study: 1 };
          redisClient.hSet(`user:${userId}`, 'timerInfo', JSON.stringify(newTimer));
        }; */
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
      const stop = now - subject.datum_point - subject.timeline_sum;
      redisClient.rPush(`user:${userId}:subject:${subjectId}`, `[${start},${stop - start}]`);
      subject.timeline_sum += stop;
      redisClient.hSet(`user:${userId}`, `subject:${subjectId}`, JSON.stringify(subject));

      //total timer update
      //this is unix time in sec of active subject's start
      const activeSubjectStart = activeSubject.time;
      const timerInfo = await timerCache(userId);
      const timerStart = activeSubjectStart - timerInfo.dp - timerInfo.ts;
      const timerStop = now - timerInfo.dp - timerInfo.ts;
      timerInfo.ts += timerStop;
      redisClient.rPush(`user:${userId}:timer`, `[${timerStart},${timerStop - timerStop}]`);
      redisClient.hSet(`user:${userId}`, 'timerInfo', JSON.stringify(timerInfo));
      redisClient.hDel(`user:${userId}`, `ActiveSubject`);
    };
  });

  socket.on('offer', async (sdp, remoteSocketId) => {
    console.log('offer', remoteSocketId);
    io.to(remoteSocketId).emit('offer', sdp, socket.id, userId);
  })

  socket.on('answer', async (sdp, remoteSocketId, remoteUserId) => {
  });

  socket.on('candidate', async (sdp, remoteSocketId, remoteUserId) => {
    console.log('candidate', remoteSocketId)
    io.to(remoteSocketId).emit('offer', sdp, socket.id, userId);
  });

  //peer

  socket.on('joinPeerGroups', async () => {
    const groups = await groupCache(userId);
    groups.map(group => {
      const groupId = `peer:${group}`;
      socket.join(groupId);
    });
    console.log('join peergroups:', groups)
    io.to(groups.map(group => { return `peer:${group}` })).emit('onlinePeer', socket.id, userId);
  })
});

function handleTrackEvent(e, userId) {
  senderStream = e.streams[0];
  streams.set(userId, senderStream);
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

async function updateLastMsg(msgInfo) {
  try {
    //let userRoomStatus = await redisClient.hGet(`user:${userId}`, 'groups');
  } catch (err) {
    console.log(err);
  };
}

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

//require('./videoServer')

module.exports = { io, userIdToSocketIdMap };
require('./videoServer')