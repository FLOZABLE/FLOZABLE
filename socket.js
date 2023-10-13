const { server, sessionMiddleWare } = require("./app");
const cron = require('node-cron');
const pool = require("./model/pool");
const redisClient = require("./model/redis");
const Peer = require("simple-peer");

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

function generateRandomId(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};

io.on('connection', (socket) => {
  let session = false;

  if (process.env.NODE_ENV == "production") {
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
  userIdToSocketIdMap.set(socket.userId, socket.id);
  socket.join(socket.userId);
  console.log(userIdToSocketIdMap)

  socket.on('joinMyGroups', async () => {
    const connection = pool.promise();
    try {
      const [[userInfo]] = await connection.query(`SELECT groups from users where user_id = ?`, [session.user_id]);
      if (userInfo) {
        const myGroups = userInfo.groups.split(',');
        /* const prevSocketId = userIdToSocketIdMap.get(socket.userId);
        if (prevSocketId) {
          userIdToSocketIdMap.set(socket.userId, socket.id);
        } else {
          userIdToSocketIdMap.set(socket.userId, prevSocketId + ',' + socket.id);
        }; */
        socket.join(myGroups);
        if (myGroups.length) {
          io.to(myGroups).emit('online', session.user_id);
        }
      };
    } catch (err) {
      console.log(err);
    } finally {
      connection.releaseConnection();
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
  })


  socket.on('getMembersTime', async (groups, userId) => {
    if (groups.length == 0) {
      return 0
    }
    const connection = pool.promise();

    const [groupsInfo] = await connection.query('SELECT members FROM groups WHERE group_id IN (?)', [groups]);
    groupsInfo.forEach(async (group) => {
      group.members = group.members ? JSON.parse(`[${group.members}]`) : [];
      const membersId = group.members.flat().filter((value, index) => index % 2 === 0);
      console.log('groups', group)
      const members = await connection.query(`SELECT user_id, name, subjects, timezone from users where user_id in (?)`, [membersId]);

    })
    //io.to(groups).emit('sendTime', userId);
    console.log('members in group', groups, userId)
  });

  socket.on('addUser', (room, userId) => {
    console.log('adduser:', room, userId)
    io.to(room).emit('addUser', room, userId);
  });

  socket.on('removeUser', (room, userId) => {
    io.to(room).emit('removeUser', room, userId)
  })

  socket.on('send-signal', () => {
    io.emit('start')
    console.log('test')
  })

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

  socket.on("chaneRoom", async (roomId) => {
    console.log(roomId, socket.userId);
    const userId = socket.userId;
    let userGroups = await redisClient.hGet(`user:${userId}`, 'groups');
    if (userGroups) {
      userGroups = userGroups.split(',');
      if (userGroups.includes(userId)) {
        redisClient.hSet(`user:${userId}`, 'groups')
      }
    }
  });

  socket.on("sendMsg", async (group, msg) => {
    console.log("Group ID: " + group, msg);
    const userId = socket.userId;
    let userGroups = await redisClient.hGet(`user:${userId}`, 'groups');
    if (userGroups) {
      userGroups = userGroups.split(',');
      if (userGroups.includes(group)) {
        const msgId = generateRandomId(10);
        const time = Math.floor(new Date().getTime() / 1000);
        const msgInfo = { u: userId, m: msg, i: msgId, t: time };
        redisClient.rPush(`group:${group}:chat`, JSON.stringify(msgInfo));
        io.to(group).emit('msgReceived', group, msgInfo);
      }
    }
  });
  const userId = socket.userId;
  //webcam
  socket.on("camOn", async() => {
    const userId = socket.userId;
    let userGroups = await redisClient.hGet(`user:${userId}`, 'groups');
    if (userGroups) {
      userGroups = userGroups.split(',');
      if (userGroups.length) {
        redisClient.hSet(`user:${userId}`, 'groups')
      }
    }
  });
  socket.on("checkRoom", async(groupId, msgId) => {
    console.log(groupId, msgId);
    
  })
});


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