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
    const userInfo = await redisClient.hGetAll(`user:${userId}`);
    let subjects;
    if (userInfo) {

      subjects = Object.keys(userInfo).reduce( (filteredSubjects, info, i) => {
        if (info.includes('subject:')) {
          const subjectInfo = JSON.parse(userInfo[info]);
          filteredSubjects.push(subjectInfo);
        };
        return filteredSubjects;
      }, []);
      if (!subjects) {
        //no cache
        try {
          const connection = pool.promise();
          [subjects] = await connection.query(`SELECT id, name, icon, color, datum_point, timeline_sum FROM subjects where user_id = ?`, [userId]);
          subjects.map(async(subject) => {
            /* 
            {\"id\":\"gQNfNmQnGR\",\"name\":\"gd\",\"icon\":\"Article\",\"color\":\"#D2DAFF\",\"datum_point\":1698958888}
            */
           const redisSubject = {...subject};
           delete redisSubject.timeline;
          redisClient.hSet(`user:${userId}`, `subject:${subject.id}`, JSON.stringify(redisSubject));
          })
        } catch (err) {
          console.log(err);
        };
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
    activeSubject = activeSubject ? JSON.parse(activeSubject) : 0;
    return activeSubject;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  flushRedis,
  groupsLoader,
  cacheManager,
  lastMsgCache,
  groupCache,
  groupRoomCache,
  subjectsCache,
  activeSubjectCache
}