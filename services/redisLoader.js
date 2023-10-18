const redisClient = require("../model/redis");
const pool = require('../model/pool');

async function flushRedis() {
  await redisClient.flushDb();
};

/** loads both chatrooms & groups*/
async function groupsLoader() {
  const connection = pool.promise();
  const [chatRooms] = await connection.query(`SELECT id, group_id, name, type, members FROM chatrooms`);
  //console.log(chatRooms);
  chatRooms.map(async (chatRoom) => {
    const chatRoomInfo = {...chatRoom};
    delete chatRoomInfo.group_id;
    //redisClient.hSet(`group:${chatRoom.group_id}`, 'rooms', JSON.stringify(chatRoomInfo))
    await redisClient.sAdd(`group:${chatRoom.group_id}:rooms`, JSON.stringify(chatRoomInfo));
  });
};

function cacheManager() {
  console.log('d');
};

//study
async function lastMsgCache() {
/*   try {
    let lastMsg = await redisClient.hGet();
    if (!lastMsg) {
      lastMsg = 
    }
  } catch (err) {
    console.log(err);
  }; */
}

async function groupCache(userId) {
  try {
    let groups = await redisClient.hGet(`user:${userId}`, 'groups');
    if (!groups) {
      const connection = pool.promise();
      try {
        const [[userInfo]] = await connection.query(`SELECT groups FROM users WHERE user_id = ?`, [userId]);
        groups = userInfo.groups;
      } catch (err) {
        console.log(err);
      };
    };
    groups = groups.split(',');
    return groups;
  } catch (err) {
    console.log(err);
  };
}

async function groupRoomCache(userId) {
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
  } catch (err) {
    console.log(err);
  };
}

module.exports = {
  flushRedis,
  groupsLoader,
  cacheManager,
  lastMsgCache,
  groupCache,
  groupRoomCache
}