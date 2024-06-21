const {
  createUsersTable,
  createSubjectsTable,
  createGroupsTable,
  createPlansTable,
  createChatroomsTable,
  createDailyRankingTable,
  createWeeklyRankingTable,
  createMonthlyRankingTable,
  createThemesTable,
  createActivitiesTable,
  createDevicesTable,
} = require("../Utils/query");
const pool = require("../model/pool");

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
    await createGroupsTable();
    await createPlansTable();
    await createChatroomsTable();
    await createDailyRankingTable();
    await createWeeklyRankingTable();
    await createMonthlyRankingTable();
    await createThemesTable();
    await createActivitiesTable();
    await createDevicesTable();

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
        MODIFY COLUMN subject VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

      ALTER TABLE plans
        ADD COLUMN IF NOT EXISTS share VARCHAR(100) DEFAULT "";

      ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS stripe_id VARCHAR(30);

      ALTER TABLE users 
        DROP COLUMN IF EXISTS myinfo,
        DROP COLUMN IF EXISTS external_user_id,
        DROP COLUMN IF EXISTS activity,
        DROP COLUMN IF EXISTS language,
        DROP COLUMN IF EXISTS private;

      ALTER TABLE users 
        MODIFY COLUMN activity_setting VARCHAR(500) DEFAULT "{}";

      ALTER TABLE subjects 
        MODIFY COLUMN name CHAR(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

      ALTER TABLE subjects
        ADD COLUMN IF NOT EXISTS share VARCHAR(100) DEFAULT "";

      ALTER TABLE themes 
        MODIFY COLUMN name VARCHAR(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        MODIFY COLUMN description VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

      UPDATE users SET activity_setting = "{}"
    `);

    await connection.query(
      `UPDATE versions SET version = 7 WHERE name = "Mariadb"`
    );

    console.log("Applied mariadb v7");
  } catch (err) {
    console.log(err);
  }
}

module.exports = { updateManager };
