const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { cacheExtensionToken } = require("../services/redisLoader");
const { validateURL, validateOption } = require("../utils/validate");
const { extensionIo } = require("../sockets/io");
const { autoSignin } = require("./auth");
const RESPONSE_MESSAGES = require("../utils/responses");

Router.post("/auth", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const token = await cacheExtensionToken(userId);
      if (!token) {
        const response = RESPONSE_MESSAGES.error();
        return res.status(response.status).send(response);
      }
      res
        .status(200)
        .send({ success: true, status: 200, data: { user_id: userId, token } });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
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

      res.status(200).send({
        success: true,
        status: 200,
        data: { settings: websiteSettings },
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
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
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidURL.reason,
          error: { reason: isValidURL.reason },
        });
      }

      const { domain, origin } = isValidURL;

      if (domain.includes("flozable")) {
        return res.status(400).send({
          success: false,
          status: 400,
          message: `FLOZABLE can't be added`,
          error: { reason: `FLOZABLE can't be added` },
        });
      }

      const setting = {
        website: isValidURL.domain,
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
          return res.status(400).send({
            success: false,
            status: 400,
            message: "Already existing website",
            error: { reason: "Already existing website" },
          });
        }
      }
      extensionIo.to(userId).emit("setting-updated", setting);
      res.status(200).send({
        success: true,
        status: 200,
        message: `Added ${domain}`,
        data: {
          origin: origin,
          domain: domain,
          setting,
        },
      });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
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
        return res.status(400).send({
          success: false,
          status: 400,
          message: isValidMode.reason,
          error: { reason: isValidMode.reason },
        });
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
      res.status(200).send({
        success: true,
        status: 200,
        message: "Setting updated!",
      });
      extensionIo.to(userId).emit("setting-updated", { ...setting, website });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
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

      res.status(200).send({ success: true, status: 200, data: { usage } });
    } catch (err) {
      console.log(err);
      const response = RESPONSE_MESSAGES.error();
      return res.status(response.status).send(response);
    }
  });
});

module.exports = Router;
