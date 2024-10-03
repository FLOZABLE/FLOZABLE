const redisClient = require("../model/redis");
const pool = require("../model/pool");
const { getMidnightTimezones } = require("../Utils/tool");

async function extensionManager() {
  try {
    const midnightTimezones = getMidnightTimezones();
    const connection = pool.promise();

    const [users] = await connection.query(
      `
      SELECT user_id FROM users WHERE timezone IN (?)
      `,
      [midnightTimezones]
    );
    console.log(users);
    users.map(async ({ user_id }) => {
      redisClient.del(`user:${user_id}:websites:visits`);
      redisClient.del(`user:${user_id}:websites:duration`);
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  extensionManager,
};
