const express = require("express");
const app = express();
const ejs = require("ejs");
const createError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const http = require('http');
const crypto = require("crypto");
const dotenv = require("dotenv");
const cors = require('cors');
dotenv.config({path: ".env.development"});
const server = http.createServer(app);
const port = process.env.PORT;
const account =require("./Router/account");
//const WebSocketToken = process.env.WEBSOCKET_TOKEN;
//const WebSocket = require('ws');
//const wsServer =  new WebSocket.Server({ server });
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3001"
  }
});
const pool = require('./model/pool');
//test
const testTools = require('./test/generate');

//testTools.testUserGeneration(100);
//testTools.testGroupGeneration(40);
//testTools.deleteGroups();
//testTools.deleteTestUsers();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
//app.use(cors({origin: 'chrome-extension://dalobnhjngmjgnkdjkeonfnbbkaclcpm'}));
console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === 'development') {
  app.use(cors());
}
/* app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
//app.use(helmet.contentSecurityPolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
  res.setHeader("X-XSS-protection", "1; mode=block");
  //console.log(res.locals.cspNonce)
  next();
});
app.use(helmet.frameguard({ action: 'SAMEORIGIN' }));

const cspOptions = {
  directives: {
    defaultSrc: ["'self'", "*.googleapis.com", "'unsafe-inline'", "*.fonts.gstatic.com", "*.googletagmanager.com", "*.fontawesome.com", "https://googleads.g.doubleclick.net", "https://pagead2.googlesyndication.com",  'https://tpc.googlesyndication.com/sodar/sodar2.js', ""],
    scriptSrc: ["'self'", "'unsafe-eval'", "*.swiper-bundle.min.js", "https://unpkg.com/swiper@6.8.4/swiper-bundle.min.js", "*.fontawesome.com", "https://pagead2.googlesyndication.com", "*.google.com", "partner.googleadservices.com", "https://tpc.googlesyndication.com", "*.googletagmanager.com"],
    frameSrc: ["'self'", "https://googleads.g.doubleclick.net", 'https://tpc.googlesyndication.com', "https://*.google.com", "*.googletagmanager.com"],
    "img-src": ["'self'", "data:", "https://pagead2.googlesyndication.com", "https://ad.doubleclick.net", "*.googletagmanager.com"],
  }
}

app.use(helmet.contentSecurityPolicy(cspOptions))  */


io.on('connection', (socket) => {
  console.log('test')
  socket.on('joinRoom', (room, userId) => {
    socket.join(room); // Join the specified room
    console.log(`User joined room: ${room}`);
    console.log(userId, room)
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
      members.forEach((member) => {
        member.subjects = JSON.parse(member.subjects)
        console.log(member.subjects);
        const date = new Date().toLocaleDateString('en-US', { timeZone: member.timezone });
        const startTime = new Date(`${date} 00:00:00`).getTime();
        const endTime = new Date(`${date} 24:00:00`).getTime();
        
        console.log(startTime); // Unix timestamp for 0 AM
        console.log(endTime); // Unix timestamp for 12 PM
        if(member.subjects == null){
          return 0;
        }
        member.subjects.forEach((subject, index) => {
          const datum_point = member.subjects[index].datum_point;
          const filteredTimeline = subject.timeline.filter((period, index) => {
            let [start, end] = period;
            console.log(member.subjects[index], index)
            console.log(start, end, datum_point);
            start = (start + datum_point) * 1000;
            if(end == null){
              console.log('studying')
            }
            end = (end + datum_point) * 1000;
            console.log(start, end, startTime, endTime);
            return start >= startTime && end <= endTime;
          })
          console.log('filtered time', filteredTimeline)
        })
      })
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

  socket.on('test', () => {
    console.log('test')
  })
})

module.exports = io;
/* wsServer.on('connection', (socket, req) => {
  socket.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'authorization') {
      if (WebSocketToken == data.token) {
        console.log(req.headers.origin)
      } else {
        console.log('Client unauthorized:', req.headers.origin);
        socket.close();
      }
    } else {
    }
  });

  socket.on('close', () => {
    console.log('WebSocket client disconnected.');
  });
}); */

//services
const notificationService = require('./services/notification');
notificationService.notificationService();

//Router
const mainRouter = require("./Router/main");
const accountRouter = account.Router;
const studyRouter = require("./Router/study");
const groupsRouter = require("./Router/groups");
const linksRouter = require('./Router/links');
const dashboardRouter = require('./Router/dashboard');
const rankingRouter = require('./Router/ranking');
const extensionRouter = require('./Router/api');
const notificationRouter = notificationService.notificationRouter;


//API
const studyAPI = require('./Router/Api/study');
const informationAPI = require('./Router/Api/information');
const rankingAPI = require('./Router/Api/ranking');

//test
const testAPI = require('./test/Api');

app.set('view engine', 'ejs');
app.set(__dirname + '/views');
app.set('socketio', io);

app.get('/public/img/profiles/:profile', (req, res) => {
  console.log('sdssdf')
  const profile = req.params.profile;
  console.log(profile);
})
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser(process.env.SECRET_ID));
app.use(express.static(path.join(__dirname, '/public')));
app.disable('etag');

app.use(session({
  secret: process.env.SECRET_ID,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    httpOnly: true,
    signed: true,
  },
  //store: new fileStore(),
}))

app.use('/', mainRouter);
app.use('/account', accountRouter);
app.use('/study', studyRouter);
app.use('/groups', groupsRouter);
app.use('/links', linksRouter);
app.use('/dashboards', dashboardRouter);
app.use('/ranking', rankingRouter);
app.use('/api', extensionRouter);
app.use('/notification', notificationRouter);

//api
app.use('/api/study', studyAPI);
app.use('/api/information', informationAPI);
app.use('/api/ranking', rankingAPI);
app.use(express.static(path.join(__dirname, 'app/build')));

//test api
app.use('/test/api', testAPI);

app.get('/dashboard*', (req, res) => {
  console.log(req.session.loggedin, req.signedCookies)
  account.autoSignin(req, res, (() => {
    res.sendFile(path.join(__dirname, 'app/build', 'index.html'));
  }),
  (() => {
    res.redirect('/account/signin');
  })
  );
});
// error handler
app.use(function (err, req, res, next) {
  console.log(err.message, err.status)
});

/* app.get('*',function(req,res){
  res.redirect('/');
}); */

server.listen(port, process.env.SERVER, () => {
  console.log(`Server running ${port}`);
});