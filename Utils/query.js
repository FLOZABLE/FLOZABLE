const pool = require("../model/pool");

//these async functions are only used for initializing the database (used only once)

async function createUsersTable() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(10) NOT NULL PRIMARY KEY,
    name VARCHAR(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    email VARCHAR(60) DEFAULT '',
    timezone VARCHAR(40) DEFAULT '',
    created_at INT(10),
    type SMALLINT DEFAULT 0,
    key_salt VARCHAR(64),
    hashed_password VARCHAR(64), 
    salt VARCHAR(64), 
    iv VARCHAR(32),
    subscription TINYINT(1) DEFAULT 0,
    google_refresh_token VARCHAR(150),
    notification_endpoint VARCHAR(256),
    notification_keys VARCHAR(150),
    stripe_id VARCHAR(25),
    spotify_refresh_token varchar(150),
    verified TINYINT(1) DEFAULT 0
  );
  `);
}

async function createSubjectsTable() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS subjects (
    subject_id VARCHAR(10) NOT NULL,
    name VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    user_id VARCHAR(10) NOT NULL,
    icon VARCHAR(20),
    color VARCHAR(7),
    created_at INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    PRIMARY KEY (subject_id),
    UNIQUE (user_id, name)
  );  
  `);
}

async function createSubjectShareTable() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS subject_share (
    subject_id VARCHAR(10),
    user_id VARCHAR(10),
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    PRIMARY KEY (subject_id, user_id)
  );  
  `);
}

async function createSubjectSharedTable() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS subject_shared (
    subject_id VARCHAR(10),
    user_id VARCHAR(10),
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    PRIMARY KEY (subject_id, user_id)
  );  
  `);
}

async function createSubjectTimelinesTable() {
  const connection = pool.promise();
  await connection.query(`
    CREATE TABLE IF NOT EXISTS subject_timelines (
      subject_id VARCHAR(10),
      start_time INT NOT NULL,
      duration SMALLINT UNSIGNED NOT NULL,
      FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
    );
  `);
}

async function createGroupsTable() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS  \`groups\` (
    group_id VARCHAR(10) NOT NULL,
    name VARCHAR(50),
    leader VARCHAR(50),
    visibility SMALLINT DEFAULT 1,
    password VARCHAR(255) DEFAULT NULL,
    salt VARCHAR(100) DEFAULT NULL,
    description VARCHAR(300),
    created_at INT,
    max_members SMALLINT,
    tags VARCHAR(300),
    color VARCHAR(20),
    goal_hr SMALLINT,
    members_length SMALLINT unsigned,
    PRIMARY KEY (group_id)
  );
  `);
}

async function createGroupMembersTable() {
  const connection = pool.promise();
  await connection.query(`
    CREATE TABLE IF NOT EXISTS group_members (
      group_id VARCHAR(10) NOT NULL,
      user_id VARCHAR(10) NOT NULL,
      joined_at INT,
      PRIMARY KEY (user_id, group_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (group_id) REFERENCES groups(group_id)
    );
  `);
}

async function createGroupLikesTable() {
  const connection = pool.promise();
  await connection.query(`
    CREATE TABLE IF NOT EXISTS group_likes (
      group_id VARCHAR(10) NOT NULL,
      user_id VARCHAR(10) NOT NULL,
      PRIMARY KEY (user_id, group_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (group_id) REFERENCES groups(group_id)
    );
  `);
}

async function createFriendsTable() {
  const connection = pool.promise();
  await connection.query(`
    CREATE TABLE IF NOT EXISTS friends (
      user_id VARCHAR(10) NOT NULL,
      friend_id VARCHAR(10) NOT NULL,
      date INT,
      PRIMARY KEY (user_id, friend_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (friend_id) REFERENCES users(user_id)
    );
  `);
}

async function createPlansTable() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS plans (
    plan_id VARCHAR(10) NOT NULL PRIMARY KEY,
    user_id VARCHAR(10),
    subject_id VARCHAR(10),
    title VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    start INT,
    end INT,
    \`repeat\` TINYINT UNSIGNED,
    description VARCHAR(700) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    notification SMALLINT SIGNED,
    priority TINYINT UNSIGNED,
    completed TINYINT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
  );
  `);
}

async function createPlanShare() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS plan_share (
    plan_id VARCHAR(10),
    user_id VARCHAR(10),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id),
    PRIMARY KEY (plan_id, user_id)
  );
  `);
}

async function createPlanShared() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS plan_shared (
    plan_id VARCHAR(10),
    user_id VARCHAR(10),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id),
    PRIMARY KEY (plan_id, user_id)
  );
  `);
}

async function createChatroomsTable() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS chatrooms (
    chatroom_id VARCHAR(10) NOT NULL,
    name VARCHAR(50),
    type TINYINT DEFAULT 0,
    PRIMARY KEY(chatroom_id)
  );  
  `);
}

async function createChatroomMembersTable() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS chatroom_members (
    chatroom_id VARCHAR(10),
    user_id VARCHAR(10),
    PRIMARY KEY (chatroom_id, user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (chatroom_id) REFERENCES chatrooms (chatroom_id)
  );  
  `);
}

