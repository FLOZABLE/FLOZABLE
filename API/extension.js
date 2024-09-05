const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const {
  websiteUsageCache,
  cacheExtensionToken,
} = require("../services/redisLoader");
const { DateTime } = require("luxon");
const {
  validateStrictString,
  validateISO,
  validateURL,
  validateOption,
} = require("../Utils/validate");
const { RESPONSE_CODES } = require("../Constant");
const { extensionIo } = require("../sockets/extensionIo");
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

Router.get("/tabs", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    const tabsTimer = await redisClient.zrange(
      `user:${userId}:tabs:timer`,
      0,
      -1
    );
    const tabsUsage = await redisClient.zrange(
      `user:${userId}:tabs:usage`,
      0,
      -1,
      "WITHSCORES"
    );
    const tabs = {};
    tabsTimer.map((tab) => {
      const usageCount = tabsUsage.find(
        (usageTab) => usageTab.value === tab.value
      );
      tabs[tab.value] = {
        usageCount: usageCount ? usageCount.score : 0,
        totalTime: tab.score,
      };
    });
    res.send({ success: true, tabs });
  });
});

Router.get("/usage", async (req, res) => {
  autoSignin(
    req,
    res,
    async (userId, timezone) => {
      try {
        const { date, mode } = req.query;
        const isValidDate = validateISO(date, "date", 20);

        if (!isValidDate.isValid) {
          return res.send({ success: false, reason: isValidDate.reason });
        }

        const isValidMode = validateStrictString(mode, "mode", 10);

        if (!isValidMode.isValid) {
          return res.send({ success: false, reason: isValidMode.reason });
        }

        const viewDateTime = DateTime.fromISO(date)
          .setZone(timezone)
          .startOf("day");
        const todayDateTime = DateTime.now().setZone(timezone).startOf("day");

        const websitesUsage = {};
        const selectedDates = [];
        if (mode === "Monthly") {
          const scopeStart = viewDateTime.startOf("month");
          for (let i = 0; i < scopeStart.daysInMonth; i++) {
            const now = scopeStart.plus({ day: i });
            //today
            if (now.equals(todayDateTime)) {
              const websiteUsage = await websiteUsageCache(userId);
              websiteUsage.map(({ d, t, v }) => {
                if (websitesUsage[d]) {
                  websitesUsage[d].t += t;
                  websitesUsage[d].v += v;
                } else {
                  websitesUsage[d] = { t, v };
                }
              });
              continue;
            }
            //not today
            selectedDates.push(now.toFormat("M/d/yyyy"));
          }
        } else if (mode === "Weekly") {
          const scopeStart = viewDateTime.startOf("week");
          for (let i = 0; i < 7; i++) {
            const now = scopeStart.plus({ day: i });
            //today
            if (now.equals(todayDateTime)) {
              const websiteUsage = await websiteUsageCache(userId);
              websiteUsage.map(({ d, t, v }) => {
                if (websitesUsage[d]) {
                  websitesUsage[d].t += t;
                  websitesUsage[d].v += v;
                } else {
                  websitesUsage[d] = { t, v };
                }
              });
              continue;
            }
            //not today
            selectedDates.push(now.toFormat("M/d/yyyy"));
          }
        } else {
          if (viewDateTime.equals(todayDateTime)) {
            const websiteUsage = await websiteUsageCache(userId);
            websiteUsage.map(({ d, t, v }) => {
              if (websitesUsage[d]) {
                websitesUsage[d].t += t;
                websitesUsage[d].v += v;
              } else {
                websitesUsage[d] = { t, v };
              }
            });
          } else {
            //not today
            selectedDates.push(viewDateTime.toFormat("M/d/yyyy"));
          }
        }

        if (selectedDates.length) {
          const connection = pool.promise();

          const [websiteStats] = await connection.query(
            `SELECT data FROM activities WHERE user_id = ? AND date IN (?)`,
            [userId, selectedDates]
          );
          websiteStats.map(({ data }) => {
            const websiteData = JSON.parse(
              data.replace(/^/, "[").replace(/$/, "]")
            );
            websiteData.map(({ d, t, v }) => {
              if (websitesUsage[d]) {
                websitesUsage[d].t += t;
                websitesUsage[d].v += v;
              } else {
                websitesUsage[d] = { t, v };
              }
            });
          });
        }

        return res.send({
          success: true,
          websites: Object.keys(websitesUsage).map((d) => {
            return { d, ...websitesUsage[d] };
          }),
        });
      } catch (err) {
        console.log(err);
        return res.send({ success: false });
      }
    },
    undefined,
    true
  );
});

module.exports = Router;
