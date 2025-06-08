import cron from 'node-cron';

import { updateRanking } from '../services/rankingService';

// Runs at the start of every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running hourly ranking update...');
  await updateRanking();
});
