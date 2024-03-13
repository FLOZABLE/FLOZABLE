const { generateRandomId, hashing, randomIntInRange } = require('../tool');
const fs = require('fs');
const fullNameData = require('../data/DatasetsWithId.json');
const realisticNameData = require('../data/RealUserIdWithData.json');
const combinedNameData = require('../data/combinedNames.json');
const groupsData = require('../data/Groups.json');
const originalData = require('../data/Datasets.json');
const colors = require('../data/GroupColors.json');
const pool = require('../model/pool');
const crypto = require('crypto');
const { DateTime, Duration } = require('luxon');
const sharp = require("sharp");
const axios = require('axios');
const cron = require('node-cron');
const { mainIo } = require('../socket');
const schedule = require('node-schedule');
const redisClient = require('../model/redis');
const timeZones = require('../data/timeZones.json');
const csv = require("csvtojson");
const { activeSubjectCache, subjectsCache, timerCache, userCache, usersCache, NotificationCache, dmRoomMembersCache, dmRoomsCache } = require('../services/redisLoader');

/**create bots */
async function createBots(length) {
  const connection = pool.promise();

  const chosenBotIds = {};
  const [allIds] = await connection.query("SELECT user_id from users");
  allIds.map((obj) => {
    chosenBotIds[obj.user_id] = true; //make sure we don't choose the same id when generating bots
  })

  for (let Z = 0; Z < length; Z++) {
    const { name, userId, timeZone, gender, profileImage } = combinedNameData[randomIntInRange(0, combinedNameData.length - 1)];
    if (chosenBotIds.hasOwnProperty(userId)) {
      // since we're choosing randomly we have to make sure there's no repeats
      Z--;
      console.log("Duplicate " + userId + " (skipped)");
      continue;
    }
    else {
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

    const password = '0';
    let hashed = hashing(password);

    const keySalt = crypto.randomBytes(32).toString('hex');
    const iv = crypto.randomBytes(16).toString('hex');

    let userDateTime = DateTime.now().setZone(timeZone);
    //randomize date
    const subtractedDate = Math.floor(Math.random() * 30) + 20;
    userDateTime = userDateTime.minus({ days: subtractedDate });
    const twelveAmDateTime = userDateTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    const unixTimestamp = Math.floor(twelveAmDateTime.toMillis() / 1000);
    const userInfo = {
      name: name,
      hashed_password: hashed[1],
      salt: hashed[0],
      user_id: userId,
      timezone: timeZone,
      datum_point: unixTimestamp,
      key_salt: keySalt,
      iv: iv,
      type: -1
    };

    await connection.query('INSERT INTO users SET ?', userInfo);

    const maxSubjects = randomIntInRange(1, 5);
    const possibleSubjects = [
      ["Math", "Math", "Math", "Math", "Calculus", "Trig"],
      ["Science", "Science", "Biology", "Environment", "Biology", "Anatomy", "Biology", "Biology"],
      ["Science", "Science", "Chemistry", "Chemistry", "Chemistry", "Biochemistry"],
      ["Physics", "Physics", "Physics", "Physics 1", "Physics 2", "Physics C"],
      ["French", "French", "Chinese", "Chinese", "Spanish", "Spanish", "Spanish", "Spanish", "Latin", "Latin"],
      ["English", "English", "English", "ELA", "ELA", "Lit", "Literature", "Literature", "Language Arts"],
      ["History", "History", "APUSH", "US History", "U.S. History", "Social Studies", "Social Studies"],
      ["Reading", "Piano", "Cooking", "Art", "Art", "Reading", "Piano", "Piano", "PE", "Coding"],
      ["Astronomy", "Computer Science", "Essays", "Comp Sci", "Engineering", "DE", "College Apps", "Shakespeare", "Essays", "Computer Science", "Music Theory", "Music Theory", "Art"]
    ]

    for (let subjectNum = 0; subjectNum < maxSubjects; subjectNum++) {
      const subjectId = generateRandomId(10);
      const datum_point = unixTimestamp;

      const subjectTimeline = [];

      let timelineSum = 0;

      if (subjectNum === 0) {
        let prevTime = unixTimestamp
        let currTime = unixTimestamp;
        const timeNow = new Date().getTime() / 1000;
        const possibleDurations = [0, 0, 0, 60, 120, 180, 240, 360, 1200, 1500, 1800, 2400];
        while (currTime < timeNow - 86400) { //end at yesterday
          const duration = Math.floor((1 + Math.random() - 0.5) * possibleDurations[randomIntInRange(0, possibleDurations.length - 1)]);
          subjectTimeline.push([currTime - prevTime, duration]);
          timelineSum += duration + currTime - prevTime;
          prevTime = currTime + duration;
          currTime += 3600; //currTime will always be the start of the hour
        }
      }

      let stringTimeline = JSON.stringify(subjectTimeline);
      stringTimeline = stringTimeline.slice(1, stringTimeline.length - 1);

      const subjectCategory = randomIntInRange(0, possibleSubjects.length - 1);
      let subjectName = possibleSubjects[subjectCategory];
      subjectName = subjectName[randomIntInRange(0, subjectName.length - 1)];
      possibleSubjects.splice(subjectCategory, 1);

      const subject = {
        id: subjectId,
        name: subjectName,
        user_id: userId,
        icon: 'others',
        color: '#000000',
        timeline: stringTimeline,
        timeline_sum: timelineSum,
        datum_point
      };
      await connection.query(`INSERT INTO subjects SET ?`, [subject]);
    }

    if (!!profileImage) {
      createChessProfileImg(userId, profileImage);
    }
    else {
      createProfileImg(40, userId, gender);
    }
  };

  console.log("BOTS SUCCESSFULLY ADDED!");
};

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
        const imgPath = filePath + '/' + fileAtIndex;
        //console.log(imgPath);
        if (fileAtIndex) {
          // Construct the full path to the file
          //const filePath = path.join(directoryPath, fileAtIndex);
          await sharp(imgPath)
            .toFormat('jpeg')
            .resize({ width: 800, height: 800 })
            .jpeg({ quality: 40 })
            .toFile(`./public/profile-images/${userId}.jpeg`);
        }
      }
    })
  }
};


