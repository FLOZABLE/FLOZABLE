const express = require("express");
const { autoSignin } = require("../Utils/tool");
const { validateStrictString } = require("../Utils/validate");
const redisClient = require("../model/redis");
const Router = express.Router();

Router.post("/read", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { notificationId } = req.body;

      const isValidNotificationId = validateStrictString(
        notificationId,
        "notification id",
        5
      );

      if (!isValidNotificationId.isValid) {
        return res.send({
          success: false,
          reason: isValidNotificationId.reason,
        });
      }

      redisClient.hdel(`user:${userId}:notifications`, notificationId);
      res.send({ success: true });
    } catch (error) {
      console.log(error);
      res.send({ success: false, reason: "An Error Occured" });
    }
  });
});

module.exports = Router;
