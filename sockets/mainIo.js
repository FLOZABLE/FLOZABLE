const redisClient = require('../model/redis');
const { userCache, chatRoomsCache, msgQueue, subjectCache, dmRoomMembersCache, activeSubjectCache } = require('../services/redisLoader');
const { generateRandomId } = require('../tool');
const { extensionIo } = require('./extensionIo');
const { io } = require('./io');

const mainIo = io.of('/');
mainIo.on('connection', (socket) => {
  let session;

  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test") {
    try {
      session = socket.request.session;
      console.log('gddd',session)
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
    };
  };
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
        mainIo.to(friends).emit(`studying:${userId}`, {id: '0'});
      };
    })();
  }

  socket.on('joinChats', async () => {
    try {
      const chatRooms = await chatRoomsCache(userId);
      const chatRoomsId = chatRooms.map(chatRoom => {
        return `chat:${chatRoom.id}`;
      });
      socket.join(chatRoomsId);
    } catch (err) {
      console.log(err);
    };
  });

  socket.on("disconnect", async (reason) => {
    stopStudying(userId, 'disconnect');
    deActiveGroup(userId, socket);
  });

  //chat

  socket.on("sendMsg", async (roomId, msg) => {
    const isIn = await isInChatRoom(userId, roomId);
    if (isIn) {
      const msgId = generateRandomId(6);
      const time = Math.floor(new Date().getTime() / (1000 * 60));
      const msgInfo = { u: userId, m: msg, i: msgId, t: time };
      msgQueue(roomId, msgInfo);
      mainIo.to(`chat:${roomId}`).emit('msgReceived', roomId, msgInfo);
      const now = Math.floor(new Date().getTime() / 1000 / 60);
      redisClient.hSet(`user:${userId}:chats`, roomId, `${msgId}:${now}`);
    };
  });

  socket.on("start", async (subjectId) => {
    try {
      const now = Math.floor(new Date().getTime() / 1000);

      const subject = await subjectCache(userId, subjectId);
      const userInfo = await userCache(userId);
      if (!subject || !userInfo) return;
      const { groups, friends } = userInfo;
      if (groups.length) {
        mainIo.to(groups).emit(`studying:${userId}`, subject);
      };
      if (friends.length) {
        mainIo.to(friends).emit(`studying:${userId}`, subject);
      };
      const { datum_point, id } = subject;
      const start = now - datum_point;
      redisClient.rPush(`user:${userId}:subject:${id}`, `[${start},0]`);
      redisClient.hSet(`user:${userId}`, `ActiveSubject`, `${id}:${now}`);
      extensionIo.to(userId).emit("studying", { studying: true });
    } catch (err) {
      console.log(err);
    };
  });


  socket.on("stop", async (subjectId) => {
    try {
      stopStudying(userId, 'rest', subjectId);
    } catch (err) {
      console.log(err);
    };
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
    mainIo.to(friends).emit(`activeGroup:${userId}`, { groupInfo, time: now });
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
    mainIo.to(userId).emit(`volumeChange`, { id, volume });
    extensionIo.to(userId).emit(`volumeChange`, { id, volume });
  })

  socket.on('exitSession', async () => {
    deActiveGroup(userId, socket);
    stopStudying(userId, 'rest');
  });
});


async function deActiveGroup(userId, socket) {
  const userInfo = await userCache(userId);
  if (!userInfo) return;
  const {groups, friends} = userInfo; 
  groups.map(group => {
    socket.leave(group);
  });
  redisClient.hDel(`user:${userId}`, `ActiveGroup`);
  if (!friends.length) return;
  mainIo.to(friends).emit(`deActiveGroup:${userId}`);
}

async function isInChatRoom(userId, roomId) {
  try {
    const rooms = await chatRoomsCache(userId, false);
    const roomIndex = rooms.findIndex(room => { return room.id === roomId });
    return roomIndex === -1 ? false : true;
  } catch (err) {
    console.log(err);
  };
};

async function stopStudying(userId, mode, subjectId) {
  const now = Math.floor(new Date().getTime() / 1000);

  const activeSubject = await activeSubjectCache(userId);
  if (!activeSubject) return;

  if (!activeSubject || activeSubject.id === '0') return;

  if (subjectId && activeSubject.id !== subjectId) return;

  const subject = await subjectCache(userId, activeSubject.id);
  const userInfo = await userCache(userId);
  if (!userInfo || !subject) return;

  const { groups, friends } = userInfo;

  if (groups.length) {
    mainIo.to(groups).emit(`stopStudying:${userId}`, {status: mode});
  };
  if (friends.length) {
    mainIo.to(friends).emit(`stopStudying:${userId}`, {status: mode});
  };

  const activity = JSON.parse(await redisClient.rPop(`user:${userId}:subject:${activeSubject.id}`));

  extensionIo.to(userId).emit("studying", { studying: false });

  if (!activity) return;

  const start = activity[0];

  const { datum_point } = subject;

  const duration = now - datum_point - start;

  if (mode === 'disconnect') {
    redisClient.hDel(`user:${userId}`, `ActiveSubject`);
  } else {
    redisClient.hSet(`user:${userId}`, `ActiveSubject`, `0:${now}`);
  };
  
  for (let i = -12; i < 12; i++) {
    redisClient.zIncrBy(`user:${userId}:dayTotal`, duration, i.toString());
  };

  redisClient.rPush(`user:${userId}:subject:${activeSubject.id}`, `[${start},${duration}]`);
};

module.exports = { mainIo };