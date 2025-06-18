export const REDIS_TTL = {
  SESSION_EXP: 60 * 60 * 24 * 3, //3 days
  USER_EXP: 60 * 60, //1 hour
  USER_FRIENDS_EXP: 60 * 60, //1hour
  USER_GROUPS_EXP: 60 * 60, //1hour
  USER_STATUS_EXP: 60 * 60 * 5, //5 hour
  USER_GOOGLE_ACCESS_TOKEN: 60 * 60 * 1, //1hour
};

export const COOKIE_TTL = {
  LOGIN_TOKEN_EXP: 1000 * 60 * 60 * 24 * 30, //30 d
};