async function createChatroomMessagesTable() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS chatroom_messages (
    message_id VARCHAR(8) NOT NULL,
    chatroom_id VARCHAR(10) NOT NULL,
    user_id VARCHAR(10),
    message VARCHAR(100),
    sent_at INT(10),
    PRIMARY KEY (message_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (chatroom_id) REFERENCES chatrooms (chatroom_id)
  );  
  `);
}

async function createRankingTable() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS rankings  (
    ranking_id VARCHAR(10) NOT NULL,
    date INT NOT NULL,
    timezone VARCHAR(40),
    mode VARCHAR(10) NOT NULL,
    length INT,
    PRIMARY KEY (ranking_id)
  );  
  `);
}

async function createRankingDetailsTable() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS ranking_details  (
    ranking_id VARCHAR(10),
    user_id VARCHAR(10),
    rank INT NOT NULL,
    study_time INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (ranking_id) REFERENCES rankings(ranking_id),
    PRIMARY KEY (ranking_id, user_id)
  );  
  `);
}

async function createDevicesTable() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS devices (
    device_id varchar(10),
    user_id varchar(10),
    last_auth INT(11), 
    name varchar(30), 
    brand varchar(30), 
    auth_key varchar(20), 
    PRIMARY KEY (device_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
  `);
}

async function createThemesTable() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS themes (
    theme_id VARCHAR(10) NOT NULL,
    user_id VARCHAR(20),
    video_id VARCHAR(11),
    name VARCHAR(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    description VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    tags VARCHAR(300) DEFAULT '',
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    PRIMARY KEY (theme_id)
  );  
  `);
}

async function createThemeLikesTable() {
  const connection = pool.promise();
  await connection.query(`
    CREATE TABLE IF NOT EXISTS theme_likes (
      theme_id VARCHAR(10) NOT NULL,
      user_id VARCHAR(10) NOT NULL,
      PRIMARY KEY (user_id, theme_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (theme_id) REFERENCES themes(theme_id)
    );
  `);
}

async function createUserThemesTable() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS user_themes (
    user_id VARCHAR(20),
    theme_id VARCHAR(10),
    category_id SMALLINT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (theme_id) REFERENCES themes(theme_id),
    PRIMARY KEY (user_id, theme_id)
  );  
  `);
}

async function createWebsiteSettingsTable() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS website_settings (
    user_id VARCHAR(10),
    website VARCHAR(20),
    block tinyint(1),
    study_block tinyint(1),
    timer tinyint(1),
    study_timer tinyint(1),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    PRIMARY KEY (user_id, website)
  );
  `);
}

async function createWebsiteUsageTable() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS website_usage (
    user_id VARCHAR(10),
    website VARCHAR(20),
    visits SMALLINT,
    duration SMALLINT,
    date VARCHAR(10),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    PRIMARY KEY (user_id, website)
  );
  `);
}

async function createProductsTable() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS products (
    product_id VARCHAR(30),
    price_id VARCHAR(30),
    cost SMALLINT UNSIGNED,
    \`interval\` VARCHAR(15),
    name VARCHAR(40),
    PRIMARY KEY (product_id, price_id)
  );
  `);
}

async function createPurchasesTable() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS purchases (
    purchase_id VARCHAR(30) PRIMARY KEY,
    user_id VARCHAR(10),
    price_id VARCHAR(30),
    product_id VARCHAR(30),
    purchased_at INT(10),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id, price_id) REFERENCES products(product_id, price_id)
  );
  `);
}

async function createNotificationsTable() {
  const connection = pool.promise();
  await connection.query(`
  CREATE TABLE IF NOT EXISTS notifications (
    notification_id VARCHAR(10) PRIMARY KEY,
    user_id VARCHAR(10),
    from_user_id VARCHAR(10),
    sent_at INT(10),
    message VARCHAR(300),
    type VARCHAR(20),
    related_id VARCHAR(10),

    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (from_user_id) REFERENCES users(user_id),

    UNIQUE KEY unique_type_specific (user_id, from_user_id, type, related_id)
  );

  `);
}

module.exports = {
  createUsersTable,
  createSubjectsTable,
  createSubjectShareTable,
  createSubjectSharedTable,
  createSubjectTimelinesTable,
  createGroupsTable,
  createGroupMembersTable,
  createGroupLikesTable,
  createFriendsTable,
  createPlansTable,
  createPlanShare,
  createPlanShared,
  createChatroomsTable,
  createChatroomMembersTable,
  createChatroomMessagesTable,
  createRankingTable,
  createRankingDetailsTable,
  createDevicesTable,
  createThemesTable,
  createThemeLikesTable,
  createUserThemesTable,
  createWebsiteSettingsTable,
  createWebsiteUsageTable,
  createProductsTable,
  createPurchasesTable,
  createNotificationsTable,
};