function createChessProfileImg(userId, imgSrc) {
  if (imgSrc === "https://www.chess.com/bundles/web/images/user-image.svg") {
    // Do not put default chess image
    return;
  }
  axios.get(imgSrc)
    .then((response) => {
      return axios.get(imgSrc, { responseType: 'arraybuffer' })
    })
    .then((res) => {
      return sharp(res.data)
        .resize({ width: 800, height: 800 })
        .jpeg({ quality: 40 })
        .toFile(`./public/profile-images/${userId}.jpeg`)
    })
    .catch((err) => {
      console.log(`Couldn't process: ${err}`);
    })
};

async function addFriends(botId) {
  try {
    sendFriendRequest(botId);
    replyFriendRequests(botId);
  } catch (err) {
    console.log(err);
  };
};

async function sendFriendRequest(botId) {
  try {

    const isSend = randomIntInRange(0, 9);

    //change = 10%
    if (isSend !== 0) return;

    const allMembers = await redisClient.sMembers("allMembers");

    if (!allMembers.length) return;

    const targetId = allMembers[randomIntInRange(0, allMembers.length - 1)];

    if (botId === targetId) return;

    const targetUserInfo = await userCache(targetId);
    if (!targetUserInfo) return null;

    const { friends, name } = targetUserInfo;
    if (friends.includes(botId)) return;

    const friendRequests = await NotificationCache(targetId, 0, false);
    const prevFriendReq = friendRequests.find(friendReq => { return friendReq.f === botId });
    if (prevFriendReq) return null;

    const id = generateRandomId(5);
    const date = Math.floor(new Date().getTime() / (1000 * 60));
    const notificationUser = await userCache(botId);
    const socketNotif = { i: id, t: 0, f: notificationUser, d: date };
    const notification = { i: id, t: 0, f: botId, d: date };
    mainIo.to(targetId).emit('notification', socketNotif);
    //to target user
    redisClient.sAdd(`user:${targetId}:notifications`, JSON.stringify(notification));

    //to me
    const ongoing = { i: id, t: -2, f: targetId };
    redisClient.sAdd(`user:${botId}:notifications`, JSON.stringify(ongoing));
    console.log('send to', targetId)
  } catch (error) {
    console.log(error)
  };
};

