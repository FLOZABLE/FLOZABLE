const pool = require("./model/pool");

async function updateUserIds() {
  const connection = pool.promise();

  const [users] = await connection.query(`SELECT name, user_id, groups FROM users WHERE type = 0`);
  console.log(users);
  users.map(async (user) => {
    const userId = user.user_id;
    const newUserId = userId.slice(0, 10);
    await connection.query(`UPDATE subjects SET user_id = ? WHERE user_id = ?`, [newUserId, userId]);
    await connection.query(`UPDATE plans SET user_id = ? WHERE user_id = ?`, [newUserId, userId]);
    const groups = user.groups === "" ? [] : user.groups.split(",");
    groups.map(async (groupId) => {
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

module.exports = { updateUserIds };