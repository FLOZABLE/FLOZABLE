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
const axios = require('axios');
const cron = require('node-cron');
const { connection } = require('../socket');
const schedule = require('node-schedule');
const redisClient = require('../model/redis');
const timeZones = require('../data/timeZones.json');
const csv = require("csvtojson");
const { activeSubjectCache, subjectsCache, timerCache, userCache } = require('../services/redisLoader');

/**create bots */
async function createBots(startIndex, length) {
  const connection = pool.promise();

  const chosenBotIds = {};
  const [allIds] = await connection.query("SELECT user_id from users");
  allIds.map((obj) => {
    chosenBotIds[obj.user_id] = true; //make sure we don't choose the same id when generating bots
  })

  for (let Z = startIndex; Z < length; Z++) {
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

    //console.log(userInfo)
    await connection.query('INSERT INTO users SET ?', userInfo);
    const subjectId = generateRandomId(10);
    const datum_point = unixTimestamp;

    const subjectTimeline = [];
    const studyFactor = Math.floor(Math.random() * 10) + 1; //the higher this number is the more they will study

    let prevTime = unixTimestamp
    let currTime = unixTimestamp;
    let timelineSum = 0;
    const timeNow = new Date().getTime() / 1000;
    const possibleDurations = [0, 0, 0, 0, 60, 120, 180, 240, 360, 1200, 1500, 3600, 4200, 5400, 8000];
    while (currTime < timeNow - 86400) { //end at yesterday
      const duration = Math.floor((1 + Math.random() - 0.5) * possibleDurations[randomIntInRange(0, possibleDurations.length - 1)]);
      subjectTimeline.push([currTime - prevTime, duration]);
      timelineSum += duration + currTime - prevTime;
      prevTime = currTime + duration;
      currTime += 86400; //currTime will always be the start of the day
    }

    let stringTimeline = JSON.stringify(subjectTimeline);
    stringTimeline = stringTimeline.slice(1, stringTimeline.length - 1);

    const subject = {
      id: subjectId,
      name: 'others',
      user_id: userId,
      icon: 'others',
      color: '#000000',
      timeline: stringTimeline,
      timeline_sum: timelineSum,
      datum_point
    };
    await connection.query(`INSERT INTO subjects SET ?`, [subject]);

    if (!!profileImage) {
      createChessProfileImg(userId, profileImage);
    }
    else {
      createProfileImg(40, userId, gender);
    }
  };

  console.log("BOTS SUCCESSFULLY ADDED!");
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
  const jsonArray = await csv().fromFile(csvFilePath);
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

//write combinedNames.json with 50/50 chess and realNames
const CountryTimezones = require('countries-and-timezones');
const chessData = require("../data/ChessInfo.json");
const { profile } = require('console');
const { connect } = require('http2');
//and fullNameData
async function addChessAndReal() {
  const fullNameUsers = fullNameData.map(data => {
    return { ...data };
  });

  const chessNameUsers = chessData.map(data => {
    let countryInfo = CountryTimezones.getCountry(data.countryCode.toUpperCase());
    if (!!!countryInfo) {
      countryInfo = CountryTimezones.getCountry("US")
    }
    const timeZone = countryInfo.timezones[randomIntInRange(0, countryInfo.timezones.length - 1)];

    const userId = generateRandomId(10);
    const gender = randomIntInRange(0, 1) ? 'Female' : 'Male';
    const name = data.name;
    const profileImage = data.imgUrl;
    return { name, userId, timeZone, gender, profileImage };
  });

  const newData = fullNameUsers.concat(chessNameUsers);

  fs.writeFileSync('./data/combinedNames.json', JSON.stringify(newData, null, 2), 'utf-8', (err) => {
    if (err) {
      console.log(err)
    }
  });
}

//addChessAndReal();

//create combined datasets
function createCombinedUserList(percentage, length = realisticNameData.length + fullNameData.length - 2) {
  let fullNameIndex = 0;
  let realisticNameIndex = 0;
  const newData = [];
  for (let i = 0; i < length; i++) {
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

async function startBot(userId) {
  try {
    const [subject] = await subjectsCache(userId);
    const userInfo = await userCache(userId);
    if (!subject || !userInfo) return;
    let { groups, friends, name } = userInfo;
    console.log('start', userId, name)
    friends = friends === "" ? [] : friends.split(",");
    groups = groups === "" ? [] : groups.split(",");
    if (groups.length) {
      connection.to(groups).emit(`studying:${userId}`, subject);
    };
    if (friends.length) {
      connection.to(friends).emit(`studying:${userId}`, subject);
    };
    const now = Math.floor(new Date().getTime() / 1000);
    const { timeline_sum, datum_point, id } = subject;
    const start = now - datum_point - timeline_sum;
    redisClient.rPush(`user:${userId}:subject:${id}`, `[${start},0]`);
    redisClient.hSet(`user:${userId}`, `ActiveSubject`, `${id}:${now}`);
    subject.timeline_sum += start;
    redisClient.hSet(`user:${userId}:subjects`, id, JSON.stringify(subject));
    
    //add temporarily to test small ranking viewer
    /*
    let alreadyActive = await redisClient.sIsMember("allMembers", `${userId}`);
    if (!alreadyActive){
      redisClient.sAdd(`allMembers`, `${userId}`);
    }
    */
   
  } catch (err) {
    console.log(err);
  };
};

async function stopBot(userId) {
  redisClient.sRem('activeBots', userId);
  const activeSubject = await activeSubjectCache(userId);
  const userInfo = await userCache(userId);
  const [subject] = await subjectsCache(userId);
  redisClient.hDel(`user:${userId}`, `ActiveSubject`);
  if (!userInfo || !subject || !activeSubject.id) return;
  const { datum_point, timeline_sum, id } = subject;
  const now = Math.floor(new Date().getTime() / 1000);

  let { groups, friends, name } = userInfo;
  friends = friends === "" ? [] : friends.split(",");
  groups = groups === "" ? [] : groups.split(",");

  if (groups.length) {
    connection.to(groups).emit(`stopStudying:${userId}`);
  };
  if (friends.length) {
    connection.to(friends).emit(`studying:${userId}`, subject);
  };
  const duration = now - datum_point - timeline_sum;
  console.log('stop', userId, name, duration);
  redisClient.incrBy(`user:${userId}:dayTotal`, duration);
  subject.timeline_sum += duration;
  redisClient.hSet(`user:${userId}:subjects`, id, JSON.stringify(subject));
  const activity = JSON.parse(await redisClient.rPop(`user:${userId}:subject:${id}`));
  if (activity) {
    const start = activity[0];
    redisClient.rPush(`user:${userId}:subject:${id}`, `[${start},${duration}]`);
  };
  //add to allMembers
  let alreadyActive = await redisClient.sIsMember("allMembers", `${userId}`);
  if (!alreadyActive){
    redisClient.sAdd(`allMembers`, `${userId}`);
  }
};

const BOT_MIN_STUDY = 5; //10 min = min time bot will study
const BOT_MAX_STUDY = 60 * 60 * 2; //2 hr = max time bot will study
const MAX_START_DELAY = 60 * 60; //1 hr = starts atleast 1hr from being assigned

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
  };

  //update active bot list in redis
  redisClient.sAdd('activeBots', activeBots);
}

async function botManager(numbers) {
  await redisClient.del('activeBots');
  botSelector(numbers);
  schedule.scheduleJob('0 * * * *', async () => {
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
  bots.map(async({ user_id, groups }) => {

    await redisClient.del(`user:${user_id}:dayTotal`); //remove dayTotal
    await redisClient.del(`user:${user_id}:weekTotal`); //remove dayTotal
    await redisClient.del(`user:${user_id}:monthTotal`); //remove dayTotal
    await redisClient.del(`user:${user_id}`); //remove usercache
    await redisClient.del(`user:${user_id}:subjects`); //remove dayTotal
    await redisClient.sRem(`allMembers`,`${user_id}`); //remove from allMembers


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


async function createBotRankings() {

  const connection = pool.promise();
  const [botIds] = await connection.query(`SELECT user_id FROM users WHERE type = -1`);
  const botUsers = [];

  await Promise.all(botIds.map(async(bot) => {
    const thisBotId = bot.user_id;
    const [[othersTimeline]] = await connection.query(`SELECT timeline, datum_point FROM subjects WHERE user_id = ?`, [thisBotId]);
    botUsers.push({ id: thisBotId, timeline: JSON.parse("[" + othersTimeline.timeline + "]"), datum_point: parseInt(othersTimeline.datum_point) });
  }));

  // we will use this to create the ranking tables
  const botDailyRanking = [];
  const botWeeklyRanking = [];
  const botMonthlyRanking = [];

  const LUXON_NOW = DateTime.fromJSDate(new Date()).toUTC().startOf('day');

  botUsers.map((bot) => { //ranking calculations (we only have one session per day, meaning only one [start, duration] per day)
    const botTimeline = {};
    let totalSum = bot.datum_point;
    bot.timeline.map((tl) => {
      let duration = tl[1];
      const daysDiff = Math.floor(LUXON_NOW.diff(DateTime.fromSeconds(totalSum), ['days']).days);
      const startDayUnixUTC = LUXON_NOW.minus({ days: daysDiff });
      botTimeline[startDayUnixUTC.toSeconds()] = duration;
      totalSum += 86400; //add 1 day
    });

    for (let i = 1; i < 60; i++) {
      const previousUnix = LUXON_NOW.minus({ days: i }).toSeconds();
      let valThisDay = 0;
      if (botTimeline.hasOwnProperty(previousUnix)) {
        valThisDay = botTimeline[previousUnix];
      }

      if (!!!botDailyRanking[i]) {
        botDailyRanking[i] = [];
      }
      botDailyRanking[i].push({ u: bot.id, t: valThisDay }); //at i index we subject 86400*i seconds from LUXON_NOW
    }

    let mappedTotal = 0;
    Object.entries(botTimeline).map(([key, val]) => { //create a prefix sum to calculate weekly and monthly times
      mappedTotal += val;
      botTimeline[key] = mappedTotal;
    });

    for (let i = 1; i < 8; i++) {
      const weekStartUnix = Math.round(LUXON_NOW.minus({ weeks: i }).startOf('week').toSeconds());
      const weekEndUnix = Math.round(LUXON_NOW.minus({ weeks: i }).endOf('week').toSeconds());
      let weekDuration = 0;
      //console.log(weekEndUnix);
      if (botTimeline.hasOwnProperty(weekEndUnix)) { //if it doens't include the end unix then it won't include the start
        let startVal = 0;
        if (botTimeline.hasOwnProperty(weekStartUnix)) {
          startVal = botTimeline[weekStartUnix];
        }
        weekDuration = botTimeline[weekEndUnix] - startVal;
      }

      if (!!!botWeeklyRanking[i]) {
        botWeeklyRanking[i] = [];
      }
      botWeeklyRanking[i].push({ u: bot.id, t: weekDuration });
    }

    for (let i = 1; i < 3; i++) {
      const monthStartUnix = Math.round(LUXON_NOW.minus({ months: i }).startOf('month').toSeconds());
      const monthEndUnix = Math.round(LUXON_NOW.minus({ months: i }).endOf('month').toSeconds());
      let monthDuration = 0;
      //console.log(weekEndUnix);
      if (botTimeline.hasOwnProperty(monthEndUnix)) { //if it doens't include the end unix then it won't include the start
        let startVal = 0;
        if (botTimeline.hasOwnProperty(monthStartUnix)) {
          startVal = botTimeline[monthEndUnix];
        }
        monthDuration = botTimeline[monthEndUnix] - startVal;
      }

      if (!!!botMonthlyRanking[i]) {
        botMonthlyRanking[i] = [];
      }
      botMonthlyRanking[i].push({ u: bot.id, t: monthDuration });
    }
  });

  botDailyRanking.map((arr) => {
    return arr.sort((a, b) => { return b.t - a.t });
  });
  botWeeklyRanking.map((arr) => {
    return arr.sort((a, b) => { return b.t - a.t });
  });
  botMonthlyRanking.map((arr) => {
    return arr.sort((a, b) => { return b.t - a.t });
  });

  await connection.query(`DELETE FROM dailyRanking`);
  await connection.query(`DELETE FROM weeklyRanking`);
  await connection.query(`DELETE FROM monthlyRanking`);
  //remove old rankings or it won't work

  botDailyRanking.map(async (arr, i) => {
    const rowDate = LUXON_NOW.minus({ days: i }).toSeconds();
    const rankingRow = {
      date: rowDate,
      ranking: JSON.stringify(arr)
    };
    await connection.query(`INSERT INTO dailyRanking SET ?`, [rankingRow]);
  });

  botWeeklyRanking.map(async (arr, i) => {
    const rowDate = LUXON_NOW.minus({ weeks: i }).startOf('week').toSeconds();
    const rankingRow = {
      date: rowDate,
      ranking: JSON.stringify(arr)
    };
    await connection.query(`INSERT INTO weeklyRanking SET ?`, [rankingRow]);
  });

  botMonthlyRanking.map(async (arr, i) => {
    const rowDate = LUXON_NOW.minus({ months: i }).startOf('month').toSeconds();
    const rankingRow = {
      date: rowDate,
      ranking: JSON.stringify(arr)
    };
    await connection.query(`INSERT INTO monthlyRanking SET ?`, [rankingRow]);
  });
}

module.exports = {
  createBots,
  deleteBots,
  addId,
  botManager,
  createGroups,
  randomFriend,
  createBotRankings
}