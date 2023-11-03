const redisClient = require("../model/redis");
const pool = require('../model/pool');
const {writeLog} = require('../Logger');

async function flushRedis() {
  await redisClient.flushDb();
};

/** loads both chatrooms & groups*/
async function groupsLoader() {
  const connection = pool.promise();
  const [chatRooms] = await connection.query(`SELECT id, group_id, name, type, members FROM chatrooms`);
  //console.log(chatRooms);
  chatRooms.map(async (chatRoom) => {
    const chatRoomInfo = { ...chatRoom };
    delete chatRoomInfo.group_id;
    //redisClient.hSet(`group:${chatRoom.group_id}`, 'rooms', JSON.stringify(chatRoomInfo))
    await redisClient.sAdd(`group:${chatRoom.group_id}:rooms`, JSON.stringify(chatRoomInfo));
  });
};

function cacheManager() {
  console.log('d');
};

//study
async function lastMsgCache() {
  /*   try {
      let lastMsg = await redisClient.hGet();
      if (!lastMsg) {
        lastMsg = 
      }
    } catch (err) {
      console.log(err);
    }; */
}

async function groupCache(userId) {
  try {
    let groups = await redisClient.hGet(`user:${userId}`, 'groups');
    if (!groups) {
      const connection = pool.promise();
      try {
        const [[userInfo]] = await connection.query(`SELECT groups FROM users WHERE user_id = ?`, [userId]);
        groups = userInfo ? userInfo.groups : "";
      } catch (err) {
        console.log(err);
      };
    };
    groups = groups.split(',');
    return groups;
  } catch (err) {
    console.log(err);
  };
};

async function subjectsCache(userId) {
  try {
    let subjects = await redisClient.hGet(`user:${userId}`, 'subjects');
    if (!subjects) {
      const connection = pool.promise();
      try {
        const [[userInfo]] = await connection.query(`SELECT subjects FROM users WHERE user_id = ?`, [userId]);
        subjects = userInfo ? userInfo.subjects : "";
      } catch (err) {
        console.log(err);
      };
    };
    subjects = subjects.split(',');
    return subjects;
  } catch (err) {
    console.log(err);
  }
};

async function subjectsInfoCache(userId) {
  try {
    const subjects = await subjectsCache(userId);
    let subjectsInfo = await redisClient.hmGet(`user:${userId}`, ...subjects.map(subject => {return `subject:${subject}`}));
    console.log('subjectsInfo',subjectsInfo);
    /* for (const subject of subjects) {
      if (!subject) {
        const [subjectsInfo] = await connection.query(`SELECT id, name, icon, color, datum_point, timeline FROM subjects where user_id = ?`, [userId]);
        return subjectsInfo;
      }

    }
    if (!subjectsInfo) {
      const connection = pool.promise();
      [subjectsInfo] = await connection.query(`SELECT id, name, icon, color, datum_point, timeline FROM subjects where user_id = ?`, [userId]);
      for (const subject of subjectsInfo) {
        const redisSubject = { ...subject };
        delete redisSubject.timeline;
        await redisClient.hSet(`user:${userId}`, `subject:${subject.id}`, JSON.stringify(redisSubject));
        let prevTimeline = JSON.parse(subject.timeline);
        prevTimeline = prevTimeline.map(str => JSON.parse(str)).flat();
        const todayTimeline = (await redisClient.lRange(`user:${userId}:subject:${subject.id}`, 0, -1)).map(JSON.parse);
        subject.timeline = prevTimeline.concat(todayTimeline);
      }
    } else {
      for (const subject of subjectsInfo) {
        const redisSubject = { ...subject };
        delete redisSubject.timeline;
        await redisClient.hSet(`user:${userId}`, `subject:${subject.id}`, JSON.stringify(redisSubject));
        let prevTimeline = JSON.parse(subject.timeline);
        prevTimeline = prevTimeline.map(str => JSON.parse(str)).flat();
        const todayTimeline = (await redisClient.lRange(`user:${userId}:subject:${subject.id}`, 0, -1)).map(JSON.parse);
        subject.timeline = prevTimeline.concat(todayTimeline);
      }
    }
    redisClient.hSet(`user:${userId}`, `ActiveSubject`, '0'); */
  } catch (err) {

  }
}

async function groupRoomCache(userId) {
  try {
    const groups = await groupCache(userId);
    const groupRooms = await Promise.all(groups.map(async (group) => {
      let chatRooms = await redisClient.sMembers(`group:${group}:rooms`);
      chatRooms = chatRooms.map(room => {
        room = JSON.parse(room);
        room.status = -1;
        socket.join(room.id);
        return room;
      });
      return { groupId: group, rooms: chatRooms };
    }));
    io.to(socket.id).emit('joinMyGroups', groupRooms);
  } catch (err) {
    
  };
};

/* async function accountInfoCache(userId) {
  try {
    let userInfo =
    const [[userInfo]] = await connection.query("SELECT user_id, name, email, language, groups FROM users WHERE user_id = ?", [userId]);
    await redisClient.hSet(`user:${userId}`, `groups`, userInfo.groups);
  } catch (err) {
    
  }
}
 */

module.exports = {
  flushRedis,
  groupsLoader,
  cacheManager,
  lastMsgCache,
  groupCache,
  groupRoomCache,
  subjectsCache,
  subjectsInfoCache
}