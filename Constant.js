const RESPONSE_CODES = {
  "no-user": {
    success: false,
    reason: "Invalid User",
    code: 400,
  },
  "no-group": {
    success: false,
    reason: "Invalid Group",
    code: 404,
  },
  "no-subject": {
    success: false,
    reason: "Invalid Subject",
    code: 400,
  },
  "no-plan": {
    success: false,
    reason: "Invalid Plan",
    code: 400,
  },
  "non-member": {
    success: false,
    reason: "Not a member of this group",
    code: 403,
  },
  "friends-limit-reached": {
    success: false,
    reason: "Friends limit reached",
    code: 409,
  },
  "expired-request": {
    success: false,
    reason: "Expired Request",
    code: 410,
  },
  error: {
    success: false,
    reason: "Unexpected Error",
    code: 500,
  },
  "not-authenticated": {
    success: false,
    reason: "Not Authenticated",
    code: 401,
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
  VERIFY_EMAIL: 60 * 60 * 24 * 7
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

module.exports = {
  RESPONSE_CODES,
  MAX_STUDY_TIME,
  USER_ID_COOKIE_OPTIONS,
  FRIENDS_LIMIT,
  PASSWORD_LINK_EXP,
  possibleBotsSubjects,
  REDIS_EXP,
};
