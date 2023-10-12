const redisClient = require("../model/redis");
const pool = require('../model/pool');

async function flushRedis() {
  await redisClient.flushDb();
};

/** loads both chatrooms & groups*/
async function groupsLoader() {
  const connection = pool.promise();
  const [groups] = await connection.query(`SELECT group_id, name FROM groups`);
  const [chatRooms] = await connection.query(`SELECT id, group_id, name, type, members FROM chatrooms`);
  //console.log(chatRooms);
  chatRooms.map(chatRoom => {
    const chatRoomInfo = {...chatRoom};
    delete chatRoomInfo.group_id;
    //redisClient.hSet(`group:${chatRoom.group_id}`, 'rooms', JSON.stringify(chatRoomInfo))
    redisClient.sAdd(`group:${chatRoom.group_id}:rooms`, JSON.stringify(chatRoomInfo));
  })
};

function cacheManager() {
  console.log('d');
};

module.exports = {
  flushRedis,
  groupsLoader,
  cacheManager
}