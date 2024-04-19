const pool = require('./model/pool');
const { generateRandomId } = require('./tool');

//these functions are only used for initializing the database (used only once)


function createUsersTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE users (
    users_id INT(255) AUTO_INCREMENT PRIMARY KEY, 
    user_id VARCHAR(20),
    name VARCHAR(40), 
    email VARCHAR(60) DEFAULT '',
    hashed_password VARCHAR(100), 
    salt VARCHAR(100), 
    myinfo VARCHAR(300), 
    \`groups\` VARCHAR(700) default '', 
    external_user_id VARCHAR(30),
    timezone VARCHAR(40) DEFAULT '',
    datum_point INT(11),
    activity TEXT,
    activity_setting TEXT DEFAULT '',
    language VARCHAR(15) DEFAULT 'English',
    notification_setting TEXT,
    key_salt VARCHAR(64),
    iv VARCHAR(32),
    subscription TINYINT(1) DEFAULT 0,
    type SMALLINT DEFAULT 0,
    private SMALLINT DEFAULT 0,
    friends VARCHAR(200) DEFAULT '',
    google_refresh_token VARCHAR(150),
    themes VARCHAR(300) DEFAULT '',
    notification_endpoint VARCHAR(500),
    notification_keys VARCHAR(500)
  );
  `);
};

function createSubjectsTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE subjects (
    id CHAR(10) PRIMARY KEY,
    name CHAR(30),
    user_id CHAR(15),
    icon CHAR(20),
    color CHAR(7),
    datum_point INT,
    timeline text default '',
    timeline_sum INT UNSIGNED default 0
  );  
  `);
};

function createGroupsTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE \`groups\` (
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
  likes VARCHAR(300) DEFAULT '',
  font SMALLINT
);
  `)
}

function createPlansTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE plans (
    id VARCHAR(10),
    user_id VARCHAR(30),
    title VARCHAR(100),
    start INT,
    end INT,
    \`repeat\` TINYINT UNSIGNED,
    description VARCHAR(700),
    notification TINYINT SIGNED,
    subject VARCHAR(10),
    priority TINYINT UNSIGNED,
    completed TINYINT DEFAULT 0
  );
  `);
}

function createChatroomsTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE chatrooms (
    id VARCHAR(10),
    chats TEXT DEFAULT '',
    type TINYINT DEFAULT 0,
    members VARCHAR(300) DEFAULT ''
  );  
  `);
};

function createDailyRankingTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE dailyRanking (
    date INT(11),
    ranking TEXT DEFAULT ''
  );  
  `);
};

function createWeeklyRankingTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE weeklyRanking (
    date INT(11),
    ranking TEXT DEFAULT ''
  );  
  `);
};

function createMonthlyRankingTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE monthlyRanking (
    date INT(11),
    ranking TEXT DEFAULT ''
  );  
  `);
};

function createChallengesTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE challenges (
    id VARCHAR(10),
    first_user_id VARCHAR(20),
    second_user_id VARCHAR(20),
    datum_point INT
  );
  `);
};

function createDevicesTable() {
  const connection = pool.promise();
  connection.query(`
  create table devices (
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
  })
};

function createChallengeRoomsTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE challengerooms (
    id VARCHAR(10),
    host_id VARCHAR(20),
    start_date INT,
    name VARCHAR(30),
    description VARCHAR(700)
  );
  `);
};

function createThemesTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE themes (
    id VARCHAR(10),
    user_id VARCHAR(20),
    likes VARCHAR(300) DEFAULT '',
    video_id VARCHAR(11),
    name VARCHAR(40),
    description VARCHAR(200),
    tags VARCHAR(300) DEFAULT ''
  );  
  `);
};

function createActivitiesTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE activities (
    user_id VARCHAR(20),
    date VARCHAR(10),
    data TEXT DEFAULT ''
  );
  `);
};

/**
 * convert columns to utf8mb4_unicode_ci
 */
async function utf8mb4Unicode() {
  const connection = pool.promise();
  await connection.query(`
  ALTER TABLE plans MODIFY COLUMN title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ALTER TABLE plans MODIFY COLUMN description VARCHAR(700) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ALTER TABLE plans MODIFY COLUMN subject VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

  ALTER TABLE users MODIFY COLUMN name VARCHAR(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

  ALTER TABLE subjects MODIFY COLUMN name char(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

  ALTER TABLE themes MODIFY COLUMN name varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ALTER TABLE themes MODIFY COLUMN description varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);

  console.log('migration complete');
}

module.exports = { createUsersTable, createSubjectsTable, createGroupsTable, createPlansTable, createChatroomsTable, createDailyRankingTable, createWeeklyRankingTable, createMonthlyRankingTable, createChallengesTable, createDevicesTable, groupsChatRoomsGeneration, createChallengeRoomsTable, createThemesTable, createActivitiesTable, utf8mb4Unicode };