const pool = require("../model/pool");
const { generateRandomId } = require("./tool");

//these async functions are only used for initializing the database (used only once)

async function createUsersTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE IF NOT EXISTS  users (
    users_id INT(255) AUTO_INCREMENT PRIMARY KEY, 
    user_id VARCHAR(20),
    name VARCHAR(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;, 
    email VARCHAR(60) DEFAULT '',
    hashed_password VARCHAR(100), 
    salt VARCHAR(100), 
    \`groups\` VARCHAR(700) default '', 
    timezone VARCHAR(40) DEFAULT '',
    datum_point INT(11),
    activity_setting TEXT DEFAULT '',
    notification_setting TEXT,
    key_salt VARCHAR(64),
    iv VARCHAR(32),
    subscription TINYINT(1) DEFAULT 0,
    type SMALLINT DEFAULT 0,
    friends VARCHAR(200) DEFAULT '',
    google_refresh_token VARCHAR(150),
    themes VARCHAR(300) DEFAULT '',
    notification_endpoint VARCHAR(500),
    notification_keys VARCHAR(500)
  );
  `);
}

async function createSubjectsTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE IF NOT EXISTS  subjects (
    id CHAR(10) PRIMARY KEY,
    name CHAR(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    user_id CHAR(15),
    icon CHAR(20),
    color CHAR(7),
    datum_point INT,
    timeline text default ''
  );  
  `);
}

async function createGroupsTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE IF NOT EXISTS  \`groups\` (
  group_id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50),
  leader VARCHAR(50),
  visibility SMALLINT DEFAULT 1,
  password VARCHAR(255) DEFAULT NULL,
  salt VARCHAR(100) DEFAULT NULL,
  explanation VARCHAR(300),
  date VARCHAR(30),
  members VARCHAR(700) DEFAULT '',
  max_members SMALLINT,
  tags VARCHAR(300),
  color VARCHAR(20),
  average_hr SMALLINT DEFAULT 0,
  goal_hr SMALLINT,
  likes VARCHAR(300) DEFAULT ''
);
  `);
}

async function createPlansTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE IF NOT EXISTS  plans (
    id VARCHAR(10),
    user_id VARCHAR(30),
    title VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;,
    start INT,
    end INT,
    \`repeat\` TINYINT UNSIGNED,
    description VARCHAR(700) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;,
    notification TINYINT SIGNED,
    subject VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;,
    priority TINYINT UNSIGNED,
    completed TINYINT DEFAULT 0
  );
  `);
}

async function createChatroomsTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE IF NOT EXISTS  chatrooms (
    id VARCHAR(10),
    chats TEXT DEFAULT '',
    type TINYINT DEFAULT 0,
    members VARCHAR(300) DEFAULT ''
  );  
  `);
}

async function createDailyRankingTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE IF NOT EXISTS  dailyRanking (
    date INT(11),
    ranking TEXT DEFAULT ''
  );  
  `);
}

async function createWeeklyRankingTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE IF NOT EXISTS  weeklyRanking (
    date INT(11),
    ranking TEXT DEFAULT ''
  );  
  `);
}

async function createMonthlyRankingTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE IF NOT EXISTS  monthlyRanking (
    date INT(11),
    ranking TEXT DEFAULT ''
  );  
  `);
}

async function createDevicesTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE IF NOT EXISTS  devices (
    device_id varchar(10),
    last_auth INT(11), 
    name varchar(30), 
    brand varchar(30), 
    auth_key varchar(20), 
    user_id varchar(20)
    );
  `);
}

async function groupsChatRoomsGeneration() {
  const connection = pool.promise();
  const [groups] = await connection.query(`SELECT group_id FROM groups`);
  groups.map(async (group) => {
    const roomInfo = {
      id: generateRandomId(10),
    };
    connection.query(`INSERT INTO chatrooms SET ?`, roomInfo);
  });
}

async function createThemesTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE IF NOT EXISTS  themes (
    id VARCHAR(10),
    user_id VARCHAR(20),
    likes VARCHAR(300) DEFAULT '',
    video_id VARCHAR(11),
    name VARCHAR(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;,
    description VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;,
    tags VARCHAR(300) DEFAULT ''
  );  
  `);
}

async function createActivitiesTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE IF NOT EXISTS  activities (
    user_id VARCHAR(20),
    date VARCHAR(10),
    data TEXT DEFAULT ''
  );
  `);
}

module.exports = {
  createUsersTable,
  createSubjectsTable,
  createGroupsTable,
  createPlansTable,
  createChatroomsTable,
  createDailyRankingTable,
  createWeeklyRankingTable,
  createMonthlyRankingTable,
  createDevicesTable,
  groupsChatRoomsGeneration,
  createThemesTable,
  createActivitiesTable,
};
