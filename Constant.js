const USER_ID_COOKIE_OPTIONS = {
  maxAge: 1000 * 60 * 60 * 24 * 30,
  secure: true,
  httpOnly: true,
  signed: true,
  sameSite: "strict",
};

const REDIS_EXP = {
  ACTIVE_GROUP: 60 * 60 * 12,
  ACTIVE_SUBJECT: 60 * 60 * 12,
  USER_GROUPS: 60 * 10,
  USER_FRIENDS: 60 * 10,
  USERINFO: 60 * 60,
  SUBJECTS: 60 * 10,
  VERIFY_EMAIL: 60 * 60 * 24 * 7,
  CHATROOM_MEMBERS: 60 * 10,
  CHATROOM_MESSAGES: 60 * 10,
  USER_CHAT_READS: 60 * 60 * 24 * 7,
  EXTENSION_AUTH: 60,
  APP_AUTH: 60 * 60 * 24 * 7,
};

const BOT_OPTIONS = {
  MIN_STUDY: 60 * 10,
  MAX_STUDY: 60 * 60 * 2,
  MIN_START_DELAY: 0,
  MAX_START_DELAY: 60 * 60 * 1,
};

const MAX_STUDY_TIME = 60 * 60 * 20; // 20hr = max study time. ignore more than 6 hr

const PASSWORD_LINK_EXP = 60 * 60 * 24; //reset password link only available for 24 hr

const FRIENDS_LIMIT = 10;

const possibleBotsSubjects = [
  ["Math", "Math", "Math", "Math", "Calculus", "Trig"],
  [
    "Science",
    "Science",
    "Biology",
    "Environment",
    "Biology",
    "Anatomy",
    "Biology",
    "Biology",
  ],
  ["Science", "Science", "Chemistry", "Chemistry", "Chemistry", "Biochemistry"],
  ["Physics", "Physics", "Physics", "Physics 1", "Physics 2", "Physics C"],
  [
    "French",
    "French",
    "Chinese",
    "Chinese",
    "Spanish",
    "Spanish",
    "Spanish",
    "Spanish",
    "Latin",
    "Latin",
  ],
  [
    "English",
    "English",
    "English",
    "ELA",
    "ELA",
    "Lit",
    "Literature",
    "Literature",
    "Language Arts",
  ],
  [
    "History",
    "History",
    "APUSH",
    "US History",
    "U.S. History",
    "Social Studies",
    "Social Studies",
  ],
  [
    "Reading",
    "Piano",
    "Cooking",
    "Art",
    "Art",
    "Reading",
    "Piano",
    "Piano",
    "PE",
    "Coding",
  ],
  [
    "Astronomy",
    "Computer Science",
    "Essays",
    "Comp Sci",
    "Engineering",
    "DE",
    "College Apps",
    "Shakespeare",
    "Essays",
    "Computer Science",
    "Music Theory",
    "Music Theory",
    "Art",
  ],
];

const subjectColors = [
  "#D9F0FF",
  "#A3D5FF",
  "#83C9F4",
  "#6F73D2",
  "#F8E16C",
  "#00C49A",
  "#FB8F67",
  "#156064",
  "#FCAB10",
  "#F8333C",
  "#44AF69",
  "#2B9EB3",
  "#393D3F",
  "#FDFDFF",
  "#C6C5B9",
  "#546A7B",
  "#93A3B1",
  "#7C898B",
  "#636564",
  "#4C443C",
  "#4C5760",
  "#93A8AC",
  "#D7CEB2",
  "#A59E8C",
];

const NOTIFICATION_MESSAGES = {
  friendRequest: (name) => ({
    contents: ["##profileCard", "sent friend request!"],
    title: `${name} sent friend request!`,
  }),
  friendRequestDecline: () => ({
    contents: "Declined friend request!",
    title: "Declined friend request!",
  }),
  friendRequestAccept: (name) => ({
    contents: ["#profileCard", `is now your friend!`],
    title: `${name} is now your friend!`,
  }),
};

module.exports = {
  MAX_STUDY_TIME,
  USER_ID_COOKIE_OPTIONS,
  FRIENDS_LIMIT,
  PASSWORD_LINK_EXP,
  possibleBotsSubjects,
  REDIS_EXP,
  BOT_OPTIONS,
  NOTIFICATION_MESSAGES,
  subjectColors,
};
