const { updateManager } = require("./update");

async function servicesManager() {
  updateManager();
};

module.exports = {servicesManager};