const { randomIntInRange, isTrueBasedOnPercentage } = require("../utils/tool");
const pool = require("../model/pool");
const { DateTime } = require("luxon");
const schedule = require("node-schedule");
const redisClient = require("../model/redis");
const {
  activeSubjectCache,
  subjectsCache,
  getActiveUsers,
  addActiveUserCache,
  cacheActiveSubject,
  cacheActiveGroup,
  userGroupsCache,
  userFriendsCache,
} = require("../services/redisLoader");
const { mainIo } = require("../sockets/io");
const { MAX_STUDY_TIME, BOT_OPTIONS } = require("../Constant");
const { sendFriendRequest, replyFriendRequest } = require("../API/friends");

async function botManager(numbers) {
  try {
    const activeBots = await redisClient.smembers("activeBots");
    await Promise.all(
      activeBots.map(async (botId) => {
        await stopBot(botId);
      })
    );
    botSelector(numbers);
    schedule.scheduleJob("0 */5 * * *", async () => {
      console.log("run bot");
      botSelector(numbers);
    });
  } catch (err) {
    console.log(err);
  }
}

async function botSelector(numbers) {
  try {
    const connection = pool.promise();

    console.log("study:", numbers);
    // Execute these queries in parallel
    const [bots, activeBots, allMembers] = await Promise.all([
      connection
        .query(`SELECT user_id FROM users WHERE type = -1`)
        .then(([bots]) => bots),
      redisClient.smembers("activeBots"),
      getActiveUsers("month"),
    ]);

    const now = DateTime.now();

    for (let i = 0; i < numbers; i++) {
      const index = randomIntInRange(0, bots.length - 1);
      if (!bots[index]) continue;

      const { user_id } = bots[index];

      // Prevents the same bot from being added
      if (activeBots.includes(user_id)) continue;
      activeBots.push(user_id);

      // Determines how long this bot will study
      const duration = randomIntInRange(
        BOT_OPTIONS.MIN_STUDY,
        BOT_OPTIONS.MAX_STUDY
      );
      const start =
        randomIntInRange(
          BOT_OPTIONS.MIN_START_DELAY,
          BOT_OPTIONS.MAX_START_DELAY
        ) + now.toSeconds();
      const startDate = DateTime.fromSeconds(start);
      const stopDate = DateTime.fromSeconds(startDate.toSeconds() + duration);

      // Schedule bot start and stop jobs
      schedule.scheduleJob(startDate.toJSDate(), () => startBot(user_id));
      schedule.scheduleJob(stopDate.toJSDate(), () => stopBot(user_id));

      // Schedule adding friends after bot start
      schedule.scheduleJob(startDate.toJSDate(), () =>
        addFriends(user_id, allMembers)
      );
    }

    // Update active bot list in Redis if there are new active bots
    if (activeBots.length) {
      redisClient.sadd("activeBots", activeBots);
    }
  } catch (err) {
    console.log(err);
  }
}

async function addFriends(botId, allMembers) {
  try {
    //sendFriendRequest(botId);
    if (!allMembers.length) return;

    const isSend = isTrueBasedOnPercentage(
      process.env.BOTS_SEND_FRIEND_PERCENTAGE
    );

    if (isSend) {
      const targetId = allMembers[randomIntInRange(0, allMembers.length - 1)];
      const response = await sendFriendRequest(botId, targetId);
      console.log("bot friend request:", response);
    }

    const connection = pool.promise();

    const [friendRequests] = await connection.query(
      `SELECT friendship_id FROM friends WHERE friend_id = ? AND status = "pending"`,
      [botId]
    );
    friendRequests.map(async (request) => {
      const accepted = isTrueBasedOnPercentage(50);
      const response = await replyFriendRequest({
        notificationId: request.friendship_id,
        userId: botId,
        accepted,
        createChat: false,
      });
      console.log("bot reply:", response);
    });
  } catch (err) {
    console.log(err);
  }
}

async function startBot(userId) {
  try {
    const now = Math.floor(new Date().getTime() / 1000);

    const connection = pool.promise();
    const [subjects, groups, friends] = await Promise.all([
      subjectsCache(connection, userId),
      userGroupsCache(connection, userId),
      userFriendsCache(connection, userId),
    ]);
    const subject = subjects[randomIntInRange(0, subjects.length - 1)];

    if (!subject) return;
    console.log("bot start", userId);
    if (groups.length) {
      mainIo.to(groups).emit(`studying`, userId, subject);

      const groupIdIndex = randomIntInRange(0, groups.length - 1);
      cacheActiveGroup(userId, groups[groupIdIndex], now);
    }
    if (friends.length) {
      mainIo.to(friends).emit(`studying`, userId, subject);
    }
    redisClient.rpush(
      `user:${userId}:subject:${subject.subject_id}`,
      `[${now},0]`
    );
    cacheActiveSubject(userId, subject, now);
    addActiveUserCache(userId);
  } catch (err) {
    console.log(err);
  }
}

async function stopBot(userId) {
  try {
    redisClient.srem("activeBots", userId);
    redisClient.del(`user:${userId}:activeGroup`);
    const now = Math.floor(new Date().getTime() / 1000);

    const connection = pool.promise();

    const [groups, friends, activeSubject] = await Promise.all([
      userGroupsCache(connection, userId),
      userFriendsCache(connection, userId),
      activeSubjectCache(userId),
    ]);

    if (groups.length) {
      mainIo.to(groups).emit(`stopStudying`, userId, { status: "disconnect" });
    }
    if (friends.length) {
      mainIo.to(friends).emit(`stopStudying`, userId, { status: "disconnect" });
    }

    if (!activeSubject || activeSubject.subject_id === "0") {
      return await redisClient.del(`user:${userId}:activeSubject`);
    }

    const activity = JSON.parse(
      await redisClient.rpop(
        `user:${userId}:subject:${activeSubject.subject_id}`
      )
    );

    if (!activity) return;

    const start = activity[0];

    const duration = now - start;

    console.log("bot stop", userId, duration);

    await redisClient.del(`user:${userId}:activeSubject`);

    if (duration > MAX_STUDY_TIME) {
      console.log("max study exceeded: ", duration);
      return;
    }

    if (typeof duration !== "number") return;

    for (let i = -12; i < 12; i++) {
      redisClient.zincrby(`users:${i}:dayTotal`, duration, userId);
      redisClient.zincrby(`users:${i}:weekTotal`, duration, userId);
      redisClient.zincrby(`users:${i}:monthTotal`, duration, userId);
    }

    redisClient.rpush(
      `user:${userId}:subject:${activeSubject.subject_id}`,
      `[${start},${duration}]`
    );
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  botManager,
};
