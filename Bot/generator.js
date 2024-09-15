const pool = require("../model/pool");
const redisClient = require("../model/redis");
const combinedNameData = require("../data/combinedNames.json");
const groupsData = require("../data/Groups.json");
const { DateTime } = require("luxon");
const fs = require("fs");
const { possibleBotsSubjects, subjectColors } = require("../Constant");
const axios = require("axios");
const {
  generateRandomId,
  randomIntInRange,
  hashing,
} = require("../Utils/tool");

/**create bots */
async function createBots(length) {
  try {
    const connection = pool.promise();

    const chosenBotIds = {};
    const [allIds] = await connection.query("SELECT user_id from users");
    allIds.map((obj) => {
      chosenBotIds[obj.user_id] = true; //make sure we don't choose the same id when generating bots
    });

    const newBots = [];

    const botsSubjects = [];

    const password = "thisisbotspassword";
    const hashed = hashing(password);
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

      let userDateTime = DateTime.now().setZone(timeZone);
      //randomize date
      const subtractedDate = Math.floor(Math.random() * 30) + 20;
      userDateTime = userDateTime.minus({ days: subtractedDate });
      const unixTimestamp = userDateTime.startOf("day").toSeconds();
      const userInfo = {
        user_id: userId,
        name: name,
        hashed_password: hashed[1],
        salt: hashed[0],
        timezone: timeZone,
        created_at: unixTimestamp,
        type: -1,
      };

      if (!!profileImage) {
        createChessProfileImg(userId, profileImage);
      } else {
        createProfileImg(40, userId, gender);
      }

      newBots.push(Object.values(userInfo));

      const maxSubjects = randomIntInRange(1, 5);

      for (let subjectNum = 0; subjectNum < maxSubjects; subjectNum++) {
        const subject_id = generateRandomId(10);
        const created_at = unixTimestamp;

        const subjectCategory = randomIntInRange(
          0,
          possibleBotsSubjects.length - 1
        );
        let subjectName = possibleBotsSubjects[subjectCategory];
        subjectName = subjectName[randomIntInRange(0, subjectName.length - 1)];
        const color =
          subjectColors[randomIntInRange(0, subjectColors.length - 1)];
        const subject = {
          subject_id,
          name: subjectName,
          user_id: userId,
          color: color,
          created_at,
        };

        botsSubjects.push(Object.values(subject));
      }
    }

    if (newBots.length) {
      await connection.query(
        `INSERT IGNORE INTO users (user_id, name, hashed_password, salt, timezone, created_at, type) VALUES ?`,
        [newBots]
      );
      await connection.query(
        `INSERT IGNORE INTO subjects (subject_id, name, user_id, color, created_at) VALUES ?`,
        [botsSubjects]
      );
    }

    console.log("BOTS SUCCESSFULLY ADDED!", newBots[0]);
  } catch (err) {
    console.log(err);
  }
}

