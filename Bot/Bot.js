const {
  generateRandomId,
  hashing,
  randomIntInRange,
} = require("../Utils/tool");
const fs = require("fs");
const combinedNameData = require("../data/combinedNames.json");
const groupsData = require("../data/Groups.json");
const colors = require("../data/GroupColors.json");
const pool = require("../model/pool");
const crypto = require("crypto");
const { DateTime } = require("luxon");
const sharp = require("sharp");
const axios = require("axios");
const schedule = require("node-schedule");
const redisClient = require("../model/redis");
const {
  activeSubjectCache,
  subjectsCache,
  userCache,
  NotificationCache,
  dmRoomsCache,
  getActiveUsers,
  addActiveUserCache,
  removeActiveUserCache,
  subjectCache,
} = require("../services/redisLoader");
const { mainIo } = require("../sockets/mainIo");
const { MAX_STUDY_TIME } = require("../Constant");
const { fr, sendFriendRequest, replyFriendRequest } = require("../API/friend");

/**create bots */
async function createBots(length) {
  const connection = pool.promise();

  const chosenBotIds = {};
  const [allIds] = await connection.query("SELECT user_id from users");
  allIds.map((obj) => {
    chosenBotIds[obj.user_id] = true; //make sure we don't choose the same id when generating bots
  });

  const newBots = [];

  for (let Z = 0; Z < length; Z++) {
    const { name, userId, timeZone, gender, profileImage } =
      combinedNameData[randomIntInRange(0, combinedNameData.length - 1)];
    if (chosenBotIds.hasOwnProperty(userId)) {
      // since we're choosing randomly we have to make sure there's no repeats
      Z--;
      console.log("Duplicate " + userId + " (skipped)");
      continue;
    } else {
      chosenBotIds[userId] = true;
    }

    if (name.toLowerCase().includes("chess")) {
      Z--;
      continue;
    }
    if (name.length >= 40) {
      Z--;
      continue;
      //This will cause server to crash since name is VARCHAR(40)
    }

    const password = "thisisbotspassword";
    const hashed = hashing(password);

    const keySalt = crypto.randomBytes(32).toString("hex");
    const iv = crypto.randomBytes(16).toString("hex");

    let userDateTime = DateTime.now().setZone(timeZone);
    //randomize date
    const subtractedDate = Math.floor(Math.random() * 30) + 20;
    userDateTime = userDateTime.minus({ days: subtractedDate });
    const unixTimestamp =  userDateTime.startOf('day').toSeconds();
    const userInfo = {
      name: name,
      hashed_password: hashed[1],
      salt: hashed[0],
      user_id: userId,
      timezone: timeZone,
      created_at: unixTimestamp,
      key_salt: keySalt,
      iv: iv,
      type: -1,
    };


    if (!!profileImage) {
      createChessProfileImg(userId, profileImage);
    } else {
      createProfileImg(40, userId, gender);
    }
  }

  console.log("BOTS SUCCESSFULLY ADDED!");
}

/**create profile imggs for each users*/
function createProfileImg(percentage, userId, gender) {
  const isProfile = Math.random() < percentage / 100;
  if (isProfile) {
    let filePath = `./data/profile-imgs/${gender}`;
    fs.readdir(filePath, async (err, files) => {
      if (err) {
        console.log(err);
      } else {
        const sortedFiles = files.sort();
        const index = randomIntInRange(0, files.length);
        const fileAtIndex = sortedFiles[index];
        const imgPath = filePath + "/" + fileAtIndex;
        //console.log(imgPath);
        if (fileAtIndex) {
          // Construct the full path to the file
          //const filePath = path.join(directoryPath, fileAtIndex);
          await sharp(imgPath)
            .toFormat("jpeg")
            .resize({ width: 800, height: 800 })
            .jpeg({ quality: 40 })
            .toFile(`./public/profile-images/${userId}.jpeg`);
        }
      }
    });
  }
}

function createChessProfileImg(userId, imgSrc) {
  if (imgSrc === "https://www.chess.com/bundles/web/images/user-image.svg") {
    // Do not put default chess image
    return;
  }
  axios
    .get(imgSrc)
    .then((response) => {
      return axios.get(imgSrc, { responseType: "arraybuffer" });
    })
    .then((res) => {
      return sharp(res.data)
        .resize({ width: 800, height: 800 })
        .jpeg({ quality: 40 })
        .toFile(`./public/profile-images/${userId}.jpeg`);
    })
    .catch((err) => {
      console.log(`Couldn't process: ${err}`);
    });
}

