const express = require("express");
const Router = express.Router();
const pool = require("../model/pool");
const redisClient = require("../model/redis");
const { autoSignin, arraysHaveSameContents, generateRandomId } = require("../tool");
const { userCache, websiteUsageCache } = require("../services/redisLoader");
const { DateTime } = require("luxon");

Router.post("/auth", async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    const authId = generateRandomId(10);
    redisClient.setEx(`extension:auth:${authId}`, 10, userId);
    return res.send({ success: true, authId });
  }));
});

Router.get("/today-tabs", async (req, res) => {
  autoSignin(req, res, (async () => {
    const userId = req.session.user_id;
    const tabsTimer = await redisClient.zRangeWithScores(`user:${userId}:tabs:timer`, 0, -1);
    const tabsUsage = await redisClient.zRangeWithScores(`user:${userId}:tabs:usage`, 0, -1);
    const tabs = {};
    tabsTimer.map(tab => {
      const usageCount = tabsUsage.find(usageTab => usageTab.value === tab.value);
      tabs[tab.value] = { usageCount: usageCount ? usageCount.score : 0, totalTime: tab.score };
    });
    res.send({ success: true, tabs });
  }));
});

Router.get("/tabs-settings", async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      if (!userId) return res.send({ success: false });
      const connection = pool.promise();
      const [[userInfo]] = await connection.query(`SELECT activity_setting FROM users WHERE user_id = ?`, [userId]);
      if (!userInfo) return res.send({ success: false, reason: 'No auth' });

      const tabSettings = userInfo.activity_setting === "" ? [] : JSON.parse(userInfo.activity_setting.replace(/^/, "[").replace(/$/, "]"));
      console.log(tabSettings)
      return res.send({ success: true, tabSettings });
    } catch (err) {
      return res.send({ success: false });
    };
  }));
});

Router.get("/usage", async (req, res) => {
  autoSignin(req, res, (async (userId) => {
    try {
      const { date, mode, timezone } = req.query;
      if (!date || !mode) return res.send({success: false, reason: 'Date/Mode values missing'});
      console.log(date, mode, timezone);
      const viewDateTime = DateTime.fromSeconds(parseInt(date)).setZone(timezone).startOf("day");
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
              };
            });
            continue;
          };
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
              };
            });
            continue;
          };
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
            };
          });
        } else {
          //not today
          selectedDates.push(viewDateTime.toFormat("M/d/yyyy"));
        };
      };

      if (selectedDates.length) {
        const connection = pool.promise();

        const [websiteStats] = await connection.query(`SELECT data FROM activities WHERE user_id = ? AND date IN (?)`, [userId, selectedDates]);
  
        websiteStats.map(({ data }) => {
          const websiteData = JSON.parse(data.replace(/^/, "[").replace(/$/, "]"));
          websiteData.map(({ d, t, v }) => {
            if (websitesUsage[d]) {
              websitesUsage[d].t += t;
              websitesUsage[d].v += v;
            } else {
              websitesUsage[d] = { t, v };
            };
          })
        });
      };

      return res.send(
        {
          success: true,
          websitesData: Object.keys(websitesUsage).map((d) => {
            return {d, ...websitesUsage[d]}
          })
        }
      )
    } catch (err) {
      console.log(err)
      return res.send({ success: false });
    };
  }));
});

module.exports = Router;