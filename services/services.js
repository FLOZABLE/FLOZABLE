const { DateTime } = require("luxon");
const { cacheManager } = require("./redisLoader");
const { timerUpdate } = require("./timerUpdate");
const { updateRanking } = require("./rankingUpdate");
const { extensionManager } = require("./extension");
const cron = require("node-cron");
const { updateVapidKeys } = require("./notification");

async function servicesManager() {
  //schedulers
  cron.schedule("0 * * * *", () => {
    //dailyReport(process.env.TESTER_ID);
    extensionManager();
    updateRanking();
    timerUpdate();
    if (DateTime.now().get("hour") === 1) {
      cacheManager();
      updateVapidKeys();
    }
  });
}

module.exports = { servicesManager };
