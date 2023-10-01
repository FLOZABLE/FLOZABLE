const pool = require('../model/pool');
const { DateTime } = require('luxon');
const crypto = require('crypto');

function hashing(password) {
  let salt = crypto.randomBytes(32).toString('hex');
  return [salt, crypto.pbkdf2Sync(password, salt, 99097, 32, 'sha512').toString('hex')];
}

function generateGroups() {

}

function generateId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 15;
  let groupId = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    groupId += characters.charAt(randomIndex);
  }

  return groupId;
}

function generateGroupId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 8;
  let groupId = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    groupId += characters.charAt(randomIndex);
  }

  return groupId;
}


async function generateUsers(length) {
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

  for (let i = 0; i < length; i++) {
    const name = `tester${i}`;
    const email = `tester${i}@t.t`;
    const password = '0';
    let hashed = hashing(password);

    const userId = generateId();
    const keySalt = crypto.randomBytes(32).toString('hex');
    const iv = crypto.randomBytes(16).toString('hex');
    const timeZone = timeZones[Math.floor(Math.random() * 11)];

    let userDateTime = DateTime.now().setZone(timeZone);
    //randomize date
    const subtractedDate = Math.floor(Math.random() * 100)
    userDateTime = userDateTime.minus({days: subtractedDate});
    const twelveAmDateTime = userDateTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    const unixTimestamp = Math.floor(twelveAmDateTime.toMillis() / 1000);
    const userInfo = {
      name: name,
      email: email,
      hashed_password: hashed[1],
      salt: hashed[0],
      user_id: userId,
      timezone: timeZone,
      datum_point: unixTimestamp,
      key_salt: keySalt,
      iv: iv,
      plan: '',
      daily: '[0]',
      weekly: '[0]',
      monthly: '[0]',
      activity: '{}',
      activity_setting: '[]',
      notification_setting: 'default_setting',
      subjects: '[]',
      study: JSON.stringify({study:false,point:unixTimestamp,total:0})
    }
    connection.query('INSERT INTO users SET?', userInfo);
  };
  pool.releaseConnection(connection);
}

async function generateGroups(length) {
  const connection = pool.promise();

  const [testUsers] = await connection.query(`SELECT name, user_id FROM users WHERE name LIKE ?`, [`tester%`]);
  const templates = [
    { name: 'Group Focus', explanation: 'Let\'s study all day long!', tags: ['Focus', '24hr no sleep', 'highschool'] },
    { name: 'Math Wizards', explanation: 'Unlock the magic of numbers and equations.', tags: ['Math', 'Problem Solving', 'Logic'] },
    { name: 'Literature Lounge', explanation: 'Dive into the world of words and critical analysis.', tags: ['Literature', 'Reading', 'Analysis'] },
    { name: 'Science Explorers', explanation: 'Explore the wonders of science and theories.', tags: ['Science', 'Experiment', 'Research'] },
    { name: 'Language Lab', explanation: 'Practice languages from around the world.', tags: ['Languages', 'Language Learning', 'Communication'] },
    { name: 'Coding Collective', explanation: 'Collaborate on coding projects and enhance your skills.', tags: ['Coding', 'Programming', 'Development'] },
    { name: 'Artistic Minds', explanation: 'Share and critique artwork, photography, and designs.', tags: ['Art', 'Creativity', 'Design'] },
    { name: 'History Buffs', explanation: 'Uncover mysteries of the past and historical debates.', tags: ['History', 'Historical Analysis', 'Research'] },
    { name: 'Fitness Fanatics', explanation: 'Combine study breaks with fitness tips and routines.', tags: ['Fitness', 'Exercise', 'Health'] },
    { name: 'Music Masters', explanation: 'Discuss music theory, genres, and artists.', tags: ['Music', 'Music Theory', 'Genres'] },
    { name: 'Sustainable Solutions', explanation: 'Brainstorm eco-friendly ideas for a greener future.', tags: ['Sustainability', 'Environment', 'Innovation'] },
    { name: 'Brain Teasers Brigade', explanation: 'Sharpen your mind with puzzles and challenges.', tags: ['Puzzles', 'Brain Teasers', 'Problem Solving'] },
    { name: 'Travel Enthusiasts', explanation: 'Share travel experiences and plan future trips.', tags: ['Travel', 'Adventure', 'Exploration'] },
    { name: 'Philosophy Circle', explanation: 'Dive into deep philosophical conversations.', tags: ['Philosophy', 'Discussion', 'Critical Thinking'] },
    { name: 'DIY Innovators', explanation: 'Share DIY projects and innovative ideas.', tags: ['DIY', 'Innovation', 'Creativity'] }
  ];

  const colors = [
    '#FFF3DA',
    '#DFCCFB',
    '#D0BFFF',
    '#96B6C5',
    '#F1F0E8',
    '#C8E4B2',
    '#7EAA92',
    '#FFC6AC',
    '#9E9FA5',
    '#FF9B9B',
    '#FFCACC',
    '#FDCEDF',
    '#7C96AB',
    '#E8A0BF',
    '#C7E9B0',
    '#FFD966',
    '#F4B183',
    '#B4E4FF',
    '#F7C8E0',
    '#DFFFD8',
    '#95BDFF',
    '#7286D3',
    '#8EA7E9',
    '#FFF2F2',
    '#FD8A8A',
    '#B9F3FC'
  ]
  
  
  for (let i = 0; i < length; i++) {
    const groupId = generateGroupId();
    const template = templates[Math.floor(Math.random() * 15)]
    const hashed = hashing('0');
    const max_people = Math.floor(Math.random() * 40) + 50;
    const membersLength = Math.floor(Math.random() * 10) + 3;
    const leaderIndex = Math.floor(Math.random() * 100);
    let leader = testUsers[leaderIndex].user_id;
    let members = leader;
    let likes = leader;
    let membersIndex = [leaderIndex];
    for(let j = 0; j < membersLength; j ++) {
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
    
    const roomInfo = {
      id: generateRandomId(10),
      group_id: group.group_id,
      name: 'general',
      type: 1,
      members: '*'
    }

    const addGroupRoom = await connection.query('INSERT INTO chatrooms set ?', roomInfo);

  };

  pool.releaseConnection(connection);
};

async function deleteTestUsers() {
  const connection = pool.promise();
  try {
    const removeTesters = await connection.query("DELETE FROM users WHERE name LIKE 'tester%'");
  } catch (err) {
    console.log(err);
  } finally {
    pool.releaseConnection(connection);
  };
};

async function deleteGroups() {
  const connection = pool.promise();
  try {
    const removeGroups = await connection.query("DELETE FROM groups");
    const updateUserGroups = await connection.query("UPDATE users set groups = ''");
  } catch (err) {
    console.log(err);
  } finally {
    pool.releaseConnection(connection);
  };
};

module.exports = {
  testUserGeneration: generateUsers,
  testGroupGeneration: generateGroups,
  deleteTestUsers: deleteTestUsers,
  deleteGroups: deleteGroups
}