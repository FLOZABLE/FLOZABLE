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

module.exports = { io };

/* require('./extensionIo');
require('./mainIo');
require('./mediaIo'); */
