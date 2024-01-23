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
    email VARCHAR(30), 
    hashed_password VARCHAR(100), 
    salt VARCHAR(100), 
    myinfo VARCHAR(300), 
    \`groups\` VARCHAR(700) default '', 
    external_user_id VARCHAR(30),
    timezone VARCHAR(40),
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
    themes VARCHAR(300) DEFAULT ''
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

module.exports = { createUsersTable, createSubjectsTable, createGroupsTable, createPlansTable, createChatroomsTable, createDailyRankingTable, createWeeklyRankingTable, createMonthlyRankingTable, createChallengesTable, groupsChatRoomsGeneration, createChallengeRoomsTable, createThemesTable, createActivitiesTable };