async function replyFriendRequests(userId) {
  try {
    const allMembers = await redisClient.sMembers("allMembers");

    if (!allMembers.length) return;

    const friendRequests = await NotificationCache(userId, 0, false);
    friendRequests.map(async (friendReq) => {
      const targetId = friendReq.f;

      redisClient.sRem(`user:${userId}:notifications`, JSON.stringify(friendReq));
      //remove it from ongoing friend req list
      const ongoing = { i: friendReq.i, t: -2, f: userId };
      redisClient.sRem(`user:${targetId}:notifications`, JSON.stringify(ongoing));

      const accepted = randomIntInRange(0, 1);
      if (!accepted) {
        return;
      };
      const connection = pool.promise();
      const userInfo = await userCache(userId);
      const targetInfo = await userCache(targetId);
      const { friends } = userInfo;

      if (!friends.includes(userId)) {
        await connection.query(`
        UPDATE users
        SET friends = CASE
          WHEN friends = '' THEN ?
          ELSE CONCAT(friends, ',', ?)
        END
        WHERE user_id = ?
      `, [
          targetId,
          targetId,
          userId,
        ]);

        await connection.query(`
      UPDATE users
      SET friends = CASE
        WHEN friends = '' THEN ?
        ELSE CONCAT(friends, ',', ?)
      END
      WHERE user_id = ?
    `, [
          userId,
          userId,
          targetId,
        ]);
        console.log('friend accepted')
        const id = generateRandomId(5);
        const date = Math.floor(new Date().getTime() / (1000 * 60));
        const notification = { i: id, t: 1, f: userId, d: date };
        const notificationUser = await userCache(userId);
        const socketNotif = { i: id, t: 1, f: notificationUser, d: date };
        mainIo.to(targetId).emit('notification', socketNotif);
        redisClient.sAdd(`user:${targetId}:notifications`, JSON.stringify(notification));

        //update cached value of user
        friends.push(targetId);
        redisClient.hSet(`user:${userId}`, 'friends', friends.join(','));
        targetInfo.friends.push(userId);
        redisClient.hSet(`user:${targetId}`, 'friends', targetInfo.friends.join(','));

        //create chat only if it does not exist
        const [[{ record_count }]] = await connection.query(`SELECT COUNT(*) AS record_count
      FROM chatrooms
      WHERE 
        (members LIKE ? AND members LIKE ?)
        OR
        (members LIKE ? AND members LIKE ?)
      LIMIT 1;`, [`%${userId}%`, `%${targetId}%`, `%${targetId}%`, `%${userId}%`]);

        if (!record_count) {
          const members = [userId, targetId];
          const roomInfo = {
            id: generateRandomId(10),
            type: 1,
            members: JSON.stringify(members).slice(1, -1).replaceAll(`"`, "")
          }
          await connection.query(`
        INSERT INTO chatrooms SET ?
      `, [roomInfo]);

          const myDmRooms = await dmRoomsCache(userId);
          myDmRooms.push(roomInfo.id);
          const targetDmRooms = await dmRoomsCache(targetId);
          targetDmRooms.push(roomInfo.id);
          redisClient.hSet(`user:${userId}`, 'dmRooms', JSON.stringify(myDmRooms));
          redisClient.hSet(`user:${targetId}`, 'dmRooms', JSON.stringify(targetDmRooms));
          redisClient.sAdd(`room:${roomInfo.id}`, members);

          //remove chat request if any
          const myChatRequests = await NotificationCache(userId, 4, false);
          const chatRequest = myChatRequests.find(chatRequest => { return chatRequest.f === targetId });
          if (chatRequest) {
            redisClient.sRem(`user:${userId}:notifications`, JSON.stringify(chatRequest));
          };

          const targetChatRequests = await NotificationCache(targetId, 4, false);
          const targetchatRequest = targetChatRequests.find(chatRequest => { return chatRequest.f === targetId });
          if (targetchatRequest) {
            redisClient.sRem(`user:${targetId}:notifications`, JSON.stringify(targetchatRequest));
          };
        };
      };
    })
  } catch (error) {
    console.log(error)
  };
}