async function addFriends(botId, allMembers) {
  try {
    //sendFriendRequest(botId);
    if (!allMembers.length) return;

    const isSend = randomIntInRange(0, 9) === 0 ? false : true;

    if (isSend) {
      const targetId = allMembers[randomIntInRange(0, allMembers.length - 1)];
      const response = await sendFriendRequest(botId, targetId);
      console.log(response);
    }

    const friendRequests = await NotificationCache(botId, 0, false);
    friendRequests.map(async (request) => {
      const accepted = randomIntInRange(0, 1) === 0 ? false : true;
      const response = await replyFriendRequest(
        botId,
        request.f,
        accepted,
        request.i
      );
      console.log(response);
    });
  } catch (err) {
    console.log(err);
  }
}

async function startBot(userId) {
  try {
    const now = Math.floor(new Date().getTime() / 1000);

    const subjects = await subjectsCache(userId);
    const subject = subjects[randomIntInRange(0, subjects.length - 1)];
    const userInfo = await userCache(userId);
    if (!subject || !userInfo) return;
    const { groups, friends, name } = userInfo;
    console.log("start", userId, name);
    if (groups.length) {
      mainIo.to(groups).emit(`studying:${userId}`, subject);
    }
    if (friends.length) {
      mainIo.to(friends).emit(`studying:${userId}`, subject);
    }
    const { created_at, id } = subject;
    const start = now - created_at;
    redisClient.rpush(`user:${userId}:subject:${id}`, `[${start},0]`);
    redisClient.hset(`user:${userId}`, `ActiveSubject`, `${id}:${now}`);
    addActiveUserCache(userId);
  } catch (err) {
    console.log(err);
  }
}

async function stopBot(userId) {
  try {
    const now = Math.floor(new Date().getTime() / 1000);

    redisClient.hdel(`user:${userId}`, `ActiveSubject`);
    redisClient.srem("activeBots", userId);
    const activeSubject = await activeSubjectCache(userId);
    if (!activeSubject || activeSubject.id === "0") return;
    const subject = await subjectCache(userId, activeSubject.id);
    const userInfo = await userCache(userId);
    if (!userInfo || !subject) return;

    const activity = JSON.parse(
      await redisClient.rPop(`user:${userId}:subject:${activeSubject.id}`)
    );

    if (!activity) return;

    const start = activity[0];

    const { created_at } = subject;

    const duration = now - created_at - start;

    if (duration > MAX_STUDY_TIME) {
      console.log("max study exceeded: ", duration);
      return;
    }

    for (let i = -12; i < 12; i++) {
      redisClient.zincrby(`users:${i}:dayTotal`, duration, userId);
      redisClient.zincrby(`users:${i}:weekTotal`, duration, userId);
      redisClient.zincrby(`users:${i}:monthTotal`, duration, userId);
    }

    redisClient.rpush(
      `user:${userId}:subject:${activeSubject.id}`,
      `[${start},${duration}]`
    );

    const { groups, friends, name } = userInfo;
    console.log("stop", userId, name, duration);

    if (groups.length) {
      mainIo
        .to(groups)
        .emit(`stopStudying:${userId}`, { status: "rest", duration });
    }
    if (friends.length) {
      mainIo
        .to(friends)
        .emit(`stopStudying:${userId}`, { status: "rest", duration });
    }
  } catch (err) {
    console.log(err);
  }
}

/* const BOT_MIN_STUDY = 5; //10 min = min time bot will study
const BOT_MAX_STUDY = 6; //2 hr = max time bot will study
const MAX_START_DELAY = 60; //1 hr = starts atleast 1hr from being assigned */

const BOT_MIN_STUDY = 60 * 10; //10 min = min time bot will study
const BOT_MAX_STUDY = 60 * 60 * 2; //2 hr = max time bot will study
const MAX_START_DELAY = 60 * 60 * 2; //1 hr = starts atleast 1hr from being assigned

