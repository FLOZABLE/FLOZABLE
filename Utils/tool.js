const crypto = require("crypto");
const { DateTime } = require("luxon");

function generateRandomId(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

async function deriveKey(userId, key_salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(userId, key_salt, 86736, 32, "sha256", (err, derivedKey) => {
      if (err) {
        reject(err);
      } else {
        resolve(derivedKey.toString("hex"));
      }
    });
  });
}

function hashing(password) {
  let salt = crypto.randomBytes(32).toString("hex");
  return [
    salt,
    crypto.pbkdf2Sync(password, salt, 99097, 32, "sha512").toString("hex"),
  ];
}

function isValidTimeZone(timeZone) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timeZone });
    return true;
  } catch {
    return false;
  }
}

function getUserId(req) {
  return process.env.NODE_ENV === "development"
    ? process.env.TESTER_ID
    : req.session.user_id;
}

function randomIntInRange(min, max) {
  const randomVal = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomVal;
}

function arraysHaveSameContents(arr1, arr2) {
  const sortedArr1 = arr1.slice().sort();
  const sortedArr2 = arr2.slice().sort();

  return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
}

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
const secondConverter = (sec, options = ["s", "m", "h"]) => {
  let value = sec ? sec : 0;
  let type = 0;
  if (sec >= 60 * 60) {
    value = (sec / (60 * 60)).toFixed(2);
    type = 2;
  } else if (sec > 60) {
    value = Math.floor(sec / 60);
    type = 1;
  }

  return { value, type: options[type] };
};

function getMidnightTimezones() {
  const now = DateTime.utc();
  const allTimezones = Intl.supportedValuesOf("timeZone");
  const midnightTimezones = [];
  allTimezones.forEach((zone) => {
    const dtInZone = now.setZone(zone);
    if (dtInZone.hour === 0) {
      midnightTimezones.push(zone);
    }
  });

  return midnightTimezones;
}

function getDates(date, timezone, mode, length = 30) {
  const dates = [];
  let dateTime = DateTime.fromISO(date, { zone: timezone })
    .startOf(mode)
    .startOf("day");
  const now = DateTime.now().setZone(timezone).startOf(mode).startOf("day");

  for (let i = 0; i < length; i++) {
    if (dateTime.plus({ [mode]: i }) <= now) {
      dates.push(dateTime.plus({ [mode]: i }));
    }
  }
  while (dates.length < length) {
    dateTime = dateTime.minus({ [mode]: 1 });
    dates.unshift(dateTime);
  }

  return dates;
}

module.exports = {
  generateRandomId,
  hashing,
  isValidTimeZone,
  getUserId,
  randomIntInRange,
  arraysHaveSameContents,
  hex2rgb,
  secondConverter,
  deriveKey,
  getMidnightTimezones,
  getDates,
};
