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
dotenv.config({path: ".env.production"});
var server = http.createServer(app);
const port = process.env.PORT;
var io = require('socket.io')(server);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
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

const mainRouter = require("./Router/main");
const emailRouter = require("./Router/email");
const accountRouter = require("./Router/account");
const myAccountRouter = require("./Router/myaccount");
const chatRouter = require("./Router/chat")(io);
const studyRouter = require("./Router/study");
const githubRouter = require("./Router/github");
const adminRouter = require("./Router/admin/main");
const articleRouter = require('./Router/article');
const categoryRouter = require('./Router/article');
const searchRouter = require('./Router/search');
const groupsRouter = require("./Router/groups");

app.set('view engine', 'ejs');
app.set(__dirname + '/views');
app.set('socketio', io);


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
    maxAge: 1000 * 60 * 60 * 24,
    secure: false,
    httpOnly: true,
    signed: true,
    authorized: true,
  },
  //store: new fileStore(),
}))

app.use('/', mainRouter);
app.use('/email', emailRouter);
app.use('/account', accountRouter);
app.use('/myaccount', myAccountRouter);
app.use('/chat', chatRouter);
app.use('/study', studyRouter);
app.use('/github', githubRouter);
app.use('/admin', adminRouter);
app.use('/article', articleRouter);
app.use('/category', categoryRouter);
app.use('/search', searchRouter);
app.use('/groups', groupsRouter);
// error handler
app.use(function (err, req, res, next) {
  console.log(err.message, err.status)
});

app.get('*',function(req,res){
  res.redirect('/');
});

server.listen(port, process.env.SERVER, () => {
  console.log(`Server running ${port}`);
});

module.exports = app;