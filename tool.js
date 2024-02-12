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

async function deriveKey(userId, key_salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(userId, key_salt, 86736, 32, 'sha256', (err, derivedKey) => {
      if (err) {
        reject(err);
      } else {
        resolve(derivedKey.toString('hex'));
      }
    });
  });
}

function hashing(password) {
  let salt = crypto.randomBytes(32).toString('hex')
  return [salt, crypto.pbkdf2Sync(password, salt, 99097, 32, 'sha512').toString('hex')]
};

async function autoSignin(req, res, success = (() => { }), fail = (() => { res.send({ success: false, reason: 'Sign in required', msg: 'Sign in required' }) })) {
  if (req.session.user_id || (process.env.NODE_ENV === 'development' && (req.session.user_id = process.env.TESTER_ID))) {
    return success(req.session.user_id, req.session.timezone);
  } else if (req.signedCookies.userId) {
    const userInfo = await userCache(req.signedCookies.userId);
    if (userInfo) {
      req.session.user_id = req.signedCookies.userId;
      req.session.timezone = userInfo.timezone;
      return success(req.session.user_id, req.session.timezone);
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


function isValidTimeZone(timeZone) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timeZone });
    return true;
  } catch {
    return false
  }
}

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


const googleYoutubeOauth2client = (credential) => {
  const auth = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URL
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

const hex2rgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return { r, g, b };
};

/**
 * @param {*} sec 
 * @returns 
 */
const secondConverter = (sec, options = ['s', 'm', 'h']) => {
  let value = sec ? sec : 0;
  let type = 0;
  if (sec >= 60 * 60) {
    value = (sec / (60 * 60)).toFixed(2);
    type = 2;
  } else if (sec > 60) {
    value = Math.floor(sec / 60);
    type = 1;
  };

  return { value, type: options[type] };
};

module.exports = {
  generateRandomId,
  hashing,
  autoSignin,
  isValidJSON,
  isValidTimeZone,
  getUserId,
  randomIntInRange,
  googleOauth2client,
  googleYoutubeOauth2client,
  arraysHaveSameContents,
  hex2rgb,
  secondConverter,
  deriveKey
};