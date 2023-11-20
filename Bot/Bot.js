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
const { DateTime } = require('luxon');
const sharp = require("sharp");
const cron = require('node-cron');
const { connection } = require('../socket');
const schedule = require('node-schedule');
const redisClient = require('../model/redis');
const timeZones = require('../data/timeZones.json');
const csv = require("csvtojson");
const { activeSubjectCache, subjectsCache, timerCache } = require('../services/redisLoader');

/**create bots */
function createBots(startIndex, length) {
  const connection = pool.promise();

  for (let i = startIndex; i < length; i++) {
    const { name, userId, timeZone, gender } = combinedNameData[i % (combinedNameData.length - 1)];
    const password = '0';
    let hashed = hashing(password);

    const keySalt = crypto.randomBytes(32).toString('hex');
    const iv = crypto.randomBytes(16).toString('hex');

    let userDateTime = DateTime.now().setZone(timeZone);
    //randomize date
    const subtractedDate = Math.floor(Math.random() * 100)
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

    //console.log(userInfo)
    connection.query('INSERT INTO users SET ?', userInfo);
    const subjectId = generateRandomId(10);
    const datum_point = Math.floor(new Date().getTime() / 1000);
    const subject = {
      id: subjectId,
      name: 'others',
      user_id: userId,
      icon: 'others',
      color: '#000000',
      datum_point
    };
    connection.query(`INSERT INTO subjects SET ?`, [subject]);
    createProfileImg(40, userId, gender);
  };
};

/**create a new file and add id */
function addId() {
  const newData = originalData.map(data => {
    const userId = generateRandomId(10);
    return { ...data, userId };
  });

  fs.writeFileSync('./data/DatasetsWithId.json', JSON.stringify(newData, null, 2), 'utf-8', (err) => {
    if (err) {
      console.log(err)
    }
  })
};

/**convert csv to json add add more values*/
const csvFilePath = "./data/originalnames.csv";
const fileOutputName = "./data/realName.json";
async function csvIdToJsonDatasets() {
  /* csv()
  .fromFile(fileInputName)
  .then((jsonObj)=>{
      console.log(jsonObj);
  }) */
  const jsonArray=await csv().fromFile(csvFilePath);
fs.writeFileSync(fileOutputName, JSON.stringify(jsonArray));
}

//csvIdToJsonDatasets();
const realNames = require("../data/realName.json");
async function addValues() {
  const newData = realNames.map(data => {
    const userId = generateRandomId(10);
    const gender = randomIntInRange(0, 1) ? 'Female' : 'Male';
    const timeZone = timeZones[randomIntInRange(0, timeZones.length - 1)];
    return { ...data, userId, timeZone, gender };
  });

  fs.writeFileSync('./data/RealUserIdWithData.json', JSON.stringify(newData, null, 2), 'utf-8', (err) => {
    if (err) {
      console.log(err)
    }
  })
};

//create combined datasets
function createCombinedUserList(percentage, length = realisticNameData.length + fullNameData.length - 2) {
  let fullNameIndex = 0;
  let realisticNameIndex = 0;
  const newData = [];
  for(let i = 0; i < length; i++) {
    const type = randomIntInRange(0, 100) > percentage;
    if (type && fullNameData[fullNameIndex]) {
      newData.push(fullNameData[fullNameIndex]);
      fullNameIndex += 1;
    } else {
      newData.push(realisticNameData[realisticNameIndex]);
      realisticNameIndex += 1;
    };
  }

  fs.writeFileSync('./data/combinedNames.json', JSON.stringify(newData, null, 2), 'utf-8', (err) => {
    if (err) {
      console.log(err)
    }
  })
};

//createCombinedUserList(30);

//addValues();
const destinationFilePath = "./public/profile-images";