async function botSelector(numbers) {
  try {
    const connection = pool.promise();
    const [bots] = await connection.query(
      `SELECT user_id FROM users WHERE type = -1`
    );
    //const [subjects] = await connection.query(`SELECT timeline, id, timeline_sum, created_at FROM subjects`)
    const now = DateTime.now();
  
    const activeBots = await redisClient.smembers("activeBots");
  
    const allMembers = await getActiveUsers("month");
  
    for (let i = 0; i < numbers; i++) {
      const index = randomIntInRange(0, bots.length - 1);
      const { user_id } = bots[index];
      //this prevents same bot from being added
      if (activeBots.includes(user_id)) continue;
      activeBots.push(user_id);
  
      //determines how long this bot will study
      const duration = randomIntInRange(BOT_MIN_STUDY, BOT_MAX_STUDY);
      const start = randomIntInRange(5, MAX_START_DELAY) + now.toSeconds();
      const startDate = DateTime.fromSeconds(start);
      const stopDate = DateTime.fromSeconds(startDate.toSeconds() + duration);
      //console.log(startDate.toSeconds() - stopDate.toSeconds())
      //const [[subject]] = await connection.query(`SELECT timeline, id, timeline_sum, created_at FROM subjects WHERE user_id = ?`, [user_id]);
      const scheduleStart = schedule.scheduleJob(startDate.toJSDate(), () => {
        startBot(user_id);
      });
      const scheduleStop = schedule.scheduleJob(stopDate.toJSDate(), () => {
        stopBot(user_id);
      });
  
      const scheduleFriend = schedule.scheduleJob(startDate.toJSDate(), () => {
        addFriends(user_id, allMembers);
      });
      //Send friend request after finished studying
    }
  
    //update active bot list in redis
    redisClient.sadd("activeBots", activeBots);
  } catch (err) {
    console.log(err);
  };
}

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

async function deleteBots() {
  const connection = pool.promise();

  const [bots] = await connection.query(
    `SELECT user_id, groups FROM users WHERE type = -1`
  );
  const botUserIds = bots.map((bot) => {
    return bot.user_id;
  });
  if (botUserIds.length) {
    connection.query(`DELETE FROM users WHERE type = -1`);
    connection.query(`DELETE FROM subjects WHERE user_id IN (?)`, [botUserIds]);
  }

  //exit group
  bots.map(async ({ user_id, groups }) => {
    await redisClient.del(`user:${user_id}`); //remove usercache
    await redisClient.del(`user:${user_id}:subjects`); //remove dayTotal
    await removeActiveUserCache(); //remove from daily/weekly/monthly users cache

    fs.unlink(`./public/profile-images/${user_id}.jpeg`, (err) => {
      if (err) {
        console.error(`Error deleting ${user_id}:`, err);
      } else {
        console.log(`${user_id} deleted successfully`);
      }
    });

    const groupsArr = groups.split(",");
    groupsArr.map(async (group) => {
      await connection.query(
        `UPDATE \`groups\` 
        SET members = CASE 
            WHEN members = '' THEN ?
            WHEN members LIKE ? OR members LIKE ? OR members LIKE ? THEN
              members
            ELSE CONCAT(members, ',', ?)
          END WHERE group_id = ?`,
        [
          user_id,
          `%,${user_id},%`,
          `${user_id},%`,
          `%,${user_id}`,
          user_id,
          group,
        ]
      );
    });
  });
}

