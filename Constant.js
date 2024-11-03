const RESPONSE_MESSAGES = {
  noUser: {
    success: false,
    message: "Invalid User",
    status: 400,
    error: {
      reason: "Invalid User",
    },
    action: "signin",
  },
  noSession: {
    success: false,
    message: "Sign In",
    status: 400,
    error: {
      reason: "Invalid User",
    },
    action: "signin",
  },
  noTargetUser: {
    success: false,
    message: "Invalid User",
    status: 400,
    error: {
      reason: "Invalid User",
    },
  },
  noGroup: {
    success: false,
    message: "Invalid Group",
    status: 404,
    error: {
      reason: "Invalid Group",
    },
  },
  noSubject: {
    success: false,
    message: "Invalid Subject",
    status: 400,
    error: {
      reason: "Invalid Subject",
    },
  },
  noPlan: {
    success: false,
    message: "Invalid Plan",
    status: 400,
    error: {
      reason: "Invalid Plan",
    },
  },
  nonMember: {
    success: false,
    message: "Not a member of this group",
    status: 403,
    error: {
      reason: "Not a member of this group",
    },
  },
  friendsLimitReached: {
    success: false,
    message: "Friends limit reached",
    status: 409,
    error: {
      reason: "Friends limit reached",
    },
  },
  expiredRequest: {
    success: false,
    message: "Expired Request",
    status: 410,
    error: {
      reason: "Expired Request",
    },
  },
  error: {
    success: false,
    message: "Unexpected Error",
    status: 500,
    error: {
      reason: "Unexpected Error",
    },
  },
  notAuthed: (message = "Not Authenticated") => {
    ({
      success: false,
      message,
      status: 401,
      error: {
        reason: "Not Authenticated",
      },
    });
  },
  wrongPassword: {
    success: false,
    message: "Wrong Password",
    status: 403,
    error: {
      reason: "Wrong Password",
    },
  },
  forbidden: {
    success: false,
    message: "You do not have permission to perform this action",
    status: 403,
    error: {
      reason: "Insufficient Privileges",
    },
  },
};

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

module.exports = {
  RESPONSE_MESSAGES,
  MAX_STUDY_TIME,
  USER_ID_COOKIE_OPTIONS,
  FRIENDS_LIMIT,
  PASSWORD_LINK_EXP,
  possibleBotsSubjects,
  REDIS_EXP,
  BOT_OPTIONS,
  subjectColors,
};
