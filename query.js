const pool = require('./model/pool');

//these functions are only used for initializing the database (used only once)


function createUsersTable() {
  const connection = pool.promise();
  connection.query(`
  CREATE TABLE users (
    users_id INT(255) AUTO_INCREMENT PRIMARY KEY, 
    user_id VARCHAR(20),
    name VARCHAR(20), 
    email VARCHAR(30), 
    hashed_password VARCHAR(100), 
    salt VARCHAR(100), 
    myinfo VARCHAR(300), 
    \`groups\` VARCHAR(700) default '', 
    external_user_id VARCHAR(30),
    timezone VARCHAR(25),
    datum_point INT(11),
    activity TEXT,
    activity_setting TEXT DEFAULT '',
    language VARCHAR(15) DEFAULT 'English',
    notification_setting TEXT,
    key_salt VARCHAR(64),
    iv VARCHAR(32),
    subscription TINYINT(1) DEFAULT 0,
    type SMALLINT DEFAULT 0
  )
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
    group_id VARCHAR(10),
    name VARCHAR(30),
    chats JSON,
    type TINYINT DEFAULT 0,
    members VARCHAR(300) DEFAULT  '*'
  );  
  `);
};

module.exports = {createUsersTable, createSubjectsTable, createGroupsTable, createPlansTable, createChatroomsTable};