import cron from 'node-cron';

import config from '../config/config';
import { botsSelector, stopAllBots } from '../services/botService';

cron.schedule('0 * * * *', async () => {
  await stopAllBots();

  console.log('schedule bots hourly ranking update...');
  await botsSelector(config.bots);
});

(async () => {
  await stopAllBots();

  botsSelector(config.bots);
})();
