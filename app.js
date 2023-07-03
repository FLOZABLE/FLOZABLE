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
const pool = require('./model/pool');

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
io.on('connection', (socket) => {
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
})

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
const linksRouter = require('./Router/links');
const aiRouter = require('./Router/ai');
const dashboardRouter = require('./Router/dashboard');

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
app.use('/links', linksRouter);
app.use('/ai', aiRouter);
app.use('/dashboard', dashboardRouter);

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