async function startBot(userId) {
  try {
    const subjects = await subjectsCache(userId);
    const subject = subjects[randomIntInRange(0, subjects.length - 1)];
    const userInfo = await userCache(userId);
    if (!subject || !userInfo) return;
    const { groups, friends, name } = userInfo;
    console.log('start', userId, name)
    if (groups.length) {
      mainIo.to(groups).emit(`studying:${userId}`, subject);
    };
    if (friends.length) {
      mainIo.to(friends).emit(`studying:${userId}`, subject);
    };
    const now = Math.floor(new Date().getTime() / 1000);
    const { timeline_sum, datum_point, id } = subject;
    const start = now - datum_point - timeline_sum;
    redisClient.rPush(`user:${userId}:subject:${id}`, `[${start},0]`);
    redisClient.hSet(`user:${userId}`, `ActiveSubject`, `${id}:${now}`);
    subject.timeline_sum += start;
    redisClient.hSet(`user:${userId}:subjects`, id, JSON.stringify(subject));
    redisClient.sAdd(`allMembers`, `${userId}`);

  } catch (err) {
    console.log(err);
  };
};

async function stopBot(userId) {
  try {
    redisClient.sRem('activeBots', userId);
    const activeSubject = await activeSubjectCache(userId);
    const userInfo = await userCache(userId);
    const subjects = await subjectsCache(userId);
    const [subject] = subjects.filter((sub) => sub.id === activeSubject.id);
    if (!userInfo || !subject || !activeSubject || !activeSubject.id) return;
    console.log(subject);
    const { groups, friends, name } = userInfo;

    if (groups.length) {
      mainIo.to(groups).emit(`stopStudying:${userId}`, "disconnect");
    };
    if (friends.length) {
      mainIo.to(friends).emit(`stopStudying:${userId}`, "disconnect");
    };

    const { datum_point, timeline_sum, id } = subject;
    const now = Math.floor(new Date().getTime() / 1000);

    const duration = now - datum_point - timeline_sum;
    console.log('stop', userId, name, duration);
    //redisClient.incrBy(`user:${userId}:dayTotal`, duration);
    for (let i = -12; i < 12; i++) {
      redisClient.zIncrBy(`user:${userId}:dayTotal`, duration, i.toString());
    };
    subject.timeline_sum += duration;
    redisClient.hSet(`user:${userId}:subjects`, id, JSON.stringify(subject));
    const activity = JSON.parse(await redisClient.rPop(`user:${userId}:subject:${id}`));
    redisClient.hDel(`user:${userId}`, `ActiveSubject`);
    if (activity) {
      const start = activity[0];
      redisClient.rPush(`user:${userId}:subject:${id}`, `[${start},${duration}]`);
    };
  } catch (err) {
    console.log(err);
  };
};

/* const BOT_MIN_STUDY = 5; //10 min = min time bot will study
const BOT_MAX_STUDY = 6; //2 hr = max time bot will study
const MAX_START_DELAY = 60; //1 hr = starts atleast 1hr from being assigned */

const BOT_MIN_STUDY = 60 * 10; //10 min = min time bot will study
const BOT_MAX_STUDY = 60 * 60 * 2; //2 hr = max time bot will study
const MAX_START_DELAY = 60 * 60 * 2; //1 hr = starts atleast 1hr from being assigned

