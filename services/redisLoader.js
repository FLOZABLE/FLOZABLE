const redisClient = require("../model/redis");
const pool = require('../model/pool');
const { writeLog } = require('../Logger');

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
    const isCached = await redisClient.exists(`user:${userId}:subjects`);
    if (isCached) {
      const subjectsObj = { ...await redisClient.hGetAll(`user:${userId}:subjects`) };
      const subjectArr = Object.keys(subjectsObj).map((id) => {
        return { ...JSON.parse(subjectsObj[id]), id };
      });
      return subjectArr;
    } else {
      try {
        const connection = pool.promise();
        const [subjects] = await connection.query(`SELECT id, name, icon, color, datum_point, timeline_sum FROM subjects where user_id = ?`, [userId]);
        subjects.map(async (subject) => {
          const redisSubject = {...subject};
          delete redisSubject.id;
          redisClient.hSet(`user:${userId}:subjects`, subject.id, JSON.stringify(redisSubject));
        });
        return subjects;
      } catch (err) {
        console.log(err);
      };
    };
  } catch (err) {
    console.log(err);
  }
};

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

async function dmRoomsCache(userId) {
  let dmRooms = await redisClient.hGet(`user:${userId}`, 'dmRooms');
  if (!dmRooms) {
    const connection = pool.promise();
    [dmRooms] = await connection.query(`SELECT id FROM chatrooms WHERE members LIKE ?`, [`%${userId}%`]);
    dmRooms = dmRooms.map(dmRoom => {
      return dmRoom.id;
    });
    redisClient.hSet(`user:${userId}`, 'dmRooms', JSON.stringify(dmRooms));
  } else {
    dmRooms = JSON.parse(dmRooms);
  };

  return dmRooms;
};

/* async function dmRoomMembersCache(roomId) {
  let members = await redisClient.sMembers(`room:${roomId}`);
  if (!members.length) {
    const connection = pool.promise();
    const [dmRooms] = await connection.query(`SELECT members FROM chatrooms WHERE members LIKE ?`, [`%${userId}%`]);
  }
}
 */

async function dmRoomMembersLoader() {
  try {
    const connection = pool.promise();
    const [dmRooms] = await connection.query(`SELECT id, members FROM chatrooms WHERE type = 1`);
    dmRooms.map(room => {
      const { members, id } = room;
      if (members !== "") {
        const parsedMembers = members.split(",");
        redisClient.sAdd(`room:${id}`, parsedMembers)
      }
    })
  } catch (err) {
    console.log(err);
  };
};

async function groupChatsMembersLoader() {
  try {
    const connection = pool.promise();

    const [groups] = await connection.query(`SELECT members, group_id FROM groups`);
    groups.map(async (group) => {
      const {group_id, members} = group;
      const membersArr = members === "" ? [] : members.split(",");
      //await redisClient.del(`room:${group_id}`);
      redisClient.sAdd(`room:${group_id}`, membersArr);
    })
  } catch (err) {
    console.log(err);
  }
}


async function chatRoomsCache(userId) {
  try {
    let dmRooms = await dmRoomsCache(userId);
    const groups = await groupCache(userId);
    const groupRooms = groups.map(group => {
      return { id: group, type: 0, members: [] };
    });
    const dmRoomPromises = dmRooms.map(async (dmRoom) => {
      const members = await redisClient.sMembers(`room:${dmRoom}`);
      return { id: dmRoom, members, type: 1 };
    });
    const dmRoomsInfo = await Promise.all(dmRoomPromises);
    const rooms = groupRooms.concat(dmRoomsInfo);
    return rooms;
  } catch (err) {
    console.log(err);
    return [];
  };
};

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

async function activeSubjectCache(userId) {
  try {
    let activeSubject = await redisClient.hGet(`user:${userId}`, `ActiveSubject`);
    activeSubject = activeSubject ? { id: activeSubject.split(':')[0], time: activeSubject.split(':')[1] } : { id: 0, time: 0 };
    return activeSubject;
  } catch (err) {
    console.log(err);
  }
};

/**return timer information of the user.
 * return type is object
 * dp(datumpoint), ts(timeline sum)
 */
