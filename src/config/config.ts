import dotenv from 'dotenv';

const envFile = `.env.${process.env.NODE_ENV}`;
dotenv.config({ path: envFile });

console.log(process.env.NODE_ENV)

interface Config {
  nodeEnv: string;
  secretId: string;

  mariaHost: string;
  mariaUser: string;
  mariaDatabase: string;
  mariaPassword: string;

  redisHost: string;
  redisPort: number;
  redisPassword: string;

  ip: string;
  port: number;
  server: string;
  nextServer: string;
  serverCors: string[];
  socketOrigin: string[];
  https: boolean;

  sendinblueApi: string;

  vapidPrivateKey: string;
  vapidPublicKey: string;

  testerId: string;

  googleApiKey: string;
  googleClientId: string;
  googleClientSecret: string;
  googleRedirectUri: string;

  spotifyClientId: string;
  spotifyClientSecret: string;

  stripeSecret: string;
  stripeWebhookSecret: string;

  webRtcIp: string;
  webRtcAnnouncedIp: string;

  turnUsername: string;
  turnCredential: string;

  bots: number;
  botsSendFriendPercentage: number;
  logger: boolean;

  appleClientId: string;
  appleTeamId: string;
  appleRedirectUri: string;
  appleKeyId: string;
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  secretId: process.env.SECRET_ID || '',

  mariaHost: process.env.MARIA_HOST || '127.0.0.1',
  mariaUser: process.env.MARIA_USER || 'root',
  mariaDatabase: process.env.MARIA_DATABASE || '',
  mariaPassword: process.env.MARIA_PASSWORD || '',

  redisHost: process.env.REDIS_HOST || '',
  redisPort: Number(process.env.REDIS_PORT) || 6379,
  redisPassword: process.env.REDIS_PW || '',

  ip: process.env.IP || 'localhost',
  port: Number(process.env.PORT) || 3000,
  server: process.env.SERVER || '',
  nextServer: process.env.NEXT_SERVER || '',
  serverCors: process.env.SERVER_CORS
    ? process.env.SERVER_CORS.split(',').map((s) => s.trim())
    : [],
  socketOrigin: process.env.SOCKET_ORIGIN
    ? process.env.SOCKET_ORIGIN.split(',').map((s) => s.trim())
    : [],
  https: process.env.HTTPS === 'true',

  sendinblueApi: process.env.SENDINBLUE_API || '',

  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',

  testerId: process.env.TESTER_ID || '',

  googleApiKey: process.env.GOOGLE_API_KEY || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || '',

  spotifyClientId: process.env.SPOTIFY_CLIENT_ID || '',
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',

  stripeSecret: process.env.STRIPE_SECRET || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',

  webRtcIp: process.env.WEB_RTC_IP || '0.0.0.0',
  webRtcAnnouncedIp: process.env.WEB_RTC_ANNOUNCED_IP || '127.0.0.1',

  turnUsername: process.env.TURN_USERNAME || '',
  turnCredential: process.env.TURN_CREDENTIAL || '',

  bots: Number(process.env.BOTS) || 0,
  botsSendFriendPercentage:
    Number(process.env.BOTS_SEND_FRIEND_PERCENTAGE) || 0,
  logger: process.env.LOGGER === 'true',

  appleClientId: process.env.APPLE_CLIENT_ID || '',
  appleTeamId: process.env.APPLE_TEAM_ID || '',
  appleRedirectUri: process.env.APPLE_REDIRECT_URI || '',
  appleKeyId: process.env.APPLE_KEY_ID || '',
};

export default config;
