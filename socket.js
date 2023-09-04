const {server, sessionMiddleWare} = require("./app");
const cron = require('node-cron');
const pool = require("./model/pool");

const io = require('socket.io')(server, {
  cors: {
    origin: ["http://localhost:3001", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST"],
  },
  allowEIO3: true
});

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleWare));

/* io.use((socket, next) => {
  const req = socket.request;
  if (process.env.NODE_ENV == "production") {
    try {
      const sessionData = socket.request.session;
      if (sessionData ) {
        console.log(sessionData);
      }
    } catch (err) {
      console.log(err);
    };
    //const sessionData = req.session;
    //socket.sessionData = sessionData;
  }
  next();
}); */

io.on('connection', (socket) => {
  let userInfo = false;

  if (process.env.NODE_ENV == "production") {
    //socket.userId = socket.sessionData.userId;
    try {
      userInfo = socket.request.session;
    } catch (err) {
      console.log(err);
    };
  } else {
    
  }
  socket.on('joinRoom', (room, userId) => {
    socket.join(room); // Join the specified room
    /* console.log(`User joined room: ${room}`);
    console.log(userId, room) */
  });

  socket.on('getMembersTime', async(groups, userId) => {
    if(groups.length == 0){
      return 0
    }
    const connection = await (await pool).getConnection();

    const groupsInfo = await connection.query('SELECT members FROM groups WHERE group_id IN (?)', [groups]);
    groupsInfo.forEach(async (group) => {
      group.members = group.members ? JSON.parse(`[${group.members}]`) : [];
      const membersId = group.members.flat().filter((value, index) => index % 2 === 0);
      console.log('groups',group)
      const members = await connection.query(`SELECT user_id, name, subjects, timezone from users where user_id in (?)`, [membersId]);
      
    })
    //io.to(groups).emit('sendTime', userId);
    console.log('members in group',groups, userId)
  });

  socket.on('addUser', (room, userId) => {
    console.log('adduser:', room, userId)
    io.to(room).emit('addUser', room, userId);
  });

  socket.on('removeUser', (room, userId) => {
    io.to(room).emit('removeUser', room, userId)
  })

  socket.on('send-signal', () => {
    io.emit('start')
    console.log('test')
  })

  socket.on('onlineMembers', () => {
    /* const onlineMembers = io.engine.clientsCount;
    io.emit() */
    /* const onlineMembers = Object.keys(socket.sockets).length;
    io.emit({success: true, totalLiveMembers: onlineMembers});
    console.log(onlineMembers); */
  });
});


cron.schedule('*/10 * * * * *', () => {
  const onlineMembers = io.engine.clientsCount;
  io.emit('onlineMembers', onlineMembers);
});

module.exports = io;