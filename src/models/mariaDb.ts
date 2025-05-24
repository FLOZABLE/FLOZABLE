import mysql from 'mysql2/promise';
import config from '../config/config';

const pool = mysql.createPool({
  host: config.mariaHost,
  user: config.mariaUser,
  password: config.mariaPassword,
  database: config.mariaDatabase,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
