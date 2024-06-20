const express = require('express');
const { autoSignin } = require('../tool');
const { validateStrictString } = require('../validate');
const { NotificationCache } = require('../services/redisLoader');
const Router = express.Router();

Router.post("/read", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { targetId } = req.body;

      const isValidTargetId = validateStrictString(targetId, "user id", 10);

      if (!isValidTargetId.isValid) {
        return res.send({ success: false, reason: isValidTargetId.reason });
      }

      const friendRequests = await NotificationCache(userId, 1, false);
      const friendReq = friendRequests.find((friendReq) => {
        return friendReq.f === targetId;
      });
      if (!friendReq)
        return res.send({ success: false, reason: "no request found" });
      redisClient.sRem(
        `user:${userId}:notifications`,
        JSON.stringify(friendReq)
      );
      res.send({ success: true });
    } catch (error) {
      console.log(error);
      res.send({ success: false, reason: "An Error Occured" });
    }
  });
});

module.exports = Router;