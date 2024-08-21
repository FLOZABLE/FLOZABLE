const redisClient = require("../model/redis");
const pool = require("../model/pool");
const { UserRefreshClient } = require("google-auth-library");
const { DateTime } = require("luxon");
const { REDIS_EXP } = require("../Constant");
const querystring = require("node:querystring");

const USER_EXP = 60 * 60 * 3;
const USER_EXP_PLUS = 60 * 60;
const USER_EXP_DIS = 60 * 60;

const SBJ_EXP = 60 * 60 * 1;

const DM_MEMBERS_EXP = 60 * 3;
const CHATROOM_MEMBERS_EXP = 60 * 3;

async function flushRedis() {
  await redisClient.flushDb();
}

function cacheManager() {
  const now = DateTime.now();

  const index =
    (now.startOf("day").diff(DateTime.fromISO("2024-04-21"), "days").toObject()
      .days %
      2) +
    1;
  console.log("remove", index);
  redisClient.del(`day${index}`);

  if (now.weekday === 1) {
    redisClient.del(`week1`);
  } else if (now.weekday === 2) {
    redisClient.del(`week2`);
  }
  if (now.get("day") === 1) {
    redisClient.del(`month1`);
  } else if (now.get("day") === 2) {
    redisClient.del(`month2`);
  }
}

async function subjectsCache(connection, userId) {
  try {
    const isCached = await redisClient.exists(`user:${userId}:subjects`);
    if (isCached) {
      const subjectsObj = {
        ...(await redisClient.hgetall(`user:${userId}:subjects`)),
      };
      const subjectArr = Object.keys(subjectsObj).map((subject_id) => {
        return { ...JSON.parse(subjectsObj[subject_id]), subject_id };
      });
      return subjectArr;
    } else {
      try {
        const [subjects] = await connection.query(
          `SELECT subject_id, name, color, created_at FROM subjects WHERE user_id = ?`,
          [userId]
        );
        subjects.map(async (subject) => {
          const redisSubject = { ...subject };
          delete redisSubject.subject_id;
          redisClient.hset(
            `user:${userId}:subjects`,
            subject.subject_id,
            JSON.stringify(redisSubject)
          );
        });
        redisClient.expire(`user:${userId}:subjects`, REDIS_EXP.SUBJECTS);
        return subjects;
      } catch (err) {
        console.log(err);
      }
    }
    redisClient.expire(`user:${userId}:subjects`, SBJ_EXP);
  } catch (err) {
    console.log(err);
  }
}

