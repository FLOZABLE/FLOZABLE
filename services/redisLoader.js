const redisClient = require("../model/redis");
const pool = require("../model/pool");
const { writeLog } = require("../Logger");
const { UserRefreshClient } = require("google-auth-library");
const { DateTime } = require("luxon");

const USER_EXP = 60 * 60 * 3;
const USER_EXP_PLUS = 60 * 60;
const USER_EXP_DIS = 60 * 60;

const SBJ_EXP = 60 * 60 * 1;

const DM_MEMBERS_EXP = 60 * 60 * 1;
const GROUP_MEMBERS_EXP = 60 * 60 * 1;

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

async function subjectsCache(userId) {
  try {
    const isCached = await redisClient.exists(`user:${userId}:subjects`);
    if (isCached) {
      const subjectsObj = {
        ...(await redisClient.hGetAll(`user:${userId}:subjects`)),
      };
      const subjectArr = Object.keys(subjectsObj).map((id) => {
        return { ...JSON.parse(subjectsObj[id]), id };
      });
      return subjectArr;
    } else {
      try {
        const connection = pool.promise();
        const [subjects] = await connection.query(
          `SELECT id, name, icon, tools, color, datum_point, hidden FROM subjects where user_id = ?`,
          [userId]
        );
        subjects.map(async (subject) => {
          const redisSubject = { ...subject };
          delete redisSubject.id;
          redisClient.hSet(
            `user:${userId}:subjects`,
            subject.id,
            JSON.stringify(redisSubject)
          );
        });
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

async function subjectCache(userId, subjectId) {
  try {
    if (subjectId === "0") return false;
    const isCached = await redisClient.hExists(
      `user:${userId}:subjects`,
      subjectId
    );
    //console.log('iscached', isCached, userId, subjectId)
    if (isCached) {
      const subjectInfo = await redisClient.hGet(
        `user:${userId}:subjects`,
        subjectId
      );
      return { ...JSON.parse(subjectInfo), id: subjectId };
    } else {
      try {
        const connection = pool.promise();
        const [subjects] = await connection.query(
          `SELECT id, name, icon, color, tools, datum_point, timeline_sum, hidden FROM subjects where user_id = ?`,
          [userId]
        );
        subjects.map(async (subject) => {
          const redisSubject = { ...subject };
          delete redisSubject.id;
          redisClient.hSet(
            `user:${userId}:subjects`,
            subject.id,
            JSON.stringify(redisSubject)
          );
        });
        const subject = subjects.find((subject) => subject.id === subjectId);
        redisClient.expire(`user:${userId}:subjects`, SBJ_EXP);
        if (subject) return subject;
        return false;
      } catch (err) {
        console.log(err);
        return false;
      }
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function dmRoomsCache(userId) {
  let dmRooms = await redisClient.hGet(`user:${userId}`, "dmRooms");
  if (dmRooms) {
    return dmRooms === "" ? [] : dmRooms.split(",");
  } else {
    const connection = pool.promise();
    const [dmRooms] = await connection.query(
      `SELECT id FROM chatrooms WHERE members LIKE ?`,
      [`%${userId}%`]
    );
    redisClient.hSet(
      `user:${userId}`,
      "dmRooms",
      dmRooms.map(({ id }) => id).join()
    );

    return dmRooms;
  }
}

async function dmRoomMembersCache(id) {
  try {
    const members = await redisClient.sMembers(`room:${id}`);
    redisClient.expire(`room:${id}`, DM_MEMBERS_EXP);
    if (members.length) return members;
    const connection = pool.promise();
    const [[dmRoom]] = await connection.query(
      `SELECT members FROM chatrooms WHERE id = ?`,
      [id]
    );
    if (!dmRoom) return [];

    if (dmRoom.members !== "") {
      dmRoom.members = dmRoom.members.split(",");
      redisClient.sAdd(`room:${id}`, dmRoom.members);
      return dmRoom.members;
    }
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function groupMembersCache(id) {
  try {
    const members = await redisClient.sMembers(`room:${id}`);
    redisClient.expire(`room:${id}`, GROUP_MEMBERS_EXP);
    if (members.length) return members;
    const connection = pool.promise();
    const [[group]] = await connection.query(
      `SELECT members FROM groups WHERE group_id = ?`,
      [id]
    );
    if (group && group.members !== "") {
      group.members = group.members.split(",");
      redisClient.sAdd(`room:${id}`, group.members);
      return group.members;
    }
    return [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function chatRoomsCache(userId, withMembersInfo = true) {
  try {
    const dmRooms = await dmRoomsCache(userId);
    const userInfo = await userCache(userId);

    if (!userInfo) return;

    const { groups } = userInfo;
    const groupRooms = groups.map((group) => {
      return { id: group, type: 0, members: [] };
    });
    const dmRoomsInfo = await Promise.all(
      dmRooms.map(async (dmRoom) => {
        const members = await dmRoomMembersCache(dmRoom);
        const membersInfo = withMembersInfo
          ? await usersCache(members, false)
          : members.map((userId) => {
              return { user_id: userId };
            });
        return { id: dmRoom, members: membersInfo, type: 1 };
      })
    );
    const rooms = groupRooms.concat(dmRoomsInfo);
    return rooms;
  } catch (err) {
    console.log(err);
    return [];
  }
}

//only last 100 msg will be stored inside the redis queue for each groups
const MAX_QUEUE_LENGTH = 100;
async function msgQueue(roomId, msgInfo) {
  redisClient.rPush(`room:${roomId}:chats`, JSON.stringify(msgInfo));
  const queueLength = await redisClient.lLen(`room:${roomId}:chats`);
  if (queueLength >= MAX_QUEUE_LENGTH) {
    const fistMsg = await redisClient.lPop(`room:${roomId}:chats`);
    const connection = pool.promise();
    connection.query(
      `UPDATE chatrooms SET \`chats\` = CASE
        WHEN \`chats\` = '' THEN ?
        ELSE CONCAT(\`chats\`, ',', ?)
        END
        WHERE id = ?`,
      [fistMsg, fistMsg, roomId]
    );
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
    let activeSubject = await redisClient.hGet(
      `user:${userId}`,
      `ActiveSubject`
    );
    activeSubject = activeSubject
      ? { id: activeSubject.split(":")[0], time: activeSubject.split(":")[1] }
      : false;
    return activeSubject;
  } catch (err) {
    console.log(err);
  }
}

async function activeGroupCache(userId) {
  try {
    const activeGroup = await redisClient.hGet(`user:${userId}`, `ActiveGroup`);
    if (activeGroup) {
      return JSON.parse(activeGroup);
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

/**return timer information of the user.
 * return type is object
 * dp(datumpoint), ts(timeline sum)
 */
async function timerCache(
  userId,
  now = Math.floor(new Date().getTime() / 1000),
  ts = 0
) {
  try {
    const isCached = await redisClient;
    let timer = await redisClient.hGet(`user:${userId}`, "timerInfo");

    if (timer) {
      timer = JSON.parse(timer);
    } else {
      timer = { dp: now, ts };
      await redisClient.hSet(
        `user:${userId}`,
        "timerInfo",
        JSON.stringify(timer)
      );
    }

    return timer;
  } catch (err) {}
}

function addActiveUserCache(userId) {
  if (!userId) return;
  redisClient.sAdd("day1", userId);
  redisClient.sAdd("day2", userId);

  redisClient.sAdd("week1", userId);
  redisClient.sAdd("week2", userId);

  redisClient.sAdd("month1", userId);
  redisClient.sAdd("month2", userId);
}

function removeActiveUserCache(userId) {
  if (!userId) return;
  redisClient.sRem("day1", userId);
  redisClient.sRem("day2", userId);

  redisClient.sRem("week1", userId);
  redisClient.sRem("week2", userId);

  redisClient.sRem("month1", userId);
  redisClient.sRem("month2", userId);
}

/**
 * @param {*} type
 */
async function getActiveUsers(type) {
  try {
    if (type === "day") {
      const day1 = await redisClient.sMembers("day1");
      const day2 = await redisClient.sMembers("day2");
      return [...new Set([...day1, ...day2])];
    }

    if (type === "week") {
      const week1 = await redisClient.sMembers("week1");
      const week2 = await redisClient.sMembers("week2");
      return [...new Set([...week1, ...week2])];
    }
    const month1 = await redisClient.sMembers("month1");
    const month2 = await redisClient.sMembers("month2");
    return [...new Set([...month1, ...month2])];
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function userCache(userId, query = true) {
  try {
    if (!userId) return false;
    const isCached = await redisClient.hExists(`user:${userId}`, "name");
    if (isCached) {
      const userInfo = await redisClient.hGetAll(`user:${userId}`);

      userInfo.groups =
        userInfo.groups === "" || !userInfo.groups
          ? []
          : userInfo.groups.split(",");
      userInfo.friends =
        userInfo.friends === "" || !userInfo.friends
          ? []
          : userInfo.friends.split(",");
      return { ...userInfo, user_id: userId };
    } else {
      if (!query) return false;

      const connection = pool.promise();
      const [[userInfo]] = await connection.query(
        "SELECT name, email, groups, friends, timezone, datum_point FROM users WHERE user_id = ?",
        [userId]
      );
      if (userInfo) {
        cacheUserInfo(userInfo);
        userInfo.groups =
          userInfo.groups === "" ? [] : userInfo.groups.split(",");
        userInfo.friends =
          userInfo.friends === "" ? [] : userInfo.friends.split(",");
        return { ...userInfo, user_id: userId };
      } else {
        return false;
      }
    }
  } catch (err) {
    console.log(err);
  }
}

/**
 * upgraded version of user cache, if user is cached, return userCache result, otherwise, combine users that are not cached and handle as one query
 * @param {*} users
 */
async function usersCache(users, cache) {
  try {
    if (!users.length) return [];

    const notCached = [];
    const usersInfo = [];
    await Promise.all(
      users.map(async (userId) => {
        const userInfo = await userCache(userId, false);
        if (userInfo) {
          usersInfo.push(userInfo);
        } else {
          notCached.push(userId);
        }
      })
    );

    const connection = pool.promise();

    const [queriedUsers] = await connection.query(
      "SELECT name, email, groups, friends, timezone, datum_point, user_id FROM users WHERE user_id IN (?)",
      [notCached]
    );
    queriedUsers.map((userInfo) => {
      if (cache) {
        cacheUserInfo(userInfo);
      }
      userInfo.groups =
        userInfo.groups === "" ? [] : userInfo.groups.split(",");
      userInfo.friends =
        userInfo.friends === "" ? [] : userInfo.friends.split(",");
      usersInfo.push(userInfo);
    });
    return usersInfo;
  } catch (err) {
    console.log(err);
  }
}

async function cacheUserInfo(userInfo) {
  const { name, email, timezone, datum_point, user_id, groups, friends } =
    userInfo;
  redisClient.hSet(`user:${user_id}`, "name", name);
  redisClient.hSet(`user:${user_id}`, "email", email);
  redisClient.hSet(`user:${user_id}`, "groups", groups ? groups : "");
  redisClient.hSet(`user:${user_id}`, "friends", friends ? friends : "");
  redisClient.hSet(`user:${user_id}`, "timezone", timezone);
  redisClient.hSet(`user:${user_id}`, "datum_point", datum_point);
  redisClient.expire(`user:${user_id}`, 60 * 60 * 10);
}

/**
 * notification's key:
 * i: id
 * t: type ex) -1 = all (default),  0 = friend-request, 1 = friend-request-accept, 2 = face-off-request, 3 = face-off-accept, 4 = dm request, 5 = dm accepted, 6 = group-invitation, 7 = plan share request
 * -2 = ongoing friend req
 * d: date (unix but divided by 1000 * 60 because we  need minute accuracy)
 * optional:
 * f: from (used for friend-request, friend-accept, group invitation)
 * @param {*} userId
 * @param {*} type
 * @returns {[]} selectedNotifications
 */
async function NotificationCache(userId, type = -1, processData = true) {
  const notifications = (
    await redisClient.sMembers(`user:${userId}:notifications`)
  ).map(JSON.parse);
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
}

async function subjectsTimelineCache(userId) {
  const subjectsInfo = await subjectsCache(userId);
  const connection = pool.promise();
  const [subjectTimelines] = await connection.query(
    `SELECT timeline, id FROM subjects WHERE user_id = ?`,
    [userId]
  );
  const subjectPromises = subjectsInfo.map(async (subject) => {
    const { id } = subject;
    const prevTimeline = subjectTimelines.find((sub) => {
      return sub.id === id;
    });

    const todayTimeline = (
      await redisClient.lRange(`user:${userId}:subject:${id}`, 0, -1)
    ).map(JSON.parse);
    if (prevTimeline) {
      const parsedTimeline = prevTimeline.timeline
        ? JSON.parse(prevTimeline.timeline.replace(/^/, "[").replace(/$/, "]"))
        : []; //wrapping the string with "[]"
      subject.timeline = parsedTimeline.concat(todayTimeline);
    } else {
      subject.timeline = todayTimeline;
    }

    return subject;
  });

  const subjects = await Promise.all(subjectPromises);
  return subjects;
}

async function groupInfoCache(groupId) {
  const isCached = await redisClient.exists(`group:${groupId}`);
  if (isCached) {
    const groupInfo = await redisClient.hGetAll(`group:${groupId}`);
  } else {
    const connection = pool.promise();
    const [[groupInfo]] = await connection.query(
      "SELECT group_id, name, leader, visibility, explanation, date, members, max_members, tags, color, goal_hr, average_hr, likes, font FROM `groups` WHERE group_id = ?",
      [groupId]
    );
    const { group_id, name, leader, visibility, explanation, date, members } =
      groupInfo;
    redisClient.sMembers(`group:${groupId}`, members);
  }
}

async function msgReadCache(userId) {
  let readStatus = { ...(await redisClient.hGetAll(`user:${userId}:chats`)) };
  readStatus = Object.keys(readStatus).map((id) => {
    //return { ...JSON.parse(readStatus[id]), id };
    const [msgId, time] = readStatus[id].split(":");
    return { msgId, time, id };
  });
  return readStatus;
}

async function challengeroomsCache() {
  const allChallenges = [];
  const allChallengeIds = await redisClient.sMembers("allChallenges");

  await Promise.all(
    allChallengeIds.map(async (challengeId) => {
      if (!(await redisClient.exists(`challenge:${challengeId}`))) {
        console.log("Does not exist");
        redisClient.sRem("allChallenges", challengeId);
      } else {
        const obj = await redisClient.hGetAll(`challenge:${challengeId}`);
        allChallenges.push({ ...obj, id: challengeId });
      }
    })
  );

  return allChallenges;
}

async function websiteUsageCache(userId) {
  const websitesUsage = await redisClient.zRangeWithScores(
    `user:${userId}:tabs:usage`,
    0,
    -1
  );
  const websitesTimer = await redisClient.zRangeWithScores(
    `user:${userId}:tabs:timer`,
    0,
    -1
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

async function googleAccessTokenCache(userId) {
  try {
    const googleAccessToken = await redisClient.get(
      `user:${userId}:googleAccessToken`
    );

    if (googleAccessToken) {
      return googleAccessToken;
    }

    const connection = pool.promise();
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

    if (res.data.access_token) {
      redisClient.set(
        `user:${userId}:googleAccessToken`,
        res.data.access_token,
        { EX: 3590 }
      );
      return res.data.access_token;
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
      const connection = pool.promise();
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
  const members = await redisClient.zRange(key, 0, -1);
  members.map(async (member) => {
    redisClient.zIncrBy(key, val, member);
  });
}

module.exports = {
  flushRedis,
  cacheManager,
  subjectsCache,
  subjectCache,
  activeSubjectCache,
  timerCache,
  NotificationCache,
  chatRoomsCache,
  dmRoomMembersCache,
  groupMembersCache,
  msgQueue,
  usersCache,
  dmRoomsCache,
  userCache,
  subjectsTimelineCache,
  activeGroupCache,
  msgReadCache,
  challengeroomsCache,
  websiteUsageCache,
  googleAccessTokenCache,
  zsetIncrAll,
  getActiveUsers,
  addActiveUserCache,
  removeActiveUserCache,
  cacheUserInfo,
};