async function timerCache(userId, now = Math.floor(new Date().getTime() / 1000), ts = 0) {
  try {
    const isCached = await redisClient
    let timer = await redisClient.hGet(`user:${userId}`, 'timerInfo');

    if (timer) {
      timer = JSON.parse(timer);
    } else {
      timer = { dp: now, ts };
      await redisClient.hSet(`user:${userId}`, 'timerInfo', JSON.stringify(timer));
    };

    return timer;
  } catch (err) {

  }
};

async function usersCache(userId) {
  try {
    let isIn = await redisClient.sIsMember(`allMembers`, userId);
    if (!isIn) {
      const connection = pool.promise();
      const [[userInfo]] = await connection.query(`SELECT user_id FROM users WHERE user_id = ?`, [userId]);
      if (userInfo) {
        redisClient.sAdd(`allMembers`, userId);
        isIn = true;
      };
    };
    return isIn;
  } catch (err) {

  }
}

async function userCache(userId) {
  try {
    const isCached = await redisClient.hExists(`user:${userId}`, 'name');
    if (isCached) {
      const userInfo = { ...await redisClient.hGetAll(`user:${userId}`, 'name'), user_id: userId };
      return userInfo;
    } else {
      const connection = pool.promise();
      const [[userInfo]] = await connection.query("SELECT name, email, groups, friends, timezone, datum_point FROM users WHERE user_id = ?", [userId]);
      if (userInfo) {
        const { name, email, groups, friends, timezone, datum_point } = userInfo;
        redisClient.hSet(`user:${userId}`, 'name', name);
        redisClient.hSet(`user:${userId}`, 'email', email);
        redisClient.hSet(`user:${userId}`, 'groups', groups);
        redisClient.hSet(`user:${userId}`, 'friends', friends);
        redisClient.hSet(`user:${userId}`, 'timezone', timezone);
        redisClient.hSet(`user:${userId}`, 'datum_point', datum_point);
      };
      return userInfo;
    };
  } catch (err) {
    console.log(err);
  }
}

/**
 * notification's key:
 * i: id
 * t: type ex) -1 = all (default),  0 = friend-request, 1 = friend-request-accept, 2 = face-off-request, 3 = face-off-accept, 4 = dm request, 5 = dm accepted, 7 = group-invitation,
 * d: date (unix but divided by 1000 * 60 because we  need minute accuracy) 
 * optional:
 * f: from (used for friend-request, friend-accept, group invitation)
 * @param {*} userId 
 * @param {*} type 
 * @returns {[]} selectedNotifications
 */
async function NotificationCache(userId, type = -1) {
  const notifications = (await redisClient.sMembers(`user:${userId}:notifications`)).map(JSON.parse);
  await Promise.all(notifications.map(async(notification) => {
    if (notification.f) {
      notification.f = await userCache(notification.f);
    };
  }));
  if (type === -1) {
    return notifications;
  };
  const selectedNotifications = notifications.filter(notification => { return notification.t === type });
  return selectedNotifications;
};

async function membersCache(members) {
  members.map(member => {

  })
}

async function subjectsTimelineCache(userId) {
  const subjectsInfo = await subjectsCache(userId);
  const connection = pool.promise();
  const [subjectTimelines] = await connection.query(`SELECT timeline, id FROM subjects WHERE user_id = ?`, [userId]);
  const subjectPromises = subjectsInfo.map(async (subject) => {
    const {id, timeline} = subject;
    const prevTimeline = subjectTimelines.find(sub => {
      return sub.id === id;
    });
    const parsedTimeline  = prevTimeline.length ?JSON.parse(timeline.replace(/^/,"[").replace(/$/,"]")) : []; //wrapping the string with "[]"
    const todayTimeline = (await redisClient.lRange(`user:${userId}:subject:${id}`, 0, -1)).map(JSON.parse);
    subject.timeline = parsedTimeline.concat(todayTimeline);
    return subject;
  });

  const subjects = await Promise.all(subjectPromises);
  return subjects;
}

module.exports = {
  flushRedis,
  groupsLoader,
  cacheManager,
  lastMsgCache,
  groupCache,
  groupRoomCache,
  subjectsCache,
  activeSubjectCache,
  timerCache,
  NotificationCache,
  chatRoomsCache,
  msgQueue,
  usersCache,
  dmRoomMembersLoader,
  dmRoomsCache,
  userCache,
  subjectsTimelineCache,
  groupChatsMembersLoader
}