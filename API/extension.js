const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { autoSignin, generateRandomId } = require("../Utils/tool");
const { websiteUsageCache } = require("../services/redisLoader");
const { DateTime } = require("luxon");
const {
  validateStrictString,
  validateISO,
  validateURL,
} = require("../Utils/validate");
const { responseCodes } = require("../Constant");
const { extensionIo } = require("../sockets/extensionIo");

Router.post("/auth", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    const authId = generateRandomId(10);
    await redisClient.setex(`extension:auth:${authId}`, 10, userId);
    return res.send({ success: true, authId });
  });
});

Router.get("/settings", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const connection = pool.promise();
      const [[userInfo]] = await connection.query(
        `SELECT activity_setting FROM users WHERE user_id = ?`,
        [userId]
      );
      if (!userInfo)
        return res.send({ success: false, reason: "No such user" });
      const { activity_setting } = userInfo;
      res.send({
        success: true,
        activity_setting: JSON.parse(activity_setting),
      });
    } catch (err) {
      console.log(err);
      res.send({ success: false, reason: "err" });
    }
  });
});

Router.put("/settings", async (req, res) => {
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

      const [[userInfo]] = await connection.query(
        `SELECT activity_setting FROM users WHERE user_id = ?`,
        [userId]
      );

      if (!userInfo) res.send(responseCodes["no-user"]);
      const activitySettings = JSON.parse(userInfo.activity_setting);
      if (activitySettings[domain]) {
        return res.send({ success: false, reason: "Already Exist" });
      }

      //d: domain, b: block, t: timer
      activitySettings[domain] = {
        b: 0,
        bs: 0,
        t: 0,
        ts: 1,
      };

      await connection.query(
        `
      UPDATE users
      SET activity_setting = ?
      WHERE user_id = ?
    `,
        [JSON.stringify(activitySettings), userId]
      );
      extensionIo.to(userId).emit("setting-updated", activitySettings);
      res.send({
        success: true,
        origin: origin,
        domain: domain,
        msg: `Added ${domain}`,
      });
    } catch (error) {
      console.log(error);
      res.send({ success: false, reason: "Invalid URL or Domain" });
    }
  });
});

Router.patch("/settings", async (req, res) => {
  autoSignin(req, res, async (userId) => {
    try {
      const { d, target, value } = req.body;

      const connection = pool.promise();
      const [[userInfo]] = await connection.query(
        `SELECT activity_setting FROM users WHERE user_id = ?`,
        [userId]
      );
      if (!userInfo) return res.send(responseCodes["no-user"]);
      const activitySettings = JSON.parse(userInfo.activity_setting);

      if (!activitySettings[d]) {
        return res.send({ success: false, reason: "No Matching Website" });
      }

      //d: domain, b: block, t: timer
      if (target === "block") {
        activitySettings[d] = {
          ...activitySettings[d],
          b: value ? 1 : 0,
        };
      } else if (target === "blockstudy") {
        activitySettings[d] = {
          ...activitySettings[d],
          bs: value ? 1 : 0,
        };
      } else if (target === "timer") {
        activitySettings[d] = {
          ...activitySettings[d],
          t: value ? 1 : 0,
        };
      } else {
        activitySettings[d] = {
          ...activitySettings[d],
          ts: value ? 1 : 0,
        };
      }

      await connection.query(
        `
              UPDATE users
              SET activity_setting = ?
              WHERE user_id = ?
            `,
        [JSON.stringify(activitySettings), userId]
      );

      res.send({ success: true, msg: "Setting updated!" });
      extensionIo.to(userId).emit("setting-updated", activitySettings);
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
      -1,

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
