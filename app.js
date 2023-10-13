const express = require("express");
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
const dotenv = require("dotenv");
const cors = require('cors');
const cron = require("node-cron");
const server = http.createServer(app);
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.development' });
} else if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
};
const RedisStore = require('connect-redis').default;
const redisClient = require("./model/redis");
redisClient.connect().catch(console.error);
const port = process.env.PORT;
const account = require("./Router/account");
const {flushRedis, groupsLoader, cacheManager} = require("./services/redisLoader");
//const WebSocketToken = process.env.WEBSOCKET_TOKEN;
//const WebSocket = require('ws');
//const wsServer =  new WebSocket.Server({ server });
/* const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3001"
  }
}); */
console.log(process.env.NODE_ENV)
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
const notificationService = require('./services/notification');
notificationService.notificationService();

const timerUpdateService = require('./services/timerUpdate');
timerUpdateService.timerUpdate();

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
const groupAPI = require("./Router/Api/groups");

//test
const testAPI = require('./test/Api');


app.set('view engine', 'ejs');
app.set(__dirname + '/views');
const { io } = require("./socket");
app.set('socketio', io);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser(process.env.SECRET_ID));
app.use(express.static(path.join(__dirname, '/public')));
app.disable('etag');

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
app.use('/api/groups', groupAPI);
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

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.error = err;
  const status = err.status || 500;
  res.status(status);
  console.log(err)
});

/* app.get('*',function(req,res){
  res.redirect('/');
}); */

//test
const testTools = require('./test/generate');
//testTools.testUserGeneration(100);
//testTools.testGroupGeneration(40);
//testTools.deleteGroups();
//testTools.deleteTestUsers();
//flushRedis();
//groupsLoader();
cacheManager();
cron.schedule('0 * * * *', () => {
  cacheManager();
});

server.listen(port, process.env.SERVER, () => {
  console.log(`Server running ${port}`);
});