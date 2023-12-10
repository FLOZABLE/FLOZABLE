const express = require("express");
const Router = express.Router();
const app = express();
const ejs = require("ejs");
const createError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
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
}

const server = https.createServer(options, app);

const RedisStore = require('connect-redis').default;
const redisClient = require("./model/redis");
redisClient.connect().catch(console.error);
const port = process.env.PORT;
const account = require("./Router/account");
const {flushRedis, cacheManager} = require("./services/redisLoader");

//const WebSocketToken = process.env.WEBSOCKET_TOKEN;
//const WebSocket = require('ws');
//const wsServer =  new WebSocket.Server({ server });
/* const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3001"
  }
}); */
const datasets = require('./test/Datasets');
//datasets.getSubjects();
//datasets.getPlans();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
//app.use(cors({origin: 'chrome-extension://dalobnhjngmjgnkdjkeonfnbbkaclcpm'}));
if (process.env.NODE_ENV === 'development') {
  app.use(cors());
} else {
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
  //store: new fileStore(),
});

app.use(sessionMiddleWare);

module.exports = { server, sessionMiddleWare };
//services
/* const notificationService = require('./services/notification');
notificationService.notificationService(); */


//Router
const mainRouter = require("./Router/main");
const accountRouter = account.Router;
const studyRouter = require("./Router/study");
const groupsRouter = require("./Router/groups");
const linksRouter = require('./Router/links');
const dashboardRouter = require('./Router/dashboard');
const rankingRouter = require('./Router/ranking');
const extensionRouter = require('./Router/api');
const chatRouter = require('./Router/chat');
//const planRouter = require("./Router/plan");
//const notificationRouter = notificationService.notificationRouter;


//API
const accountAPI = require("./API/account");
const chatAPI = require("./API/chat");
const groupsAPI = require("./API/groups");
const planAPI = require("./API/plan");
const studyAPI = require("./API/study");
const videoAPI = require("./API/video");
const rankingAPI = require('./API/ranking');
const AiAPI = require('./API/AI');
const challengeAPI = require('./API/challenges');
const friendAPI = require('./API/friend');
const themesAPI = require('./API/themes');


//test
const testAPI = require('./test/Api');


app.set('view engine', 'ejs');
app.set(__dirname + '/views');
const { io } = require("./socket");
app.set('socketio', io);
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser(process.env.SECRET_ID));
app.use(express.static(path.join(__dirname, '/public')));

app.disable('etag');

app.use('/', mainRouter);
app.use('/account', accountRouter);
app.use('/study', studyRouter);
app.use('/groups', groupsRouter);
app.use('/links', linksRouter);
//app.use('/dashboards', dashboardRouter);
app.use('/ranking', rankingRouter);
app.use('/api', extensionRouter);
//app.use('/notification', notificationRouter);

//api
app.use('/api/account', accountAPI);
app.use('/api/chat', chatAPI);
app.use('/api/groups', groupsAPI);
app.use('/api/plan', planAPI);
app.use('/api/study', studyAPI);
app.use('/api/video', videoAPI);
app.use('/api/ranking', rankingAPI);
app.use('/api/ai', AiAPI);
app.use('/api/challenges', challengeAPI);
app.use('/api/friend', friendAPI);
app.use('/api/themes', themesAPI);
app.use(express.static(path.join(__dirname, process.env.BUILD)));


app.get('/dashboard*', (req, res) => {
  account.autoSignin(req, res, (() => {
    res.sendFile(path.join(__dirname, process.env.BUILD, 'index.html'));
  }),
    (() => {
      res.redirect('/#signin');
    })
  );
});

app.use((req, res) => {
  if (!req.path.startsWith('/profile-images')) return;
  const defaultImagePath = path.join(__dirname, 'public', '/img/default_profile.jpg');
  res.sendFile(defaultImagePath);
});


cacheManager();
cron.schedule('0 * * * *', () => {
  cacheManager();
});

//test

const { generateUsers, generateGroups, deleteTestUsers, deleteGroups, deleteSubjects, deleteSubjectTimeline, generateOtherSubject } = require('./test/generate');
//generateUsers(100);
//generateGroups(40);
//deleteTestUsers();
//deleteGroups();
//deleteSubjects();
//deleteSubjectTimeline();
//generateOtherSubject(process.env.TESTER_ID);
//flushRedis();
//groupsLoader();
require('./Logger');
require('./services/timerUpdate');
const {createBots, addId, deleteBots, botManager, createGroups, randomFriend} = require('./Bot/Bot');
//randomFriend(0, 10);
//createGroups(0, 10);
//botManager();
//deleteBots();
//addId();
//createBots(0, 100);

const {createUsersTable, createSubjectsTable, createGroupsTable, createPlansTable, createChatroomsTable, createDailyRankingTable, createWeeklyRankingTable, createMonthlyRankingTable, groupsChatRoomsGeneration, createChallengesTable, createChallengeRoomsTable} = require('./query');
const { rankingManager } = require("./services/rankingUpdate");

//createUsersTable();
//createSubjectsTable();
//createGroupsTable();
//createPlansTable();
//createChatroomsTable();
//createChallengesTable();
//groupsChatRoomsGeneration();
//createDailyRankingTable();
//createWeeklyRankingTable();
//createMonthlyRankingTable();
//createChallengeRoomsTable();

rankingManager();

server.listen(port, process.env.IP, () => {
  console.log(`Server running ${port}`);
});