/**create profile imggs for each users*/
function createProfileImg(percentage, userId, gender) {

  const isProfile = Math.random() < percentage / 100;
  if (isProfile) {
    const filePath = `./data/profile-imgs/${gender}`;
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

async function startBot(userId, groups) {
  try {
    const [subject] = await subjectsCache(userId);
    console.log('start', DateTime.now().toSeconds(), userId, subject.timeline_sum);
    if (subject) {
      //send socket only when there is more than one groups because io.to.emit() (blank target group) will result broadcasting
      if (groups.length) {
        connection.to(groups).emit('studying', userId, groups);
      }
      const now = Math.floor(new Date().getTime() / 1000);
      const { timeline_sum, datum_point, id } = subject;
      const start = now - datum_point - timeline_sum;
      const push = await redisClient.rPush(`user:${userId}:subject:${id}`, `[${start},0]`);
      redisClient.hSet(`user:${userId}`, `ActiveSubject`, `${id}:${now}`);
      subject.timeline_sum += start;
      redisClient.hSet(`user:${userId}`, `subject:${id}`, JSON.stringify(subject));

      //total timer
      const timerInfo = await timerCache(userId, now);
      const { dp, ts } = timerInfo;
      const totalTimerStart = now - dp - ts;
      timerInfo.ts += totalTimerStart;
      redisClient.hSet(`user:${userId}`, 'timerInfo', JSON.stringify(timerInfo));
    }
  } catch (err) {
    console.log(err);
  };
};

async function stopBot(userId, groups) {
  redisClient.sRem('activeBots', userId);
  const [subject] = await subjectsCache(userId);
  const activeSubject = await activeSubjectCache(userId);
  console.log('stop', DateTime.now().toSeconds(), userId, subject.timeline_sum)
  try {
    if (subject) {
      //send socket only when there is more than one groups because io.to.emit() (blank target group) will result broadcasting
      if (groups.length) {
        connection.to(groups).emit('studying', userId, groups);
      }
      let { timeline_sum, datum_point, id } = subject;
      const activity = JSON.parse(await redisClient.rPop(`user:${userId}:subject:${id}`));
      const now = Math.floor(new Date().getTime() / 1000);
      const start = activity[0];
      const duration = now - datum_point - timeline_sum;
      redisClient.rPush(`user:${userId}:subject:${id}`, `[${start},${duration}]`);
      timeline_sum += duration;
      subject.timeline_sum = timeline_sum;
      redisClient.hSet(`user:${userId}`, `subject:${id}`, JSON.stringify(subject));

      //total timer update
      //this is unix time in sec of active subject's start
      const activeSubjectStart = activeSubject.time;
      const timerInfo = await timerCache(userId, now);
      const { dp, ts } = timerInfo;
      const timerStart = activeSubjectStart - dp - ts;
      const totalTimerDuration = now - dp - ts;
      timerInfo.ts += totalTimerDuration;
      redisClient.rPush(`user:${userId}:timer`, `[${timerStart},${totalTimerDuration}]`);
      redisClient.hSet(`user:${userId}`, 'timerInfo', JSON.stringify(timerInfo));
      redisClient.hDel(`user:${userId}`, `ActiveSubject`);
    };
  } catch (err) {
    console.log(err);
  }
};

const BOT_STUDYING_NUMBERS = 100;
const BOT_MIN_STUDY = 60 * 10; //10 min = min time bot will study
const BOT_MAX_STUDY = 60 * 60 * 2; //2 hr = max time bot will study
const MAX_START_DELAY = 60 * 60; //1 hr = starts atleast 1hr from being assigned

async function botSelector(numbers) {
  const connection = pool.promise();
  const [bots] = await connection.query(`SELECT name, groups, user_id FROM users WHERE type = -1`);
  //const [subjects] = await connection.query(`SELECT timeline, id, timeline_sum, datum_point FROM subjects`)
  const now = DateTime.now();

  const activeBots = await redisClient.sMembers('activeBots');
  for (let i = 0; i < numbers; i++) {
    const index = randomIntInRange(0, bots.length - 1);
    const { user_id, groups } = bots[index];
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
    const groupsArr = groups === "" ? [] : groups.split(',');
    const scheduleStart = schedule.scheduleJob(startDate.toJSDate(), () => { startBot(user_id, groupsArr) });
    const scheduleStop = schedule.scheduleJob(stopDate.toJSDate(), () => { stopBot(user_id, groupsArr) });
  };

  const scheduleStartTest = schedule.scheduleJob(DateTime.fromSeconds(now.toSeconds() + 5).toJSDate(), () => { startBot(process.env.TESTER_ID, []) });
  const scheduleStopTest = schedule.scheduleJob(DateTime.fromSeconds(now.toSeconds() + 10).toJSDate(), () => { stopBot(process.env.TESTER_ID, []) });

  //update active bot list in redis
  redisClient.sAdd('activeBots', activeBots);
}

async function botManager() {
  await redisClient.del('activeBots');
  botSelector(BOT_STUDYING_NUMBERS);
  schedule.scheduleJob('0 * * * *', async () => {
    botSelector(BOT_STUDYING_NUMBERS);
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
  bots.map(({ user_id, groups }) => {

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

async function createGroups(startIndex, length) {
  const connection = pool.promise();
  const [bots] = await connection.query(`SELECT user_id, groups FROM users WHERE type = -1`);
  for (let i = startIndex; i < length; i++) {
    const groupId = generateRandomId(8);
    const groupData = groupsData[i];
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
    const {name, explanation, tags} = groupData;
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

    const roomInfo1 = {
      id: generateRandomId(10),
      group_id: groupInfo.group_id,
      name: 'general',
    }

    const roomInfo2 = {
      id: generateRandomId(10),
      group_id: groupInfo.group_id,
      name: 'room2',
    }

    connection.query('INSERT INTO chatrooms set ?', roomInfo1);
    connection.query('INSERT INTO chatrooms set ?', roomInfo2);

  };
};

async function randomFriend(min, max) {
  const connection = pool.promise();
  const [bots] = await connection.query(`SELECT friends, user_id FROM users WHERE type = -1`);
  const lastBotIndex = bots.length - 1;
  for (const bot of bots) {
    const {user_id} = bot;
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
  }
/*   bots.map(async (bot) => {
    const {user_id} = bot;
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
      const stringlified = JSON.stringify(friends);
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
  }) */
}

module.exports = {
  createBots,
  deleteBots,
  addId,
  botManager,
  createGroups,
  randomFriend
}