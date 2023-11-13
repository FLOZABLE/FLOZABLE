const { generateRandomId, hashing, randomIntInRange } = require('../tool');
const fs = require('fs');
const botData = require('../data/DatasetsWithId.json');
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
const { activeSubjectCache, subjectsCache, timerCache } = require('../services/redisLoader');

/**create bots */
function createBots(startIndex, length) {
  const connection = pool.promise();
  
  for (let i = startIndex; i < length; i++) {
    const { name, userId, timeZone, gender } = botData[i % (botData.length - 1)];
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

async function startBot(user_id, groups) {
  try {
    const [subject] = await subjectsCache(user_id);
    console.log('start', DateTime.now().toSeconds(), user_id, subject.id);
    if (subject) {
      //send socket only when there is more than one groups because io.to.emit() (blank target group) will result broadcasting
      if (groups.length) {
        connection.to(groups).emit('studying', user_id, groups);
      }
      const now = Math.floor(new Date().getTime() / 1000);
      const { timeline_sum, datum_point, id } = subject;
      const start = now - datum_point - timeline_sum;
      const push = await redisClient.rPush(`user:${user_id}:subject:${id}`, `[${start},0]`);
      redisClient.hSet(`user:${user_id}`, `ActiveSubject`, `${id}:${now}`);
      const timerInfo = await timerCache(user_id, now);
    }
  } catch (err) {
    console.log(err);
  };
};

async function stopBot(userId, groups) {
  redisClient.sRem('activeBots', userId);
  const [subject] = await subjectsCache(userId);
  const activeSubject = await activeSubjectCache(userId);
  console.log('stop', DateTime.now().toSeconds(), userId, subject.id)
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
      const stop = now - datum_point - timeline_sum;
      redisClient.rPush(`user:${userId}:subject:${id}`, `[${start},${stop - start}]`);
      timeline_sum += stop;
      subject.timeline_sum = timeline_sum;
      redisClient.hSet(`user:${userId}`, `subject:${id}`, JSON.stringify(subject));
  
      //total timer update
      //this is unix time in sec of active subject's start
      const activeSubjectStart = activeSubject.time;
      const timerInfo = await timerCache(userId, now);
      let { dp, ts } = timerInfo;
      const timerStart = activeSubjectStart - dp - ts;
      const timerStop = now - dp - ts;
      ts += timerStop;
      timerInfo.ts = ts;
      redisClient.rPush(`user:${userId}:timer`, `[${timerStart},${timerStop - timerStart}]`);
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
  schedule.scheduleJob('0 * * * *', async () => {
    botSelector(BOT_STUDYING_NUMBERS);
  });
};

//botSelector(BOT_STUDYING_NUMBERS);

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

  for (let i = 0; i < length; i++) {
    const groupId = generateRandomId(8);
    const template = groupsData
    const hashed = hashing('0');
    const max_people = randomIntInRange(10, 50);
    const membersLength = randomIntInRange
    const leaderIndex = Math.floor(Math.random() * 100);
    let leader = testUsers[leaderIndex].user_id;
    let members = leader;
    let likes = leader;
    let membersIndex = [leaderIndex];
    for (let j = 0; j < membersLength; j++) {
      const memberIndex = Math.floor(Math.random() * 100);
      if (membersIndex.includes(memberIndex)) {
        break;
      };
      membersIndex.push(memberIndex);
      const member = testUsers[memberIndex];
      members += `,${member.user_id}`;
      likes += `,${member.user_id}`;
      const updateMember = connection.query(`
      UPDATE users
      SET \`groups\` = CASE
        WHEN \`groups\` = '' THEN ?
        ELSE CONCAT(\`groups\`, ',', ?)
      END
      WHERE user_id = ?
    `, [
        groupId,
        groupId,
        member.user_id,
      ]);
    }
    const color = colors[Math.floor(Math.random() * 26)];
    const groupInfo = {
      name: template.name,
      explanation: template.explanation,
      tags: JSON.stringify(template.tags),
      visibility: Math.floor(Math.random() * 2),
      password: hashed[1],
      max_members: max_people,
      salt: hashed[0],
      date: Math.floor(new Date().getTime() / 1000),
      group_id: groupId,
      leader: leader,
      likes: likes,
      members: members,
      color: color,
      average_hr: Math.floor(Math.random() * 5) + 2,
      goal_hr: Math.floor(Math.random() * 6) + 4,
      font: Math.floor(Math.random() * 13)
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

    const addGroupRoom1 = await connection.query('INSERT INTO chatrooms set ?', roomInfo1);
    const addGroupRoom2 = await connection.query('INSERT INTO chatrooms set ?', roomInfo2);

  };

}


module.exports = {
  createBots,
  deleteBots,
  addId,
  botManager
}