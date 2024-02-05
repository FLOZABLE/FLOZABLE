const mysql = require("mysql2");

const database_info = JSON.parse(process.env.DATABASE);
const pool = mysql.createPool({
  host: database_info.host,
  user: database_info.user,
  password: database_info.password,
  database: database_info.name,
  connectTimeout : 10000,
  multipleStatements: true,
  connectionLimit: 100,
  waitForConnections: true,
  debug: false,
  charset: 'utf8mb4',
});

module.exports = pool;