async function createGroups(length) {
  const connection = pool.promise();
  const [bots] = await connection.query(
    `SELECT user_id, groups FROM users WHERE type = -1`
  );
  const [groups] = await connection.query(`SELECT group_id FROM groups`);

  console.log("Starting Groups Generation", groups);
  const groupIds = [];

  for (let i = 0; i < length; i++) {
    const groupId = generateRandomId(8);
    const index = randomIntInRange(0, groupsData.length - 1);
    const groupData = groupsData[index];

    if (groups.find((group) => group.group_id === groupData.group_id)) {
      console.log("Duplicated");
      continue;
    }

    groups.push({ group_id: groupId });

    const hashed = hashing("0");
    const max_members = randomIntInRange(10, 50);
    const membersLength = randomIntInRange(10, max_members);
    const members = [];
    const likes = [];
    while (members.length <= membersLength) {
      const selectedBotIndex = randomIntInRange(0, bots.length - 1);
      const selectedBot = bots[selectedBotIndex];

      if (!members.includes(selectedBot.user_id)) {
        members.push(selectedBot.user_id);
        connection.query(
          `
          UPDATE users
          SET \`groups\` = CASE
            WHEN \`groups\` = '' THEN ?
            ELSE CONCAT(\`groups\`, ',', ?)
          END
          WHERE user_id = ?
        `,
          [groupId, groupId, selectedBot.user_id]
        );
        const isLike = randomIntInRange(0, 6);
        if (!isLike) {
          likes.push(selectedBot.user_id);
        }
      }
    }
    const leader = members[0];
    const colorIndex = randomIntInRange(0, colors.length - 1);
    const color = colors[colorIndex];
    const { name, description, tags } = groupData;
    const visibility = randomIntInRange(0, 7) <= 1;

    const stringlifiedLikes = JSON.stringify(likes)
      .slice(1, -1)
      .replaceAll(`"`, "");
    const stringlifiedMembers = JSON.stringify(members)
      .slice(1, -1)
      .replaceAll(`"`, "");
    const goal_hr = randomIntInRange(4, 8);
    const font = randomIntInRange(0, 13);

    const groupInfo = {
      name,
      description,
      tags: JSON.stringify(tags),
      visibility,
      password: hashed[1],
      salt: hashed[0],
      max_members,
      date: Math.floor(new Date().getTime() / 1000),
      group_id: groupId,
      leader: leader,
      likes: stringlifiedLikes,
      members: stringlifiedMembers,
      color: color,
      average_hr: 0,
      goal_hr,
      font,
    };
    connection.query(`INSERT INTO \`groups\` SET ?`, groupInfo);

    const roomInfo = {
      id: generateRandomId(10),
    };
    connection.query("INSERT INTO chatrooms set ?", roomInfo);
  }
  console.log("Groups Generation Done");
}

async function randomFriend(min, max) {
  const connection = pool.promise();
  const [bots] = await connection.query(
    `SELECT friends, user_id FROM users WHERE type = -1`
  );
  const lastBotIndex = bots.length - 1;
  for (const bot of bots) {
    const { user_id } = bot;
    const nFriends = randomIntInRange(min, max);
    const friends = [];

    for (let i = 0; i < nFriends; i++) {
      const friendIndex = randomIntInRange(0, lastBotIndex);
      const friend = bots[friendIndex].user_id;
      if (!friends.includes(friend) && !friends.includes(user_id)) {
        friends.push(friend);
        await connection.query(
          `
          UPDATE users
          SET friends = CASE
            WHEN friends = '' THEN ?
            ELSE CONCAT(friends, ',', ?)
          END
          WHERE user_id = ?
        `,
          [user_id, user_id, friend]
        );
      }
    }

    if (friends.length) {
      const stringlified = JSON.stringify(friends)
        .slice(1, -1)
        .replaceAll(`"`, "");
      await connection.query(
        `
      UPDATE users
      SET friends = CASE
        WHEN friends = '' THEN ?
        ELSE CONCAT(friends, ',', ?)
      END
      WHERE user_id = ?
    `,
        [stringlified, stringlified, user_id]
      );
    }
  }
  console.log("BOTS FRIENDS ADDED!");
}

