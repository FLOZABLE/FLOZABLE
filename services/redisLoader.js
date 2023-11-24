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

async function subjectsCache(userId, cache = true, opt = ['id', 'name', 'icon', 'color', 'datum_point', 'timeline_sum']) {
  try {
    const userInfo = await redisClient.hGetAll(`user:${userId}`);
    let subjects;
    if (userInfo) {
      subjects = Object.keys(userInfo).reduce((filteredSubjects, info, i) => {
        if (info.includes('subject:')) {
          const subjectInfo = JSON.parse(userInfo[info]);
          filteredSubjects.push(subjectInfo);
        };
        return filteredSubjects;
      }, []);
    };
    if (!subjects.length) {
      //no cache
      try {
        const connection = pool.promise();
        [subjects] = await connection.query(`SELECT ${opt.join(', ')} FROM subjects where user_id = ?`, [userId]);
        Promise.all(subjects.map(async (subject) => {
          /* 
          {\"id\":\"gQNfNmQnGR\",\"name\":\"gd\",\"icon\":\"Article\",\"color\":\"#D2DAFF\",\"datum_point\":1698958888}
          */
          const redisSubject = { ...subject };
          delete redisSubject.timeline;
          if (cache) {
            await redisClient.hSet(`user:${userId}`, `subject:${subject.id}`, JSON.stringify(redisSubject));
          };
        }))
      } catch (err) {
        console.log(err);
      };
    };

    return subjects;
  } catch (err) {
    console.log(err);
  }
};

//subject with timeline

/* async function subjectsTimelineCache(userId) {
  try {
    const userInfo = await redisClient.hGetAll(`user:${userId}`);
    let subjects;
    if (userInfo) {
      subjects = Object.keys(userInfo).forEach(async (info) => {
        if (info.includes('subject:')) {
          const subjectInfo = JSON.parse(userInfo[info]);
          const subjectTimeline = await redisClient.lRange(`subject`)
          return subjectInfo;
        }
      });

      if (!subjects) {
        try {
          const connection = pool.promise();
          [subjects] = await connection.query(`SELECT id, name, icon, color, datum_point, timeline FROM subjects where user_id = ?`, [userId]);
          subjects.map(async(subject) => {
           const redisSubject = {...subject};
           delete redisSubject.timeline;
            redisClient.hSet(`user:${userId}`, `subject:${subject.id}`, redisSubject);
          })
        } catch (err) {
          console.log(err);
        };
      };
    }
    console.log('subjects',subjects)
    return subjects;
  } catch (err) {
    console.log(err);
  }
}; */


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

async function chatRoomsCache(userId) {
  try {
    let dmRooms = await redisClient.hGet(`user:${userId}`, 'dmRooms');
    const groups = await groupCache(userId);
    const groupRooms = groups.map(group => {
      return {id: group, type: 1};
    });
    if (!dmRooms) {
      const connection = pool.promise();
      [dmRooms] = await connection.query(`SELECT id, members FROM chatrooms WHERE members LIKE ?`, [userId]);
      const dmRoomIds = dmRooms.map((dmRoom) => {
        const {id, members} = dmRoom;
        redisClient.sAdd(`room:${id}`, members);
        return id;
      });
      redisClient.hSet(`user:${userId}`, 'dmRooms', JSON.stringify(dmRoomIds));
    } else {
      dmRooms = JSON.parse(dmRooms);
    };
    const rooms = groupRooms.concat(dmRooms);
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
    let timer = await redisClient.hGet(`user:${userId}`, 'timerInfo');
    
    if (timer) {
      timer = JSON.parse(timer);
    } else {
      timer = {dp: now, ts};
      await redisClient.hSet(`user:${userId}`, 'timerInfo', JSON.stringify(timer));
    };

    return timer;
  } catch (err) {

  }
};


/**
 * notification's key:
 * i: id
 * t: type ex) -1 = all (default),  0 = friend-request, 1 = friend-accept, 2 = group-invitation
 * d: date (unix but divided by 1000 * 60 because we  need minute accuracy) 
 * optional:
 * f: from (used for friend-request, friend-accept, group invitation)
 * @param {*} userId 
 * @param {*} type 
 * @returns {[]} selectedNotifications
 */
async function NotificationCache(userId, type = -1) {
  const notifications = (await redisClient.sMembers(`user:${userId}:notifications`)).map(JSON.parse);
  if (type === -1) {
    return notifications;
  };
  const selectedNotifications = notifications.filter(notification => {return notification.t === type});
  return selectedNotifications;
};

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
  msgQueue
}