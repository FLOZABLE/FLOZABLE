const dotenv = require("dotenv");

if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: "../.env.development" });
} else if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: "../.env.production" });
} else {
  dotenv.config({ path: "../.env.test" });
}

const {
  createUsersTable,
  createSubjectsTable,
  createSubjectShareTable,
  createSubjectSharedTable,
  createSubjectTimelinesTable,
  createGroupsTable,
  createGroupMembersTable,
  createFriendsTable,
  createPlansTable,
  createChatroomsTable,
  createChatroomMembersTable,
  createChatroomMessagesTable,
  createRankingTable,
  createRankingDetailsTable,
  createDevicesTable,
  createThemesTable,
  createUserThemesTable,
  createGroupLikesTable,
  createPlanShare,
  createPlanShared,
  createThemeLikesTable,
  createWebsiteSettingsTable,
  createWebsiteUsageTable,
} = require("../Utils/query");
const pool = require("../model/pool");

const prompt = require("prompt-sync")({ sigint: true });

async function updateManager() {
  const connection = pool.promise();

  try {
    //make sure table exists
    /* await connection.query(`CREATE TABLE  IF NOT EXISTS  versions (maria_db SMALLINT DEFAULT 6)`); */
    const [versions] = await connection.query(`SELECT * FROM versions`);

    console.log(versions);

    //sync mariadb
    const mariadbVersion = versions.find(
      (version) => version.name === "Mariadb"
    );

    if (mariadbVersion.version === 0) {
      await initializeMariadb();
    }

    //await mariadbV7();
    await mariadbV7_1(true, true);
    if (mariadbVersion.version < 7) {
      await mariadbV7();
    }
  } catch (err) {
    if (err?.code && err.code === "ER_NO_SUCH_TABLE") {
      await connection.query(
        `CREATE TABLE versions (name VARCHAR(10), version SMALLINT DEFAULT 0)`
      );
      await connection.query(`INSERT INTO versions SET ?`, {
        name: "Mariadb",
        version: 6,
      });
      updateManager();
    }
    console.log(err.code);
  }
}

async function initializeMariadb() {
  try {
    await createUsersTable();
    await createSubjectsTable();
    await createSubjectShareTable();
    await createSubjectSharedTable();
    await createSubjectTimelinesTable();
    await createGroupsTable();
    await createGroupMembersTable();
    await createGroupLikesTable();
    await createFriendsTable();
    await createPlansTable();
    await createPlanShare();
    await createPlanShared();
    await createChatroomsTable();
    await createChatroomMembersTable();
    await createChatroomMessagesTable();
    await createRankingTable();
    await createRankingDetailsTable();
    await createDevicesTable();
    await createThemesTable();
    await createThemeLikesTable();
    await createUserThemesTable();
    await createWebsiteSettingsTable();
    await createWebsiteUsageTable();

    console.log("Initialized mariadb");
  } catch (err) {
    console.log(err);
  }
}

/**
 * removed challengerooms/challenges table
 * added stripe
 * deprecated myinfo, external_user_id, activitym language, private from users table
 * modified default value for activity_setting of users table
 * deprecated timeline_sum from users table
 * modify character for name of users
 *
 * deprecated font from groups table
 *
 * add shared column for plans
 * motify character for title, description, subject of plans
 *
 * modify character for name of subjects
 * add shared column for subjects
 *
 * modify character for name, description of themes
 *
 * update all the activity_settings to {}
 */
