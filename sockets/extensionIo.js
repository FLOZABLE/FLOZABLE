const { DateTime } = require("luxon");
const redisClient = require("../model/redis");
const {
  userCache,
  activeSubjectCache,
  addActiveUserCache,
} = require("../services/redisLoader");
const { io } = require("./io");

const extensionIo = io.of("/extension");

extensionIo.on("connection", async (socket) => {
  console.log(socket.handshake.auth);
  try {
    const { userId, token } = socket.handshake.auth;
    if (!userId || !token) return;

    const storedToken = await redisClient.get(`extension:authToken:${userId}`);
    if (!storedToken || storedToken !== token) return;

    console.log("extension authed");

    socket.join(userId);
  } catch (err) {
    console.log(err);
  }
});

module.exports = { extensionIo };
