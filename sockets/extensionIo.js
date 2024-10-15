const { DateTime } = require("luxon");
const redisClient = require("../model/redis");
const { io } = require("./io");

const extensionIo = io.of("/extension");

extensionIo.on("connection", async (socket) => {
  console.log(socket.handshake.auth);
  try {
    const { userId, token } = socket.handshake.auth;
    if (!userId || !token) return;

    const storedToken = await redisClient.get(`extension:authToken:${userId}`);
    if (!storedToken || storedToken !== token) return;

    console.log("extension authed", userId);

    socket.join(userId);

    socket.on("updateUsage", ({ domain, duration }) => {
      try {
        console.log(domain, duration);
        redisClient.zincrby(
          `user:${userId}:websites:duration`,
          duration,
          domain
        );
        redisClient.zincrby(`user:${userId}:websites:visits`, 1, domain);
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("getUsage", async (domain, callback) => {
      try {
        const usage = await redisClient.zscore(
          `user:${userId}:websites:duration`,
          domain
        );
        callback(parseInt(usage));
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = { extensionIo };
