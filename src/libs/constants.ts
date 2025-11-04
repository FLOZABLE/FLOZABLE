export const REDIS_TTL = {
  SESSION_EXP: 60 * 60 * 24 * 30, //30 days
  SESSION_EXTENDED_EXP: 60 * 60 * 24 * 10, //10 days
  USER_EXP: 60 * 60, //1 hour
  USER_FRIENDS_EXP: 60 * 60, //1hour
  USER_GROUPS_EXP: 60 * 60, //1hour
  USER_STATUS_EXP: 60 * 60 * 5, //5 hour
  USER_CHAT_STATUS_EXP: 60 * 60 * 24 * 30, //30days
  USER_ACTIVE_GROUP_EXP: 60 * 60 * 24 * 30, //30days
  USER_GOOGLE_ACCESS_TOKEN: 60 * 60 * 1, //1hour
  CHAT_MEMBERS_EXP: 60 * 60 * 1, //1hour
  USER_NOTIFICATION_TOKENS_EXP: 60 * 60, //1hour
};

export const COOKIE_TTL = {
  LOGIN_TOKEN_EXP: 1000 * 60 * 60 * 24 * 30, //30 d
};

export const BOT_OPTIONS = {
  MIN_STUDY: 60 * 10,
  MAX_STUDY: 60 * 60 * 2,
  MIN_START_DELAY: 60,
  MAX_START_DELAY: 60 * 60 * 0.5,
};
