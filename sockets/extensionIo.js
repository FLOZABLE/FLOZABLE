const { DateTime } = require("luxon");
const redisClient = require("../model/redis");
const { userCache } = require("../services/redisLoader");
const { io } = require("./io");

const extensionIo = io.of("/extension");

extensionIo.on("connection", (socket) => {
  socket.on("auth", async ({ authId }) => {
    if (!authId) return;

    try {
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
});

module.exports = { extensionIo };
