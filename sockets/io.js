const { Server } = require("socket.io");
const { server, sessionMiddleWare } = require("../app");

const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_ORIGIN.split(", "),
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
  },
  allowEIO3: true,
});

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleWare));

const mainIo = io.of("/");
const mediaIo = io.of("/mediaIo");
const extensionIo = io.of("extensionIo");

module.exports = { io, mainIo, mediaIo, extensionIo };

require("./mainIo")
require("./mediaIo")
require("./extensionIo")