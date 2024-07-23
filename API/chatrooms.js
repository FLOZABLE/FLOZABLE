const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const {
  autoSignin,
} = require("../Utils/tool");

Router.get("/", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    const connection = await pool.promise();
    const [chatrooms] = await connection.query(`
      SELECT
        c.chatroom_id,
        c.type,
        c.name,
        GROUP_CONCAT(cm.user_id) AS members
      FROM chatrooms c
      JOIN chatroom_members cm ON cm.chatroom_id = c.chatroom_id
      WHERE c.chatroom_id IN (
        SELECT chatroom_id FROM chatroom_members WHERE user_id = ?
      )
      GROUP BY c.chatroom_id

      UNION

      SELECT
        g.group_id AS chatroom_id,
        1 AS type,
        g.name,
        GROUP_CONCAT(gm.user_id) AS members
      FROM groups g
      JOIN group_members gm ON gm.group_id = g.group_id
      WHERE g.group_id IN (
        SELECT group_id FROM group_members WHERE user_id = ?
      )
      GROUP BY g.group_id;
    `, [userId, userId]);

    chatrooms.map(chatroom => {
      chatroom.members = chatroom.members === "" ? [] : chatroom.members.split(",");
    });

    console.log(chatrooms);
    res.send({success: true, chatrooms})
  });
});

module.exports = Router;
