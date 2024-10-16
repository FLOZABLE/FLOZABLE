const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const {
  cacheExtensionToken,
} = require("../services/redisLoader");
const { DateTime } = require("luxon");
const {
  validateURL,
  validateOption,
} = require("../Utils/validate");
const { RESPONSE_CODES } = require("../Constant");
const { extensionIo } = require("../sockets/io");
const { autoSignin } = require("./auth");

Router.post("/auth", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const token = await cacheExtensionToken(userId);
      if (!token) {
        return res.send(RESPONSE_CODES["error"]);
      }
      res.send({ success: true, userId, token });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES["error"]);
    }
  });
});

Router.get("/settings", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      const [websiteSettings] = await connection.query(
        `SELECT website, block, study_block, timer, study_timer FROM website_settings WHERE user_id = ?`,
        [userId]
      );

      res.send({
        success: true,
        websiteSettings,
      });
    } catch (err) {
      console.log(err);
      res.send({ success: false, reason: "err" });
    }
  });
});

Router.put("/setting", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      const { url } = req.body;

      const isValidURL = validateURL(url);

      if (!isValidURL.isValid) {
        return res.send({ success: false, reason: isValidURL.reason });
      }

      const { domain, origin } = isValidURL;

      if (domain.includes("flozable")) {
        return res.send({ success: false, reason: `FLOZABLE can't be added` });
      }

      const setting = {
        website: url,
        block: 0,
        study_block: 0,
        timer: 0,
        study_timer: 1,
      };

      try {
        await connection.query(
          `
          INSERT INTO website_settings
          SET ?
          `,
          [{ ...setting, user_id: userId }]
        );
      } catch (err) {
        console.log(err);
        if (err.code === "ER_DUP_ENTRY") {
          return res.send({
            success: false,
            reason: "Already existing website",
          });
        }
      }
      extensionIo.to(userId).emit("setting-updated", setting);
      res.send({
        success: true,
        origin: origin,
        domain: domain,
        setting,
        msg: `Added ${domain}`,
      });
    } catch (error) {
      console.log(error);
      res.send({ success: false, reason: "Invalid URL or Domain" });
    }
  });
});

Router.patch("/setting", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { website, mode, value } = req.body;

      const isValidMode = validateOption(mode, "mode", [
        "block",
        "study_block",
        "timer",
        "study_timer",
      ]);

      if (!isValidMode.isValid) {
        return res.send({ success: false, reason: isValidMode.reason });
      }

      const setting = {
        [mode]: value ? 1 : 0,
      };

      const connection = await pool.promise();

      await connection.query(
        `
        UPDATE website_settings SET ?
        WHERE user_id = ? AND website = ?
      `,
        [setting, userId, website]
      );
      res.send({ success: true, msg: "Setting updated!" });
      extensionIo.to(userId).emit("setting-updated", { ...setting, website });
    } catch (error) {
      console.log(error);
      res.send({ success: false, reason: "Invalid URL or Domain" });
    }
  });
});

Router.get("/usage", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const allVisits = await redisClient.zrange(
        `user:${userId}:websites:visits`,
        0,
        -1,
        "WITHSCORES"
      );

      const allDurations = await redisClient.zrange(
        `user:${userId}:websites:duration`,
        0,
        -1,
        "WITHSCORES"
      );
      const usage = [];
      for (let i = 0; i < allVisits.length; i += 2) {
        const website = allVisits[i];
        const visits = parseInt(allVisits[i + 1])
          ? parseInt(allVisits[i + 1])
          : 0;
        const durationIndex =
          allDurations.findIndex((val) => val === website) + 1;
        const duration = parseInt(allDurations[durationIndex])
          ? parseInt(allDurations[durationIndex])
          : 0;

        usage.push({
          website,
          visits,
          duration,
        });
      }

      res.send({ success: true, usage });
    } catch (err) {
      console.log(err);
      res.send(RESPONSE_CODES["error"]);
    }
  });
});

module.exports = Router;
