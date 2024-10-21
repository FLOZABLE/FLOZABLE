const pool = require("../model/pool");
const redisClient = require("../model/redis");

//deprecated
async function messagesUpdate() {
  try {
    const connection = pool.promise();

    const [chatrooms] = await connection.query(
      `SELECT chatroom_id FROM chatrooms`
    );
    console.log(chatrooms);
    chatrooms.map(async (chatroom) => {
      const messages = (
        await redisClient.lrange(`chatroom:${chatroom.chatroom_id}:messages`, 0, -1)
      ).map(JSON.parse);
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = { messagesUpdate };
