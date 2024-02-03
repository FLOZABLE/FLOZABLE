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
const sharp = require("sharp");

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

const server = http.createServer(app);
//const server = https.createServer(options, app);

const RedisStore = require('connect-redis').default;
const redisClient = require("./model/redis");
redisClient.connect().catch(console.error);
const port = process.env.PORT;
const { cacheManager } = require("./services/redisLoader");
const SENDINBLUE_API = process.env.SENDINBLUE_API;
const sendInBlue = require('sib-api-v3-sdk');
const sendinBlueClient = sendInBlue.ApiClient.instance;
sendinBlueClient.authentications['api-key'].apiKey = SENDINBLUE_API;

const emailInstance = new sendInBlue.TransactionalEmailsApi();

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

module.exports = { server, sessionMiddleWare, emailInstance };
//services
/* const notificationService = require('./services/notification');
notificationService.notificationService(); */


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
const AiAPI = require('./API/AI');
const challengeAPI = require('./API/challenges');
const friendAPI = require('./API/friend');
const themesAPI = require('./API/themes');
const extensionAPI = require('./API/extension');
const canvasAPI = require('./API/canvas');
const playlistsAPI = require('./API/playlists');

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

//api
app.use('/account', accountAPI);
app.use('/chat', chatAPI);
app.use('/groups', groupsAPI);
app.use('/plan', planAPI);
app.use('/study', studyAPI);
app.use('/video', videoAPI);
app.use('/ranking', rankingAPI);
app.use('/ai', AiAPI);
app.use('/challenges', challengeAPI);
app.use('/friend', friendAPI);
app.use('/themes', themesAPI);
app.use('/extension', extensionAPI);
app.use('/playlists', playlistsAPI);
app.use('/canvas', canvasAPI);
app.use(express.static(path.join(__dirname, process.env.BUILD)));


app.get('/dashboard*', (req, res) => {
  res.sendFile(path.join(__dirname, process.env.BUILD, 'index.html'));
  /* account.autoSignin(req, res, (() => {
    res.sendFile(path.join(__dirname, process.env.BUILD, 'index.html'));
  }),
    (() => {
      res.redirect('/#signin');
    })
  ); */
});

app.use((req, res, next) => {
  if (!req.path.startsWith('/profile-images')) { next(); return };
  const defaultImagePath = path.join(__dirname, 'public', '/img/default_profile.jpg');
  return res.sendFile(defaultImagePath);

  const imagePath = req.path.split("/");
  const imageUserId = imagePath[imagePath.length - 1].replace(".jpeg", "");
  const imageUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${imageUserId}&size=800&scale=75`;
  // dicebear API limits png and jpeg to 10 per second. However, svgs can be called 50x per second
  // This is why I'm calling svgs and converting to jpeg later on

  axios.get(imageUrl)
    .then((response) => {
      return axios.get(imageUrl, { responseType: 'arraybuffer' })
    })
    .then((imageBuffer) => {
      sharp(imageBuffer.data)
        .resize(400, 400)
        .jpeg({ quality: 40 })
        .toBuffer()
        .then((resizedBuffer) => {
          res.contentType('image/jpeg');
          const buffer64 = resizedBuffer.toString('base64')
          res.end(buffer64, 'base64');
        })
    })
    .catch((err) => {
      console.log(`Couldn't process: ${err}`);
    })
});

app.get('*', function (req, res) {
  res.redirect('/');
});

cacheManager();
cron.schedule('0 * * * *', () => {
  cacheManager();
});

require('./Logger');
require('./services/timerUpdate');
const { createBots, addId, deleteBots, botManager, createGroups, randomFriend, createBotRankings } = require('./Bot/Bot');
//randomFriend(0, 3);
//createGroups(1, 10);
botManager(100);
//deleteBots();
//addId();
//createBots(0, 170);
//createBotRankings();

const { createUsersTable, createSubjectsTable, createGroupsTable, createPlansTable, createChatroomsTable, createDailyRankingTable, createWeeklyRankingTable, createMonthlyRankingTable, groupsChatRoomsGeneration, createChallengesTable, createChallengeRoomsTable, createThemesTable, createActivitiesTable } = require('./query');
const { rankingManager } = require("./services/rankingUpdate");
const { extensionManager } = require("./services/extension");

app.get('*', (req, res) => {
  res.redirect('/');
});

// createUsersTable();
// createSubjectsTable();
// createGroupsTable();
// createPlansTable();
// createChatroomsTable();
// createChallengesTable();
// createDailyRankingTable();
// createWeeklyRankingTable();
// createMonthlyRankingTable();
// createChallengeRoomsTable();
// createThemesTable();
// groupsChatRoomsGeneration();
// createActivitiesTable();


rankingManager();
extensionManager();

server.listen(port, process.env.IP, () => {
  console.log(`Server running ${port}`);
});