async function botSelector(numbers) {
  const connection = pool.promise();
  const [bots] = await connection.query(`SELECT user_id FROM users WHERE type = -1`);
  //const [subjects] = await connection.query(`SELECT timeline, id, timeline_sum, datum_point FROM subjects`)
  const now = DateTime.now();

  const activeBots = await redisClient.sMembers('activeBots');
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
    //const [[subject]] = await connection.query(`SELECT timeline, id, timeline_sum, datum_point FROM subjects WHERE user_id = ?`, [user_id]);
    const scheduleStart = schedule.scheduleJob(startDate.toJSDate(), () => { startBot(user_id) });
    const scheduleStop = schedule.scheduleJob(stopDate.toJSDate(), () => { stopBot(user_id) });

    const scheduleFriend = schedule.scheduleJob(startDate.toJSDate(), () => { addFriends(user_id) });
    //Send friend request after finished studying
  };

  //update active bot list in redis
  redisClient.sAdd('activeBots', activeBots);
};

async function botManager(numbers) {
  const activeBots = await redisClient.sMembers('activeBots');
  await Promise.all(activeBots.map(async (botId) => {
    await stopBot(botId);
  }));
  botSelector(numbers);
  schedule.scheduleJob('0 */5 * * *', async () => {
    console.log('run bot')
    botSelector(numbers);
  });
};

async function deleteBots() {
  const connection = pool.promise();



  const [bots] = await connection.query(`SELECT user_id, groups FROM users WHERE type = -1`);
  const botUserIds = bots.map((bot) => { return bot.user_id });
  if (botUserIds.length) {
    connection.query(`DELETE FROM users WHERE type = -1`);
    connection.query(`DELETE FROM subjects WHERE user_id IN (?)`, [botUserIds]);
  }


  //exit group
  bots.map(async ({ user_id, groups }) => {

    await redisClient.del(`user:${user_id}:dayTotal`); //remove dayTotal
    await redisClient.del(`user:${user_id}:weekTotal`); //remove dayTotal
    await redisClient.del(`user:${user_id}:monthTotal`); //remove dayTotal
    await redisClient.del(`user:${user_id}`); //remove usercache
    await redisClient.del(`user:${user_id}:subjects`); //remove dayTotal
    await redisClient.sRem(`allMembers`, `${user_id}`); //remove from allMembers


    fs.unlink(`./public/profile-images/${user_id}.jpeg`, (err) => {
      if (err) {
        console.error(`Error deleting ${user_id}:`, err);
      } else {
        console.log(`${user_id} deleted successfully`);
      }
    });

    const groupsArr = groups.split(',');
    groupsArr.map(async (group) => {
      await connection.query(
        `UPDATE \`groups\` 
        SET members = CASE 
            WHEN members = '' THEN ?
            WHEN members LIKE ? OR members LIKE ? OR members LIKE ? THEN
              members
            ELSE CONCAT(members, ',', ?)
          END WHERE group_id = ?`,
        [user_id, `%,${user_id},%`, `${user_id},%`, `%,${user_id}`, user_id, group]
      );
    });
  });
};