async function subjectCache(connection, userId, subjectId) {
  try {
    if (subjectId === "0") return false;
    const isCached = await redisClient.hexists(
      `user:${userId}:subjects`,
      subjectId
    );
    //console.log('iscached', isCached, userId, subjectId)
    if (isCached) {
      const subjectInfo = await redisClient.hget(
        `user:${userId}:subjects`,
        subjectId
      );
      return { ...JSON.parse(subjectInfo), subject_id: subjectId };
    }
    const [subjects] = await connection.query(
      `SELECT subject_id, name, color, created_at FROM subjects WHERE user_id = ?`,
      [userId]
    );
    subjects.map(async (subject) => {
      const redisSubject = { ...subject };
      delete redisSubject.subject_id;
      redisClient.hset(
        `user:${userId}:subjects`,
        subject.subject_id,
        JSON.stringify(redisSubject)
      );
    });
    redisClient.expire(`user:${userId}:subjects`, REDIS_EXP.SUBJECTS);
    const subject = subjects.find(
      (subject) => subject.subject_id === subjectId
    );
    if (subject) return subject;
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function subjectsTimelineCache(connection, userId) {
  try {
    const [subjects] = await connection.query(
      `
      SELECT 
        s.subject_id, 
        s.name,
        s.color,
        s.created_at,
        IF(
            COUNT(st.start_time) > 0, 
            JSON_ARRAYAGG(
                JSON_ARRAY(
                    IFNULL(st.start_time, 0), 
                    IFNULL(st.duration, 0)
                )
            ),
            '[]'
        ) AS timeline
        FROM subjects s
        LEFT JOIN subject_timelines st ON s.subject_id = st.subject_id
        WHERE s.user_id = ?
        GROUP BY s.subject_id
    `,
      [userId]
    );

    await Promise.all(
      subjects.map(async (subject) => {
        const todayTimeline = (
          await redisClient.lrange(
            `user:${userId}:subject:${subject.subject_id}`,
            0,
            -1
          )
        ).map(JSON.parse);
        subject.timeline = JSON.parse(subject.timeline).concat(todayTimeline);
      })
    );

    return subjects;
  } catch (err) {
    console.log(err);
    return [];
  }
}

//only last 100 msg will be stored inside the redis queue for each groups
const MAX_QUEUE_LENGTH = 100;
async function msgQueue(connection, roomId, msgInfo) {
  try {
    redisClient.rpush(`chatroom:${roomId}:messages`, JSON.stringify(msgInfo));
    const queueLength = await redisClient.llen(`chatroom:${roomId}:messages`);

    if (queueLength < MAX_QUEUE_LENGTH) return;

    const firstMsg = await redisClient.lPop(`room:${roomId}:messages`);
    if (!firstMsg) return;
    connection.query(
      `
      INSERT INTO chatroom_messages SET ?
      `,
      JSON.parse(firstMsg)
    );
  } catch (err) {
    console.log(err);
  }
}

/**
 * rest: id = 0
 * offline: null/undefined
 * @param {string} userId
 * @returns
 *
 */
async function activeSubjectCache(userId) {
  try {
    const activeSubject = await redisClient.hgetall(
      `user:${userId}:activeSubject`
    );
    if (activeSubject.id && activeSubject.time) {
      return activeSubject;
    }
    return null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function cacheActiveSubject(userId, subject, time) {
  try {
    await redisClient.hset(
      `user:${userId}:activeSubject`,
      "id",
      subject.subject_id,
      "time",
      time,
      "name",
      subject.name
    );

    redisClient.expire(
      `user:${userId}:activeSubject`,
      REDIS_EXP.ACTIVE_SUBJECT
    );
  } catch (err) {
    console.log(err);
  }
}

async function activeGroupCache(userId) {
  try {
    const activeGroup = await redisClient.hgetall(`user:${userId}:activeGroup`);
    if (activeGroup.id && activeGroup.time) {
      return activeGroup;
    }
    return null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function cacheActiveGroup(userId, groupId, time) {
  try {
    await redisClient.hset(
      `user:${userId}:activeGroup`,
      "id",
      groupId,
      "time",
      time
    );

    redisClient.expire(`user:${userId}:activeGroup`, REDIS_EXP.ACTIVE_GROUP);
  } catch (err) {
    console.log(err);
  }
}

function addActiveUserCache(userId) {
  if (!userId) return;
  redisClient.sadd("day1", userId);
  redisClient.sadd("day2", userId);

  redisClient.sadd("week1", userId);
  redisClient.sadd("week2", userId);

  redisClient.sadd("month1", userId);
  redisClient.sadd("month2", userId);
}

function removeActiveUserCache(userId) {
  if (!userId) return;
  redisClient.srem("day1", userId);
  redisClient.srem("day2", userId);

  redisClient.srem("week1", userId);
  redisClient.srem("week2", userId);

  redisClient.srem("month1", userId);
  redisClient.srem("month2", userId);
}

/**
 * @param {*} type
 */
async function getActiveUsers(type) {
  try {
    if (type === "day") {
      const day1 = await redisClient.smembers("day1");
      const day2 = await redisClient.smembers("day2");
      return [...new Set([...day1, ...day2])];
    }

    if (type === "week") {
      const week1 = await redisClient.smembers("week1");
      const week2 = await redisClient.smembers("week2");
      return [...new Set([...week1, ...week2])];
    }
    const month1 = await redisClient.smembers("month1");
    const month2 = await redisClient.smembers("month2");
    return [...new Set([...month1, ...month2])];
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function userCache(connection, userId, query = true) {
  try {
    if (!userId) return false;
    const isCached = await redisClient.exists(`user:${userId}`);

    if (isCached) {
      const userInfo = await redisClient.hgetall(`user:${userId}`);
      return { ...userInfo, user_id: userId };
    }

    if (!query) return false;

    const [[userInfo]] = await connection.query(
      `
      SELECT 
        user_id,
        name,
        timezone,
        created_at
      FROM users
      WHERE user_id = ?
      `,
      [userId]
    );
    if (!userInfo) return false;
    cacheUserInfo(userInfo);
    return userInfo;
  } catch (err) {
    console.log(err);
    return false;
  }
}

/**
 * upgraded version of user cache, if user is cached, return userCache result, otherwise, combine users that are not cached and handle as one query
 * @param {*} users
 */
async function usersCache(connection, users, cache = false) {
  try {
    if (!users.length) return [];

    const notCached = [];
    const usersInfo = [];
    await Promise.all(
      users.map(async (userId) => {
        const userInfo = await userCache(connection, userId, false);
        if (userInfo) {
          usersInfo.push(userInfo);
        } else {
          notCached.push(userId);
        }
      })
    );

    if (!notCached.length) return usersInfo;

    const [notCachedUsers] = await connection.query(
      `
      SELECT 
        user_id,
        name,
        timezone,
        created_at
      FROM users
      WHERE user_id = ?
      `,
      [notCached]
    );

    notCachedUsers.map((userInfo) => {
      if (cache) {
        cacheUserInfo(userInfo);
      }
      usersInfo.push(userInfo);
    });
    return usersInfo;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function cacheUserInfo(userInfo) {
  try {
    const { name, timezone, created_at, user_id } = userInfo;

    redisClient.hset(
      `user:${user_id}`,
      "name",
      name,
      "timezone",
      timezone,
      "created_at",
      created_at
    );
    redisClient.expire(`user:${user_id}`, REDIS_EXP.USERINFO);
  } catch (err) {
    console.log(err);
  }
}

async function userFriendsCache(connection, userId) {
  try {
    const [friendsData] = await connection.query(
      `SELECT friend_id, user_id FROM friends WHERE user_id = ? OR friend_id = ?`,
      [userId, userId]
    );
    const friends = friendsData.map((friend) => {
      return friend.friend_id === userId ? friend.friend_id : friend.user_id;
    });
    if (friends.length) {
      redisClient.sadd(`user:${userId}:friends`, friends);
      redisClient.expire(`user:${userId}:friends`, REDIS_EXP.USER_FRIENDS);
    }
    return friends;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function userGroupsCache(connection, userId) {
  try {
    const isCached = await redisClient.exists(`user:${userId}:groups`);
    if (isCached) {
      return await redisClient.smembers(`user:${userId}:groups`);
    }
    const [groupsData] = await connection.query(
      `SELECT group_id FROM group_members WHERE user_id = ?`,
      [userId]
    );
    const groups = groupsData.map((group) => group.group_id);
    if (groups.length) {
      redisClient.sadd(`user:${userId}:groups`, groups);
      redisClient.expire(`user:${userId}:groups`, REDIS_EXP.USER_FRIENDS);
    }
    return groups;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function clearUserCache(userId) {
  try {
    return redisClient.del(`user:${userId}`);
  } catch (err) {
    console.log(err);
  }
}

async function clearUsersCache() {
  try {
    const userKeys = (await redisClient.keys("*user:*")).filter(
      (key) => key.length === 15
    );

    console.log(userKeys.length);
    redisClient.del(userKeys);
  } catch (err) {
    console.log(err);
  }
}
//clearUsersCache();
/**
 * notification's key:
 * i: id
 * t: type ex) -1 = all (default),  0 = friend-request, 1 = friend-request-accept, 2 = subject share, 3 = face-off-accept, 4 = dm request, 5 = dm accepted, 6 = group-invitation, 7 = plan share invitation, 8 = plan shared notification
 * -2 = ongoing friend req
 * d: date (unix but divided by 1000
 * optional:
 * f: from (used for friend-request, friend-accept, group invitation)
 * @param {*} userId
 * @param {*} type
 * @returns {[]} selectedNotifications
 */
async function NotificationCache(userId, type = -1, processData = true) {
  try {
    const notificationsObj = {
      ...(await redisClient.hgetall(`user:${userId}:notifications`)),
    };
    const notifications = Object.keys(notificationsObj).map((id) => ({
      i: id,
      ...JSON.parse(notificationsObj[id]),
    }));
    await Promise.all(
      notifications.map(async (notification) => {
        if (notification.f && processData) {
          notification.f = await userCache(notification.f);
        }
      })
    );
    if (type === -1) {
      return notifications;
    }
    const selectedNotifications = notifications.filter((notification) => {
      return notification.t === type;
    });
    return selectedNotifications;
  } catch (err) {
    console.log(err);
  }
}

async function websiteUsageCache(userId) {
  const websitesUsage = await redisClient.zrange(
    `user:${userId}:tabs:usage`,
    0,
    -1,
    "WITHSCORES"
  );
  const websitesTimer = await redisClient.zrange(
    `user:${userId}:tabs:timer`,
    0,
    -1,
    "WITHSCORES"
  );
  //console.log(websitesUsage, websitesTimer);
  const websiteData = websitesTimer.map(({ value, score }) => {
    let v = 0;
    const websiteUsage = websitesUsage.find((website) => {
      return website.value === value;
    });
    if (websiteUsage) {
      v = websiteUsage.score;
    }
    return { d: value, t: score, v };
  });

  return websiteData;
}

async function setGoogleAccessToken(user_id, access_token, expiry_date) {
  const now = new Date().getTime();
  const exp = Math.floor((expiry_date - now) / 1000);
  redisClient.setex(`user:${user_id}:googleAccessToken`, exp, access_token);
}

async function googleAccessTokenCache(connection, userId) {
  try {
    const googleAccessToken = await redisClient.get(
      `user:${userId}:googleAccessToken`
    );

    if (googleAccessToken) {
      return googleAccessToken;
    }

    const [[userInfo]] = await connection.query(
      `SELECT google_refresh_token FROM users WHERE user_id = ?`,
      [userId]
    );

    if (!userInfo || !userInfo.google_refresh_token) {
      return false;
    }

    const user = new UserRefreshClient(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      userInfo.google_refresh_token
    );
    const { res } = await user.getAccessToken();

    const { access_token, expiry_date } = res.data;
    if (access_token) {
      setGoogleAccessToken(userId, access_token, expiry_date);
      return access_token;
    }

    return false;
  } catch (err) {
    if (
      err.response &&
      err.response &&
      err.response.data &&
      (err.response.data.error === "invalid_grant" ||
        err.response.data.error_description ===
          "Token has been expired or revoked.")
    ) {
      redisClient.del(`user:${userId}:googleAccessToken`);
      connection.query(
        `UPDATE users set google_refresh_token = NULL WHERE user_id = ?`,
        [userId]
      );
    }
    console.log(err);
    return false;
  }
}

async function zsetIncrAll(key, val = 1) {
  try {
    const members = await redisClient.zRange(key, 0, -1);
    members.map(async (member) => {
      redisClient.zIncrBy(key, val, member);
    });
  } catch (err) {
    console.log(err);
  }
}

async function chatroomMemberCache(connection, chatroomId, userId) {
  try {
    const isIn = await redisClient.sismember(`chatroom:${chatroomId}`, userId);
    if (isIn) return true;

    const [[member]] = await connection.query(
      `
      SELECT
        user_id,
        chatroom_id
      FROM (
        SELECT user_id, chatroom_id, 0 AS is_group
        FROM chatroom_members
        WHERE user_id = ? AND chatroom_id = ?
    
        UNION ALL
    
        SELECT user_id, group_id AS chatroom_id, 1 AS is_group
        FROM group_members
        WHERE user_id = ? AND group_id = (
          SELECT chatroom_id
          FROM chatrooms
          WHERE chatroom_id = ? AND type = 0
        )
      ) AS members
      WHERE chatroom_id = ?
      LIMIT 1;
      `,
      [userId, chatroomId, userId, chatroomId, chatroomId]
    );

    if (!member) return false;

    await redisClient.sadd(`chatroom:${chatroomId}`, userId);
    redisClient.expire(`chatroom:${chatroomId}`, CHATROOM_MEMBERS_EXP);
    console.log(member);
    return true;
  } catch (err) {
    console.log(err);
  }
}

async function spotifyAccessTokenCache(connection, userId) {
  try {
    let accessToken = await redisClient.get(
      `user:${userId}:spotifyAccessToken`
    );
    if (accessToken) return accessToken;

    const [[userInfo]] = await connection.query(
      `SELECT spotify_refresh_token FROM users WHERE user_id = ?`,
      [userId]
    );

    if (!userInfo) return false;

    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

    const body = querystring.stringify({
      grant_type: "refresh_token",
      refresh_token: userInfo.spotify_refresh_token,
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${client_id}:${client_secret}`
        ).toString("base64")}`,
      },
      body,
    });

    const data = await response.json();

    if (data.error) {
      return false;
    }

    const { access_token, expires_in } = data;

    if (access_token) {
      redisClient.setex(
        `user:${userId}:spotifyAccessToken`,
        expires_in,
        access_token
      );
    }

    return access_token;
  } catch (err) {
    console.log(err);
    return false;
  }
}

module.exports = {
  flushRedis,
  cacheManager,
  subjectsCache,
  subjectCache,
  activeSubjectCache,
  cacheActiveSubject,
  activeGroupCache,
  cacheActiveGroup,
  NotificationCache,
  msgQueue,
  usersCache,
  userCache,
  userFriendsCache,
  userGroupsCache,
  clearUserCache,
  subjectsTimelineCache,
  websiteUsageCache,
  setGoogleAccessToken,
  googleAccessTokenCache,
  zsetIncrAll,
  getActiveUsers,
  addActiveUserCache,
  removeActiveUserCache,
  cacheUserInfo,
  chatroomMemberCache,
  spotifyAccessTokenCache,
};
