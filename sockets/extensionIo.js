const { DateTime } = require("luxon");
const redisClient = require("../model/redis");
const { userCache, activeSubjectCache, addActiveUserCache } = require("../services/redisLoader");
const { io } = require("./io");

const extensionIo = io.of("/extension");
/* 
extensionIo.on("connection", (socket) => {
  socket.on("auth", async ({ authId }) => {
    if (!authId) return;

    try {
      const userId = await redisClient.get(`extension:auth:${authId}`);
      //invalid auth id
      if (!userId) return;
      const userInfo = await userCache(connection, userId);

      if (!userInfo) return;

      socket.userId = userId;
      socket.join(userId);
      addActiveUserCache(userId);
      console.log('extension socket joined', userId)
      const activeSubject = await activeSubjectCache(userId);
      extensionIo
        .to(userId)
        .emit("studying", {
          studying: activeSubject && activeSubject.id !== "0" ? true : false,
        });
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("update-tabs", async ({ domain, duration }) => {
    if (!socket.userId || !domain || !duration) return;

    try {
      console.log('update')
      redisClient.zIncrBy(`user:${socket.userId}:tabs:timer`, duration, domain);
      redisClient.zIncrBy(`user:${socket.userId}:tabs:usage`, 1, domain);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("volumeChange", async ({ id, volume }) => {
    if (!socket.userId || !id) return;
    io.to(socket.userId).emit(`volumeChange`, { id, volume });
  });
}); */

module.exports = { extensionIo };
