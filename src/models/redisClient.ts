import Redis from 'ioredis';

import config from '../config/config';

const redisClient = new Redis({
  port: config.redisPort,
  password: config.redisPassword,
});

redisClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

export default redisClient;
