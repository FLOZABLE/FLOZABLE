const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const connectRedis = require("connect-redis");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const http = require('http');
const https = require('https');
const dotenv = require("dotenv");
const cors = require('cors');
const cron = require("node-cron");
const fs = require('fs');
const axios = require('axios');
const logger = require("morgan");
const crypto = require("node:crypto");

const options = {
  key: fs.readFileSync('./SSL/key.pem', 'utf-8'),
  cert: fs.readFileSync('./SSL/cert.pem', 'utf-8')
}

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.development' });
} else if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env.test' });
};
const port = process.env.PORT;


let server;

if (process.env.isHttps === "true") {
  server = https.createServer(options, app);
  console.log('https')
} else {
  console.log('http')
  server = http.createServer(app);
};

//redis
const RedisStore = require('connect-redis').default;
const redisClient = require("./model/redis");
redisClient.connect().catch(console.error);
const redisStore = new RedisStore({ client: redisClient, ttl: 60 * 60 * 24 * 3 });

const sessionMiddleWare = session({
  store: redisStore,
  secret: process.env.SECRET_ID,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    signed: true,
  },
});

module.exports = { server, sessionMiddleWare };

//Router
const mainRouter = require("./Router/main");

//API
const accountAPI = require("./API/account");
const chatAPI = require("./API/chat");
const groupsAPI = require("./API/groups");
const planAPI = require("./API/plan");
const studyAPI = require("./API/study");
const videoAPI = require("./API/video");
const rankingAPI = require('./API/ranking');
//const AiAPI = require('./API/AI');
const challengeAPI = require('./API/challenges');
const friendAPI = require('./API/friend');
const themesAPI = require('./API/themes');
const extensionAPI = require('./API/extension');
const canvasAPI = require('./API/canvas');
const playlistsAPI = require('./API/playlists');

//import socket
const { io } = require("./socket");

//middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: ['https://localhost:4000', 'http://localhost:4000'],
    credentials: true
  }));
} else {
  app.use(cors({
    origin: ['https://localhost:4000', 'http://localhost:4000'],
    credentials: true
  }));
  app.use(helmet.permittedCrossDomainPolicies());
  app.use(helmet.referrerPolicy());
  app.use(helmet.xssFilter());
  app.use(helmet.hsts());
  app.use(helmet.ieNoOpen());
  app.use(helmet.noSniff());
  //app.use(helmet.contentSecurityPolicy());
  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.frameguard());
  app.use(helmet.hidePoweredBy());
  app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
    res.setHeader("X-XSS-protection", "1; mode=block");
    //console.log(res.locals.cspNonce)
    next();
  });
  app.use(helmet.frameguard({ action: 'SAMEORIGIN' }));

  /* const cspOptions = {
    directives: {
      defaultSrc: ["'self'", "*.googleapis.com", "'unsafe-inline'", "*.fonts.gstatic.com", "*.googletagmanager.com", "*.fontawesome.com", "https://googleads.g.doubleclick.net", "https://pagead2.googlesyndication.com", 'https://tpc.googlesyndication.com/sodar/sodar2.js', ""],
      scriptSrc: ["'self'", "'unsafe-eval'", "*.swiper-bundle.min.js", "https://unpkg.com/swiper@6.8.4/swiper-bundle.min.js", "*.fontawesome.com", "https://pagead2.googlesyndication.com", "*.google.com", "partner.googleadservices.com", "https://tpc.googlesyndication.com", "*.googletagmanager.com"],
      frameSrc: ["'self'", "https://googleads.g.doubleclick.net", 'https://tpc.googlesyndication.com', "https://*.google.com", "*.googletagmanager.com"],
      "img-src": ["'self'", "data:", "https://pagead2.googlesyndication.com", "https://ad.doubleclick.net", "*.googletagmanager.com"],
    }
  }

  app.use(helmet.contentSecurityPolicy(cspOptions)) */
};
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(sessionMiddleWare);

//ejs setting
app.set('view engine', 'ejs');
app.set(__dirname + '/views');
app.set('socketio', io);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser(process.env.SECRET_ID));
app.use(express.static(path.join(__dirname, '/public')));
app.disable('etag');

app.use('/', mainRouter);

//api
app.use('/account', accountAPI);
app.use('/chat', chatAPI);
app.use('/groups', groupsAPI);
app.use('/plan', planAPI);
app.use('/study', studyAPI);
app.use('/video', videoAPI);
app.use('/ranking', rankingAPI);
//app.use('/ai', AiAPI);
app.use('/challenges', challengeAPI);
app.use('/friend', friendAPI);
app.use('/themes', themesAPI);
app.use('/extension', extensionAPI);
app.use('/playlists', playlistsAPI);
app.use('/canvas', canvasAPI);
app.use(express.static(path.join(__dirname, process.env.BUILD)));

//handle profile images
app.use((req, res, next) => {
  if (!req.path.startsWith('/profile-images')) { next(); return };
  const defaultImagePath = path.join(__dirname, 'public', '/img/default_profile.jpg');
  return res.sendFile(defaultImagePath);
});


//render react app
app.get('/dashboard*', (req, res) => {
  res.sendFile(path.join(__dirname, process.env.BUILD, 'index.html'));
}); 

//catch 404
app.get('*', function (req, res) {
  res.redirect('/');
});


const { createBots, addId, deleteBots, botManager, createGroups, randomFriend, createBotRankings } = require('./Bot/Bot');
//randomFriend(0, 3);
//createGroups(10);
//botManager(57);
//deleteBots();
//addId();
//createBots(50); 
//createBotRankings();

const { updateRanking, createRankings } = require("./services/rankingUpdate");
const { extensionManager } = require("./services/extension");
const { dailyReport } = require("./services/notification");
const { timerUpdate } = require("./services/timerUpdate");

//scheduler that runs every hour
//updateRanking();

//all timezones
//createRankings(-7);

//schedulers
cron.schedule('0 * * * *', () => {
  //dailyReport(process.env.TESTER_ID);
  extensionManager();
  updateRanking();
  timerUpdate();
});

//create tables
const { createUsersTable, createSubjectsTable, createGroupsTable, createPlansTable, createChatroomsTable, createDailyRankingTable, createWeeklyRankingTable, createMonthlyRankingTable, groupsChatRoomsGeneration, createChallengesTable, createChallengeRoomsTable, createThemesTable, createActivitiesTable, utf8mb4Unicode, createDevicesTable } = require('./query');
const { updateSubjectsTimeline } = require("./Utils/migration");

//createUsersTable();
//createSubjectsTable();
//createGroupsTable();
//createPlansTable();
//createChatroomsTable();
//createChallengesTable();
//createDailyRankingTable();
//createWeeklyRankingTable();
//createMonthlyRankingTable();
//createChallengeRoomsTable();
//createThemesTable();
//groupsChatRoomsGeneration();
//createActivitiesTable();
//utf8mb4Unicode();
//createDevicesTable();

//updateSubjectsTimeline(161);

server.listen(port, process.env.IP, () => {
  console.log(`Server running ${port}`);
});