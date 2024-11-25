const { Server } = require("socket.io");
const { server, sessionMiddleWare } = require("../app");

const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_ORIGIN.split(", "),
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
  },
  allowEIO3: true,
  pingTimeout: 60000, // 60 seconds
  pingInterval: 25000, // 25 seconds
  connectTimeout: 45000, // Connection timeout
});

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleWare));

const mainIo = io.of("/");
const mediaIo = io.of("/media");
const extensionIo = io.of("/extension");

module.exports = { io, mainIo, mediaIo, extensionIo };

require("./mainIo");
require("./mediaIo");
require("./extensionIo");