async function mariadbV7() {
  try {
    const connection = pool.promise();

    await connection.query(`
      ALTER TABLE plans 
        MODIFY COLUMN title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        MODIFY COLUMN description VARCHAR(700) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        MODIFY COLUMN subject VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        
        ADD COLUMN IF NOT EXISTS share VARCHAR(100) DEFAULT "",
        ADD COLUMN IF NOT EXISTS shared VARCHAR(100) DEFAULT "";

      ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS stripe_id VARCHAR(30),

      ALTER TABLE users 
        DROP COLUMN IF EXISTS myinfo,
        DROP COLUMN IF EXISTS external_user_id,
        DROP COLUMN IF EXISTS activity,
        DROP COLUMN IF EXISTS language,
        DROP COLUMN IF EXISTS private,
        DROP COLUMN IF EXISTS users_id;

      ALTER TABLE users 
        MODIFY COLUMN activity_setting VARCHAR(500) DEFAULT "{}",
        MODIFY COLUMN user_id VARCHAR(10) NOT NULL PRIMARY KEY;

      ALTER TABLE subjects 
        MODIFY COLUMN name CHAR(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,

        ADD COLUMN IF NOT EXISTS share VARCHAR(100) DEFAULT "",
        ADD COLUMN IF NOT EXISTS shared VARCHAR(100) DEFAULT "";

      ALTER TABLE groups
        MODIFY COLUMN group_id VARCHAR(10) NOT NULL;

      ALTER TABLE themes 
        MODIFY COLUMN name VARCHAR(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        MODIFY COLUMN description VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

      UPDATE users SET activity_setting = "{}";
    `);

    await connection.query(
      `UPDATE versions SET version = 7 WHERE name = "Mariadb"`
    );

    console.log("Applied mariadb v7");
  } catch (err) {
    console.log(err);
  }
}

/**
 * database normalization
 */
async function mariadbV7_1(updateFriends, updateGroups) {
  try {
    const connection = pool.promise();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS group_members (
        user_id VARCHAR(10) NOT NULL,
        group_id VARCHAR(10) NOT NULL,
        PRIMARY KEY (user_id, group_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (group_id) REFERENCES groups(group_id)
      );

      CREATE TABLE IF NOT EXISTS friends (
        user_id VARCHAR(10) NOT NULL,
        friend_id VARCHAR(10) NOT NULL,
        PRIMARY KEY (user_id, friend_id),
        CHECK (user_id < friend_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (friend_id) REFERENCES users(user_id)
      );

      CREATE TABLE IF NOT EXISTS  timelines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject_id INT NOT NULL, -- assuming there's a subject table
        start_time INT NOT NULL,
        stop_time INT NOT NULL,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) -- adjust as necessary
      );
    `);

    const [users] = await connection.query(
      `SELECT user_id, friends, groups FROM users`
    );

    if (updateFriends) {
      const friends = [];
      users.map((user, i) => {
        if (user.friends !== "") {
          //if (friends.find(existingFriend => JSON.stringify(existingFriend) === JSON.stringify([friend, user.user_id]))) return;
          const filteredFriends = [...new Set(user.friends.split(","))].filter(
            (friend) => {
              const isIn = friends.find(
                (existingFriend) =>
                  JSON.stringify(existingFriend) ===
                  JSON.stringify([friend, user.user_id])
              );
              const isExist = users.find((user) => user.user_id === friend);
              return !isIn && isExist;
            }
          );
          friends.push(
            ...filteredFriends.map((friend) =>
              user.user_id > friend
                ? [user.user_id, friend]
                : [friend, user.user_id]
            )
          );
        }
      });

      console.log(friends.length, JSON.stringify(friends));
      let iteration = 0;
      while (friends.slice(iteration * 30, (iteration + 1) * 30).length) {
        await connection.query(
          `INSERT INTO friends (user_id, friend_id) VALUES ?`,
          [friends.slice(iteration * 30, (iteration + 1) * 30)]
        );
        iteration += 1;
      }

      /* await connection.query(
        `INSERT INTO friends (user_id, friend_id) VALUES ?`,
        [friends]
      ); */

      console.log(`finished friends migration ${friends.length}`);
    }

    if (updateGroups) {
      const [groups] = await connection.query(
        `SELECT members, group_id FROM groups`
      );

      const groupMembers = [];

      groups.map((group) => {
        if (group.members === "") return;

        groupMembers.push(
          ...group.members.split(",").map((userId) => [userId, group.group_id])
        );
      });

      await connection.query(
        `INSERT INTO user_groups (user_id, group_id) VALUES ?`,
        [groupMembers]
      );

      console.log(`finished groups migration ${groupMembers.length}`);
    }
  } catch (err) {
    console.log(err);
  }
}

(async () => {
  const command = prompt(`
    type command
    1)auto
    2)maria:VERSION_NAME
  
    `);
  /* if (command.includes("maria")) {
      const version = parseFloat(command.split(":")[1]);
      console.log(version)
    } */
  if (command === "maria:0") {
    await initializeMariadb();
  }
})();

module.exports = { updateManager };
