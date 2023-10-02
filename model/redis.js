const redis = require("redis");

console.log(process.env.REDIS_HOST, process.env.REDIS_PORT, process.env.REDIS_PW)
const redisClient = redis.createClient({
  url: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PW
});

redisClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

//redisClient.auth(process.env.REDIS_PW)

module.exports = redisClient;