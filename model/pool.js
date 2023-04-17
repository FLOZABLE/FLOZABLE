const mysql = require("promise-mysql");
const database_info = JSON.parse(process.env.DATABASE);
const pool = mysql.createPool({
  host: database_info.host,
  user: database_info.user,
  password: database_info.password,
  database: database_info.name,
  acquireTimeout : 30000,
  connectTimeout : 10000,
  multipleStatements: true,
  connectionLimit: 100,
  waitForConnections: true,
});

module.exports = pool;