async function createBotRankings() {
  const connection = pool.promise();
  const [botIds] = await connection.query(
    `SELECT user_id FROM users WHERE type = -1`
  );
  const botUsers = [];

  await Promise.all(
    botIds.map(async (bot) => {
      const thisBotId = bot.user_id;
      let [othersTimeline] = await connection.query(
        `SELECT timeline, created_at FROM subjects WHERE user_id = ?`,
        [thisBotId]
      );
      othersTimeline = othersTimeline.filter((tl) => tl.timeline.length > 0)[0]; //only the first subject will have a timeline
      botUsers.push({
        id: thisBotId,
        timeline: JSON.parse("[" + othersTimeline.timeline + "]"),
        created_at: parseInt(othersTimeline.created_at),
      });
    })
  );

  // we will use this to create the ranking tables
  let botDailyRanking = {};
  let botWeeklyRanking = {};
  let botMonthlyRanking = {};

  const LUXON_NOW = DateTime.fromJSDate(new Date()).toUTC().startOf("day");

  botUsers.map((bot, i) => {
    const botStudyByHour = {};
    const botWeeklyTrend = {};
    const botMonthlyTrend = {};
    const DP = DateTime.fromSeconds(bot.created_at)
      .startOf("hour")
      .toSeconds();
    let botWeekTotal = 0;
    let botMonthTotal = 0;
    bot.timeline.map((tl, i) => {
      //it's garunteed that each hour will have a value
      const currSeconds = DP + i * 3600;
      botStudyByHour[currSeconds] = tl[1];
      botWeekTotal += tl[1];
      botMonthTotal += tl[1];

      const UTC_CURRENT_DAY = DateTime.fromSeconds(currSeconds, {
        zone: "utc",
      });
      if (UTC_CURRENT_DAY.weekday === 1) {
        //start of week, save to weekly ranking
        botWeeklyTrend[
          DateTime.fromSeconds(currSeconds, { zone: "utc" })
            .minus({ weeks: 1 })
            .toSeconds()
        ] = botWeekTotal;
        botWeekTotal -=
          botStudyByHour[UTC_CURRENT_DAY.minus({ weeks: 1 }).toSeconds()] || 0; //remove last week's info
      } else if (UTC_CURRENT_DAY.weekday === 2 && UTC_CURRENT_DAY.hour === 0) {
        botWeekTotal = 0;
      }

      const FIRST_DAY_OF_MONTH =
        DateTime.fromSeconds(currSeconds).startOf("month");
      if (UTC_CURRENT_DAY.hasSame(FIRST_DAY_OF_MONTH, "day")) {
        //start of month, save to monthly ranking
        botMonthlyTrend[
          DateTime.fromSeconds(currSeconds, { zone: "utc" })
            .minus({ months: 1 })
            .toSeconds()
        ] = botMonthTotal;
        botMonthTotal -=
          botStudyByHour[UTC_CURRENT_DAY.minus({ months: 1 }).toSeconds()] || 0; //remove last month's info
      } else if (
        UTC_CURRENT_DAY.diff(FIRST_DAY_OF_MONTH, ["days"]).days === 2 &&
        UTC_CURRENT_DAY.hour === 0
      ) {
        botMonthTotal = 0;
      }
    });

    for (const [key, value] of Object.entries(botStudyByHour)) {
      if (!!botDailyRanking[key]) {
        botDailyRanking[key].push({ u: bot.id, t: value });
      } else {
        botDailyRanking[key] = [{ u: bot.id, t: value }];
      }
    }

    for (const [key, value] of Object.entries(botWeeklyTrend)) {
      if (!!botWeeklyRanking[key]) {
        botWeeklyRanking[key].push({ u: bot.id, t: value });
      } else {
        botWeeklyRanking[key] = [{ u: bot.id, t: value }];
      }
    }

    for (const [key, value] of Object.entries(botMonthlyTrend)) {
      if (!!botMonthlyRanking[key]) {
        botMonthlyRanking[key].push({ u: bot.id, t: value });
      } else {
        botMonthlyRanking[key] = [{ u: bot.id, t: value }];
      }
    }
  });

  let entries = Object.entries(botDailyRanking);
  for (let en = 0; en < entries.length; en++) {
    let key = entries[en][0];
    botDailyRanking[key] = botDailyRanking[key].sort((a, b) => b.t - a.t);
    await connection.query(`DELETE FROM dailyRanking WHERE date = ?`, [key]);
    await connection.query(
      `INSERT INTO dailyRanking SET date = ?, ranking = ?`,
      [key, JSON.stringify(botDailyRanking[key])]
    );
  }

  entries = Object.entries(botWeeklyRanking);
  for (let en = 0; en < entries.length; en++) {
    let key = entries[en][0];
    botWeeklyRanking[key] = botWeeklyRanking[key].sort((a, b) => b.t - a.t);
    await connection.query(`DELETE FROM weeklyRanking WHERE date = ?`, [key]);
    await connection.query(
      `INSERT INTO weeklyRanking SET date = ?, ranking = ?`,
      [key, JSON.stringify(botWeeklyRanking[key])]
    );
  }

  entries = Object.entries(botMonthlyRanking);
  for (let en = 0; en < entries.length; en++) {
    let key = entries[en][0];
    botMonthlyRanking[key] = botMonthlyRanking[key].sort((a, b) => b.t - a.t);
    await connection.query(`DELETE FROM monthlyRanking WHERE date = ?`, [key]);
    await connection.query(
      `INSERT INTO monthlyRanking SET date = ?, ranking = ?`,
      [key, JSON.stringify(botMonthlyRanking[key])]
    );
  }

  console.log("BOTS RANKING GENERATED");
}

module.exports = {
  createBots,
  deleteBots,
  botManager,
  createGroups,
  randomFriend,
  createBotRankings,
};