async function createGroups(length) {
  const connection = pool.promise();
  const [bots] = await connection.query(`SELECT user_id, groups FROM users WHERE type = -1`);
  const [groups] = await connection.query(`SELECT group_id FROM groups`);

  console.log("Starting Groups Generation", groups);
  const groupIds = [];

  for (let i = 0; i < length; i++) {
    const groupId = generateRandomId(8);
    const index = randomIntInRange(0, groupsData.length - 1);
    const groupData = groupsData[index];

    if (groups.find(group => group.group_id === groupData.group_id)) {
      console.log('Duplicated');
      continue;
    };

    groups.push({ group_id: groupId })

    const hashed = hashing('0');
    const max_members = randomIntInRange(10, 50);
    const membersLength = randomIntInRange(10, max_members);
    const members = [];
    const likes = [];
    while (members.length <= membersLength) {
      const selectedBotIndex = randomIntInRange(0, bots.length - 1);
      const selectedBot = bots[selectedBotIndex];

      if (!members.includes(selectedBot.user_id)) {
        members.push(selectedBot.user_id);
        connection.query(`
          UPDATE users
          SET \`groups\` = CASE
            WHEN \`groups\` = '' THEN ?
            ELSE CONCAT(\`groups\`, ',', ?)
          END
          WHERE user_id = ?
        `, [
          groupId,
          groupId,
          selectedBot.user_id,
        ]);
        const isLike = randomIntInRange(0, 6);
        if (!isLike) {
          likes.push(selectedBot.user_id);
        };
      };
    };
    const leader = members[0];
    const colorIndex = randomIntInRange(0, colors.length - 1);
    const color = colors[colorIndex];
    const { name, explanation, tags } = groupData;
    const visibility = randomIntInRange(0, 7) <= 1;

    const stringlifiedLikes = JSON.stringify(likes).slice(1, -1).replaceAll(`"`, "");
    const stringlifiedMembers = JSON.stringify(members).slice(1, -1).replaceAll(`"`, "");
    const goal_hr = randomIntInRange(4, 8);
    const font = randomIntInRange(0, 13);

    const groupInfo = {
      name,
      explanation,
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
      font
    }
    connection.query(`INSERT INTO \`groups\` SET ?`, groupInfo);

    const roomInfo = {
      id: generateRandomId(10)
    }
    connection.query('INSERT INTO chatrooms set ?', roomInfo);
  };
  console.log("Groups Generation Done")
};

async function randomFriend(min, max) {
  const connection = pool.promise();
  const [bots] = await connection.query(`SELECT friends, user_id FROM users WHERE type = -1`);
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
        await connection.query(`
          UPDATE users
          SET friends = CASE
            WHEN friends = '' THEN ?
            ELSE CONCAT(friends, ',', ?)
          END
          WHERE user_id = ?
        `, [
          user_id,
          user_id,
          friend,
        ]);
      };
    };

    if (friends.length) {
      const stringlified = JSON.stringify(friends).slice(1, -1).replaceAll(`"`, "");
      await connection.query(`
      UPDATE users
      SET friends = CASE
        WHEN friends = '' THEN ?
        ELSE CONCAT(friends, ',', ?)
      END
      WHERE user_id = ?
    `, [
        stringlified,
        stringlified,
        user_id,
      ]);
    }
  };
  console.log("BOTS FRIENDS ADDED!")
}