/**create profile imggs for each users*/
function createProfileImg(percentage, userId, gender) {
  try {
    const isProfile = Math.random() < percentage / 100;
    if (isProfile) {
      let filePath = `../data/profile-imgs/${gender}`;
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
  } catch (err) {
    console.log(err);
  }
}

function createChessProfileImg(userId, imgSrc) {
  try {
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
  } catch (err) {
    console.log(err);
  }
}

const groupColors = [
  "#FFF3DA",
  "#DFCCFB",
  "#D0BFFF",
  "#96B6C5",
  "#F1F0E8",
  "#C8E4B2",
  "#7EAA92",
  "#FFC6AC",
  "#9E9FA5",
  "#FF9B9B",
  "#FFCACC",
  "#FDCEDF",
  "#7C96AB",
  "#E8A0BF",
  "#C7E9B0",
  "#FFD966",
  "#F4B183",
  "#B4E4FF",
  "#F7C8E0",
  "#DFFFD8",
  "#95BDFF",
  "#7286D3",
  "#8EA7E9",
  "#FFF2F2",
  "#FD8A8A",
  "#B9F3FC",
];

async function createGroups(length) {
  try {
    const connection = await pool.promise();
    const [bots] = await connection.query(
      `SELECT user_id FROM users WHERE type = -1`
    );
    const [prevGroups] = await connection.query(`SELECT group_id FROM groups`);

    console.log("Starting Groups Generation");

    const newGroups = [];
    const newGroupsMembers = [];
    const newGroupsLikes = [];

    for (let i = 0; i < length; i++) {
      const groupId = generateRandomId(10);
      const index = randomIntInRange(0, groupsData.length - 1);
      const groupData = groupsData[index];

      if (prevGroups.find((group) => group.group_id === groupData.group_id)) {
        console.log("duped group");
        continue;
      }

      const hashed = hashing("0");
      const max_members = randomIntInRange(10, 50);
      const membersLength = randomIntInRange(10, max_members);
      const members = [];
      const likes = [];
      let whileTry = 0;

      while (members.length <= membersLength && whileTry < 100) {
        const selectedBotIndex = randomIntInRange(0, bots.length - 1);
        const selectedBot = bots[selectedBotIndex];

        if (!members.includes(selectedBot.user_id)) {
          members.push(selectedBot.user_id);
          const isLike = randomIntInRange(0, 6);
          if (!isLike) {
            likes.push(selectedBot.user_id);
          }
        }
        whileTry++;
      }

      const created_at = Math.floor(new Date().getTime() / 1000);

      newGroupsMembers.push(
        ...members.map((member) => [groupId, member, created_at])
      );
      newGroupsLikes.push(...likes.map((member) => [groupId, member]));

      const leader = members[0];
      const colorIndex = randomIntInRange(0, groupColors.length - 1);
      const color = groupColors[colorIndex];
      const { name, description, tags } = groupData;
      const visibility = randomIntInRange(0, 7) <= 1;
      const goal_hr = randomIntInRange(4, 8);
      const members_length = members.length;

      const groupInfo = {
        name,
        description,
        tags: JSON.stringify(tags),
        visibility,
        password: hashed[1],
        salt: hashed[0],
        max_members,
        created_at,
        group_id: groupId,
        leader: leader,
        color: color,
        goal_hr,
        members_length,
      };
      newGroups.push([
        groupInfo.group_id,
        groupInfo.name,
        groupInfo.description,
        groupInfo.tags,
        groupInfo.visibility,
        groupInfo.password,
        groupInfo.salt,
        groupInfo.max_members,
        groupInfo.created_at,
        groupInfo.leader,
        groupInfo.color,
        groupInfo.goal_hr,
        groupInfo.members_length,
      ]);
    }
    console.log(newGroups[0]);

    if (newGroups.length) {
      await connection.query(
        `
        INSERT IGNORE INTO \`groups\`
        (group_id, name, description, tags, visibility, password, salt, max_members, created_at, leader, color, goal_hr, members_length )
        VALUES ?
      `,
        [newGroups]
      );

      await connection.query(
        `
        INSERT IGNORE INTO \`chatrooms\`
        (chatroom_id, name)
        VALUES ?
      `,
        [newGroups.map((group) => [group[0], group[1]])]
      );
    }

    if (newGroupsMembers.length) {
      await connection.query(
        `INSERT IGNORE INTO group_members (group_id, user_id, joined_at) VALUES ?`,
        [newGroupsMembers]
      );
    }
    if (newGroupsLikes.length) {
      await connection.query(
        `INSERT IGNORE INTO group_likes (group_id, user_id) VALUES ?`,
        [newGroupsLikes]
      );
    }
    console.log("Groups generation complete");
  } catch (err) {
    console.log(err);
  }
}

async function createFriends(min, max) {
  try {
    const connection = pool.promise();
    const [bots] = await connection.query(
      `SELECT user_id FROM users WHERE type = -1`
    );

    const botIds = bots.map((bot) => bot.user_id);

    const [friends] = await connection.query(
      `SELECT user_id, friend_id FROM friends WHERE user_id IN (?) OR friend_id IN (?)`,
      [botIds, botIds]
    );

    const friendsArr = friends.map((friend) => [
      friend.user_id,
      friend.friend_id,
    ]);

    const date = Math.floor(new Date().getTime() / 1000);

    const newFriends = [];
    botIds.map((bot) => {
      const botFriends = friendsArr.filter(
        (friend) => friend[0] === bot || friend[1] === bot
      );
      let whileTry = 0;
      const realMax = randomIntInRange(min, max);

      while (botFriends.length <= realMax && whileTry < 10) {
        whileTry++;

        const randomFriendIndex = randomIntInRange(0, botIds.length - 1);
        const randomFriend = botIds[randomFriendIndex];
        const newFriend =
          bot < randomFriend ? [bot, randomFriend] : [randomFriend, bot];

        const isIn = botFriends.find(
          (existingFriend) =>
            JSON.stringify(existingFriend) === JSON.stringify(newFriend)
        );

        if (isIn || bot === randomFriend) continue;

        botFriends.push(newFriend);
        newFriends.push(newFriend);
      }
      friendsArr.push(...botFriends);
    });
    console.log("new", newFriends);

    if (newFriends.length) {
      await connection.query(
        `INSERT IGNORE INTO friends (user_id, friend_id, date) VALUES ?`,
        [newFriends.map((friend) => [...friend, date])]
      );
    }

    console.log(`bot friends added`, newFriends.length);
  } catch (err) {
    console.log(err);
  }
}

async function updateBotSubjectsColor() {
  try {
    const connection = pool.promise();

    const [subjects] = await connection.query(
      `SELECT s.subject_id, u.user_id
       from users u 
       LEFT JOIN subjects s 
       ON s.user_id = u.user_id
       WHERE u.type = -1 `
    );
    await Promise.all(
      subjects.map(async ({ subject_id, user_id }, i) => {
        const color = subjectColors[i % subjectColors.length];
        await connection.query(
          `UPDATE subjects SET color = ? WHERE subject_id = ? AND user_id = ?`,
          [color, subject_id, user_id]
        );
      })
    );
    console.log("subject colos updated", subjects.length);
  } catch (err) {
    console.log(err);
  }
}

async function deleteBots() {
  /* const connection = pool.promise();

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
    await redisClient.del(`user:${user_id}:activeSubject`);
    await redisClient.del(`user:${user_id}:activeGroup`);
    await redisClient.del(`user:${user_id}:friends`);
    await redisClient.del(`user:${user_id}:groups`);

    fs.unlink(`./public/profile-images/${user_id}.jpeg`, (err) => {
      if (err) {
        console.error(`Error deleting ${user_id}:`, err);
      } else {
        console.log(`${user_id} deleted successfully`);
      }
    });

    await connection.query(`DELETE FROM group_members WHERE user_id = ?`)
  }); */
}

module.exports = {
  createBots,
  createGroups,
  createFriends,
  deleteBots,
  updateBotSubjectsColor,
};
