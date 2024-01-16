const crypto = require("crypto");
const Ajv = require('ajv');
const ajv = new Ajv();
const {google} = require('googleapis');
const pool = require("./model/pool");
const { userCache } = require("./services/redisLoader");

function generateRandomId(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};

function hashing(password) {
  let salt = crypto.randomBytes(32).toString('hex')
  return [salt, crypto.pbkdf2Sync(password, salt, 99097, 32, 'sha512').toString('hex')]
};

async function autoSignin(req, res, success = (() => { }), fail = (() => { res.send({ success: false, reason: 'not authenticated', msg: 'not authenticated' }) })) {
  if (req.session.loggedin || (process.env.NODE_ENV === 'development' && (req.session.user_id = process.env.TESTER_ID))) {
    return success(req.session.user_id);
  } else if (req.signedCookies.userId) {
    const userInfo = await userCache(req.signedCookies.userId);
    if (userInfo) {
      req.session.user_id = req.signedCookies.userId;
      req.session.loggedin = true;
      return success(req.session.user_id);
    } else {
      return fail();
    }
  } else {
    return fail();
  }
};

function isValidJSON(data, schema) {
  const validate = ajv.compile(schema);
  const isValid = validate(data);

  if (!isValid) {
    return false;
  } else {
    return true;
  }
};

function getUserId(req) {
  return process.env.NODE_ENV === 'development' ? process.env.TESTER_ID : req.session.user_id;
};

function randomIntInRange(min, max) {
  const randomVal = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomVal;
};

const googleOauth2client = (credential) => {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  );
  if (credential) {
    auth.setCredentials(credential);
  };
  return auth;
};

function arraysHaveSameContents(arr1, arr2) {
  const sortedArr1 = arr1.slice().sort();
  const sortedArr2 = arr2.slice().sort();

  return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
};

module.exports = {
  generateRandomId,
  hashing,
  autoSignin,
  isValidJSON,
  getUserId,
  randomIntInRange,
  googleOauth2client,
  arraysHaveSameContents
};