async function createBotRankings() {

  const connection = pool.promise();
  const [botIds] = await connection.query(`SELECT user_id FROM users WHERE type = -1`);
  const botUsers = [];

  await Promise.all(botIds.map(async (bot) => {
    const thisBotId = bot.user_id;
    let [othersTimeline] = await connection.query(`SELECT timeline, datum_point FROM subjects WHERE user_id = ?`, [thisBotId]);
    othersTimeline = othersTimeline.filter((tl) => tl.timeline.length > 0)[0]; //only the first subject will have a timeline
    botUsers.push({ id: thisBotId, timeline: JSON.parse("[" + othersTimeline.timeline + "]"), datum_point: parseInt(othersTimeline.datum_point) });
  }));

  // we will use this to create the ranking tables
  let botDailyRanking = {};
  let botWeeklyRanking = {};
  let botMonthlyRanking = {};

  const LUXON_NOW = DateTime.fromJSDate(new Date()).toUTC().startOf('day');

  botUsers.map((bot, i) => {
    const botStudyByHour = {};
    const botWeeklyTrend = {};
    const botMonthlyTrend = {};
    const DP = DateTime.fromSeconds(bot.datum_point).startOf('hour').toSeconds();
    let botWeekTotal = 0;
    let botMonthTotal = 0;
    bot.timeline.map((tl, i) => { //it's garunteed that each hour will have a value
      const currSeconds = DP + i * 3600;
      botStudyByHour[currSeconds] = tl[1];
      botWeekTotal += tl[1];
      botMonthTotal += tl[1];

      const UTC_CURRENT_DAY = DateTime.fromSeconds(currSeconds, { zone: "utc" });
      if (UTC_CURRENT_DAY.weekday === 1) { //start of week, save to weekly ranking
        botWeeklyTrend[DateTime.fromSeconds(currSeconds, { zone: "utc" }).minus({ weeks: 1 }).toSeconds()] = botWeekTotal;
        botWeekTotal -= (botStudyByHour[UTC_CURRENT_DAY.minus({ weeks: 1 }).toSeconds()] || 0); //remove last week's info
      }
      else if (UTC_CURRENT_DAY.weekday === 2 && UTC_CURRENT_DAY.hour === 0) {
        botWeekTotal = 0;
      }

      const FIRST_DAY_OF_MONTH = DateTime.fromSeconds(currSeconds).startOf('month');
      if (UTC_CURRENT_DAY.hasSame(FIRST_DAY_OF_MONTH, 'day')) { //start of month, save to monthly ranking
        botMonthlyTrend[DateTime.fromSeconds(currSeconds, { zone: "utc" }).minus({ months: 1 }).toSeconds()] = botMonthTotal;
        botMonthTotal -= (botStudyByHour[UTC_CURRENT_DAY.minus({ months: 1 }).toSeconds()] || 0); //remove last month's info
      }
      else if (UTC_CURRENT_DAY.diff(FIRST_DAY_OF_MONTH, ['days']).days === 2 && UTC_CURRENT_DAY.hour === 0) {
        botMonthTotal = 0;
      }
    });

    for (const [key, value] of Object.entries(botStudyByHour)) {
      if (!!botDailyRanking[key]) {
        botDailyRanking[key].push({ u: bot.id, t: value });
      }
      else {
        botDailyRanking[key] = [{ u: bot.id, t: value }];
      }
    }

    for (const [key, value] of Object.entries(botWeeklyTrend)) {
      if (!!botWeeklyRanking[key]) {
        botWeeklyRanking[key].push({ u: bot.id, t: value });
      }
      else {
        botWeeklyRanking[key] = [{ u: bot.id, t: value }];
      }
    }

    for (const [key, value] of Object.entries(botMonthlyTrend)) {
      if (!!botMonthlyRanking[key]) {
        botMonthlyRanking[key].push({ u: bot.id, t: value });
      }
      else {
        botMonthlyRanking[key] = [{ u: bot.id, t: value }];
      }
    }
  });

  let entries = Object.entries(botDailyRanking);
  for (let en = 0; en < entries.length; en++) {
    let key = entries[en][0];
    botDailyRanking[key] = botDailyRanking[key].sort((a, b) => b.t - a.t);
    await connection.query(`DELETE FROM dailyRanking WHERE date = ?`, [key]);
    await connection.query(`INSERT INTO dailyRanking SET date = ?, ranking = ?`, [key, JSON.stringify(botDailyRanking[key])]);
  }

  entries = Object.entries(botWeeklyRanking);
  for (let en = 0; en < entries.length; en++) {
    let key = entries[en][0];
    botWeeklyRanking[key] = botWeeklyRanking[key].sort((a, b) => b.t - a.t);
    await connection.query(`DELETE FROM weeklyRanking WHERE date = ?`, [key]);
    await connection.query(`INSERT INTO weeklyRanking SET date = ?, ranking = ?`, [key, JSON.stringify(botWeeklyRanking[key])]);
  }

  entries = Object.entries(botMonthlyRanking);
  for (let en = 0; en < entries.length; en++) {
    let key = entries[en][0];
    botMonthlyRanking[key] = botMonthlyRanking[key].sort((a, b) => b.t - a.t);
    await connection.query(`DELETE FROM monthlyRanking WHERE date = ?`, [key]);
    await connection.query(`INSERT INTO monthlyRanking SET date = ?, ranking = ?`, [key, JSON.stringify(botMonthlyRanking[key])]);
  }

  console.log("BOTS RANKING GENERATED");
};

module.exports = {
  createBots,
  deleteBots,
  botManager,
  createGroups,
  randomFriend,
  createBotRankings
}