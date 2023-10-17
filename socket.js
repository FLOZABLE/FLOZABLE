const { server, sessionMiddleWare } = require("./app");
const cron = require('node-cron');
const pool = require("./model/pool");
const redisClient = require("./model/redis");
const Peer = require("simple-peer");
const { generateRandomId } = require("./tool");
const { lastMsgCache, groupCache } = require("./services/redisLoader");


const io = require('socket.io')(server, {
  cors: {
    origin: ["http://localhost:3001", "http://localhost:3000", "https://super-meme-qx696prxr4j264qx-3001.app.github.dev", "https://super-meme-qx696prxr4j264qx-3000.app.github.dev"],
    credentials: true,
    methods: ["GET", "POST"],
  },
  allowEIO3: true
});

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleWare));

const userIdToSocketIdMap = new Map();

io.on('connection', (socket) => {
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
          console.log(socketsInRoom);
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

  //peer
  socket.on("joinPeerGroup", async() => {
    const groups = await groupCache(userId);
    groups.map(group => {
      const groupId = `peer:${group}`;
      socket.join(groupId);
    });
  });

  socket.on("offer", async(offer) => {
    const groups = await groupCache(userId);
    if (groups.length) {
      io.to(groups).emit("offer", offer, userId);
    };
  })
});

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

module.exports = { io, userIdToSocketIdMap };