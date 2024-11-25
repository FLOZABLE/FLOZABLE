const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.MARIA_HOST,
  user: process.env.MARIA_USER,
  password: process.env.MARIA_PASSWORD,
  database: process.env.MARIA_DATABASE,
  connectTimeout: 10000,
  multipleStatements: true,
  connectionLimit: 100,
  waitForConnections: true,
  debug: false,
  charset: "utf8mb4",
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
});

/* pool.on("connection", (conn) => {
  console.log("New connection created");
});

pool.on("release", (conn) => {
  console.log("Connection released back to pool");
}); */

module.exports = pool;
