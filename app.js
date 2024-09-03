const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const http = require("http");
const https = require("https");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const logger = require("morgan");
const crypto = require("node:crypto");

const options = {
  key: fs.readFileSync("./SSL/key.pem", "utf-8"),
  cert: fs.readFileSync("./SSL/cert.pem", "utf-8"),
};

if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: ".env.development" });
} else if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.production" });
} else {
  dotenv.config({ path: ".env.test" });
}
const port = process.env.PORT;

let server;

if (process.env.isHttps === "true") {
  server = https.createServer(options, app);
  console.log("https");
} else {
  console.log("http");
  server = http.createServer(app);
}

//redis
const RedisStore = require("connect-redis").default;
const redisClient = require("./model/redis");
const redisStore = new RedisStore({
  client: redisClient,
  ttl: 60 * 60 * 24 * 3,
});

const sessionMiddleWare = session({
  store: redisStore,
  secret: process.env.SECRET_ID,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    signed: true,
    sameSite: "strict",
  },
});

module.exports = { server, sessionMiddleWare };

//Router
const mainRouter = require("./Router/main");

//API
const accountAPI = require("./API/account");
const authAPI = require("./API/auth").Router;
const chatAPI = require("./API/chat");
const groupsAPI = require("./API/groups");
const plansAPI = require("./API/plans");
const subjectsAPI = require("./API/subjects");
const rankingsAPI = require("./API/rankings");
const friensdAPI = require("./API/friends").Router;
const themesAPI = require("./API/themes");
const extensionAPI = require("./API/extension");
const playlistsAPI = require("./API/playlists");
const paymentAPI = require("./API/payment");
const notificationsAPI = require("./API/notifications");
const webhooksAPI = require("./API/webhooks");

//import socket
const { io } = require("./sockets/io");

//middlewares
app.use(
  cors({
    origin: process.env.SERVER_CORS.split(", "),
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);
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
app.use("/webhooks", express.raw({ type: "application/json" }));
app.use(helmet.frameguard({ action: "SAMEORIGIN" }));

const cspOptions = {
  directives: {
    defaultSrc: [
      "'self'",
      "*.googleapis.com",
      "'unsafe-inline'",
      "*.fonts.gstatic.com",
      "*.googletagmanager.com",
      "*.fontawesome.com",
      "https://www.google-analytics.com",
    ],
    scriptSrc: [
      "'self'",
      "*.swiper-bundle.min.js",
      "https://unpkg.com/swiper@6.8.4/swiper-bundle.min.js",
      "*.fontawesome.com",
      "*.google.com",
      "*.googletagmanager.com",
      "'unsafe-inline'",
      "https://code.jquery.com",
    ],
    frameSrc: [
      "'self'",
      "https://googleads.g.doubleclick.net",
      "https://*.google.com",
      "*.googletagmanager.com",
    ],
    "img-src": ["'self'", "*.googletagmanager.com"],
    "form-action": ["'self'", "https://accounts.google.com/o/oauth2/v2/auth"],
  },
};

app.use(helmet.contentSecurityPolicy(cspOptions));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(sessionMiddleWare);

//ejs setting
app.set("view engine", "ejs");
app.set(__dirname + "/views");
app.set("socketio", io);
app.use(bodyParser.json());
app.use(cookieParser(process.env.SECRET_ID));
app.use(express.static(path.join(__dirname, "/public")));
app.disable("etag");
process.env.LOGGER === "true" ? app.use(logger("dev")) : null;

app.use("/", mainRouter);

//api
app.use("/account", accountAPI);
app.use("/auth", authAPI);
app.use("/chat", chatAPI);
app.use("/groups", groupsAPI);
app.use("/plans", plansAPI);
app.use("/subjects", subjectsAPI);
app.use("/rankings", rankingsAPI);
app.use("/friends", friensdAPI);
app.use("/themes", themesAPI);
app.use("/extension", extensionAPI);
app.use("/playlists", playlistsAPI);
app.use("/payment", paymentAPI);
app.use("/notifications", notificationsAPI);
app.use("/webhooks", webhooksAPI);

//handle profile images
app.get("/profile-image/:userId.jpeg", (req, res) => {
  const { userId } = req.params;
  const imagePath = path.join(
    __dirname,
    "public/profile-images",
    `${userId}.jpeg`
  );
  fs.readFile(imagePath, (err, imageData) => {
    if (err) {
      // Handle the case when the image is not found
      const defaultImagePath = path.join(
        __dirname,
        "public",
        "/img/default_profile.jpg"
      );
      return res.sendFile(defaultImagePath);
    }

    res.setHeader("Content-Type", "image/jpeg");
    res.send(imageData);
  });
});

//catch 404
app.get("*", function (req, res) {
  res.redirect("/");
});

const { botManager } = require("./Bot/Bot");
const { servicesManager } = require("./services/services");

botManager(process.env.BOTS);
servicesManager();

server.listen(port, process.env.IP, () => {
  console.log(`Server running ${port}`);
});
