const crypto = require("crypto");
const Ajv = require('ajv');
const ajv = new Ajv();
const {google} = require('googleapis');

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
    return success();
  } else if (req.signedCookies.userId) {
    const connection = pool.promise();
    const [[userInfo]] = await connection.query('SELECT name, email, myinfo, timezone FROM users where user_id = ?', [req.signedCookies.userId]);
    pool.releaseConnection(connection);
    if (userInfo) {
      req.session.user_id = req.signedCookies.userId;
      req.session.loggedin = true;
      return success();
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

const googleOauth2client = (refresh_token) => {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  );
  if (refresh_token) {
    auth.setCredentials({refresh_token: refresh_token});
  };
  return auth;
};

module.exports = {
  generateRandomId,
  hashing,
  autoSignin,
  isValidJSON,
  getUserId,
  randomIntInRange,
  googleOauth2client
};