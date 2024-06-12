const pool = require("../model/pool");
const redisClient = require("../model/redis");

async function updateUserIds() {
  const connection = pool.promise();

  const [users] = await connection.query(`SELECT name, user_id, groups FROM users WHERE type = 0`);
  console.log(users);
  users.map(async (user) => {
    const userId = user.user_id;
    const newUserId = userId.slice(0, 10);
    await connection.query(`UPDATE subjects SET user_id = ? WHERE user_id = ?`, [newUserId, userId]);
    await connection.query(`UPDATE plans SET user_id = ? WHERE user_id = ?`, [newUserId, userId]);
    user.groups.map(async (groupId) => {
      const [[group]] = await connection.query(`SELECT members, group_id FROM groups WHERE group_id = ?`, [groupId]);
      if (group) {
        const members = group.members === "" ? [] : group.members.split(",");
        const userIndex = members.findIndex(member => member === userId);
        if (userIndex !== -1) {
          members[userIndex] = newUserId;
          await connection.query(
            `UPDATE \`groups\` SET members = ? WHERE group_id = ?`,
            [members.join(","), group.group_id]
          );
        }
      }
    });
    await connection.query(`UPDATE users SET user_id = ? WHERE user_id = ?`, [newUserId, userId]);
  })
};

async function removeDupedFriends() {
  const connection = pool.promise();

  const [users] = await connection.query(`SELECT friends, user_id FROM users`);

  users.map(user => {
    const uniqFriends = [...new Set(user.friends)];
    if (uniqFriends.length !== user.friends.length) {
      console.log('dupe detected')
      const stringFriends = uniqFriends.join(',');
      redisClient.hSet(`user:${user.user_id}`, 'friends', stringFriends);
      connection.query(`UPDATE users set friends = ? WHERE user_id = ?`, [stringFriends, user.user_id]);
    }
  })
};

module.exports = { updateUserIds, removeDupedFriends };