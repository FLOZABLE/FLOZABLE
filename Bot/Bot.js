const { generateRandomId, hashing, randomIntInRange } = require('../tool');
const fs = require('fs');
const botData = require('../data/DatasetsWithId.json');
const originalData = require('../data/Datasets.json');
const pool = require('../model/pool');
const crypto = require('crypto');
const { DateTime } = require('luxon');
const sharp = require("sharp");
const cron = require('node-cron');
const { connection } = require('../socket');
const schedule = require('node-schedule');
const redisClient = require('../model/redis');

/**create bots */
function createBots(startIndex, length) {
  const connection = pool.promise();
  let timeZones = [
    'America/Los_Angeles',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Africa/Cairo',
    'Asia/Dubai',
    'America/Sao_Paulo',
    'Europe/Moscow',
    'Asia/Seoul',
    'Asia/Kolkata',
    'Pacific/Auckland'
  ]

  for (let i = startIndex; i < length; i++) {
    const { name, userId, timeZone, gender } = botData[i % 220];
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
    //connection.query('INSERT INTO users SET ?', userInfo);
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
    //connection.query(`INSERT INTO subjects SET ?`);
    //createProfileImg(40, userId, gender);
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
        const imgPath = filePath + '/' +fileAtIndex;
        //console.log(imgPath);
        if (fileAtIndex) {
          // Construct the full path to the file
          //const filePath = path.join(directoryPath, fileAtIndex);
          await sharp(imgPath)
            .toFormat('jpeg')
            .resize({ width: 800, height: 800 })
            .jpeg({ quality: 40 })
            .toFile(`./public/profile-images/${userId}.jpeg`);
        } else {
          console.log('File at index 2 does not exist.');
        }
      }
    })
  }
};

async function startBot(user_id, groups) {
  connection.to(groups).emit('studying', user_id, groups);
  try {
    const [subject] = await subjectsCache(user_id, false, ['id', 'timeline_sum', 'datum_point']);
    const now = Math.floor(new Date().getTime() / 1000);
    const timelineSum = subject.timeline_sum;
    const start = now - subject.datum_point - timelineSum;
    const push = await redisClient.rPush(`user:${userId}:subject:${subjectId}`, `[${start},0]`);
    const timerInfo = await timerCache(userId, now);
    /* redisClient.hSet(`user${userId}`, 'timerInfo', ); */
  } catch (err) {
    console.log(err);
  };
  try {
    const [subject] = await subjectsCache(user_id);
    if (subject) {
      connection.to(groups).emit('studying', user_id, groups);
      const now = Math.floor(new Date().getTime() / 1000);
      const {timeline_sum, datum_point} = subject;
      const start = now - datum_point - timeline_sum;
      const push = await redisClient.rPush(`user:${user_id}:subject:${subject}`, `[${start},0]`);
      redisClient.hSet(`user:${userId}`, `ActiveSubject`, `${subjectId}:${now}`);
      const timerInfo = await timerCache(userId, now);
      /* redisClient.hSet(`user${userId}`, 'timerInfo', ); */
    }
  } catch (err) {
    console.log(err);
  };
};

async function stopBot() {
  connection.to(groups).emit('studying', user_id, groups);
};

const BOT_STUDYING_NUMBERS = 70;
const BOT_MIN_STUDY = 60 * 10; //10 min = min time bot will study
const BOT_MAX_STUDY = 60 * 60 * 2; //2 hr = max time bot will study
const MAX_START_DELAY = 60 * 60; //1 hr = starts atleast 1hr from being assigned

async function botSelector(numbers, start, duration) {
  const connection = pool.promise();
  const [bots] = await connection.query(`SELECT name, groups, user_id FROM users WHERE type = -1`);
  //const [subjects] = await connection.query(`SELECT timeline, id, timeline_sum, datum_point FROM subjects`)
  const now = DateTime.now();

  const activeBots = await redisClient.sMembers('activeBots');
  for (let i = 0; i < numbers; i++) {
    const index = randomIntInRange(0, bots.length);
    const {user_id, groups} = bots[index];
    //this prevents same bot from being added
    if (activeBots.includes(user_id)) continue;
    activeBots.push(user_id);

    //determines how long this bot will study
    const duration = randomIntInRange(BOT_MIN_STUDY, BOT_MAX_STUDY);
    const start = randomIntInRange(0, MAX_START_DELAY) + now.toSeconds();
    const startDate = DateTime.fromSeconds(start);
    const stopDate = DateTime.fromSeconds(now.toSeconds() + duration);

    //const [[subject]] = await connection.query(`SELECT timeline, id, timeline_sum, datum_point FROM subjects WHERE user_id = ?`, [user_id]);
    const groupsArr = groups.split(',');

    //send socket only when there is more than one groups because io.to.emit() (blank target group) will result broadcasting
    if (groupsArr.length) {
      const scheduleStart = schedule.scheduleJob(startDate.toJSDate(), startBot(user_id, groupsArr));
      const scheduleStop = schedule.scheduleJob(stopDate.toJSDate(), stopBot(user_id, groupsArr));
    }
  };
}

async function botManager() {
  cron.schedule('* /60 * * * * *', async() => {
    botSelector(BOT_STUDYING_NUMBERS);
  });
};



module.exports = {
  createBots,
  addId
}