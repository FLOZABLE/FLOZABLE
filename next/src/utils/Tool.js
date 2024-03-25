import ct from 'countries-and-timezones';

function filterGroups(userInfo, groups) {
  const userGroups = [];
  const otherGroups = [];
  groups.map(group => {
    if (userInfo.groups.includes(group.group_id)) {
      userGroups.push(group);
    } else {
      otherGroups.push(group);
    };
  });

  return { userGroups, otherGroups };
};

function getCountryCode(timezone) {
  try {
    const timeZoneData = ct.getTimezone(timezone);
    if (timeZoneData && timeZoneData.countries[0]) {
      return timeZoneData.countries[0];
    };
    return false;
  } catch (error) {
    console.error(`Error getting country code for timezone ${timezone}:`, error);
    return false;
  }
};

/**
 * @param {*} sec 
 * @returns 
 */
const secondConverter = (sec, options = ['s', 'm', 'h']) => {
  let value = sec ? sec : 0;
  let type = 0;
  if (sec >= 60 * 60) {
    value = sec / (60 * 60).toFixed(2);
    type = 2;
  } else if (sec > 60) {
    value = Math.floor(sec / 60);
    type = 1;
  };

  return { value, type: options[type] };
};

const durationFormatter = (sec) => {
  let res = "";
  let hours = 0;
  if (sec >= 3600) {
    hours = Math.floor(sec / 3600);
    sec = sec % 3600;
  }
  let mins = 0;
  if (sec >= 60) {
    mins = Math.floor(sec / 60);
    sec = sec % 60;
  }

  if (hours > 0) {
    res = hours + "hr " + mins.toString().padStart(2, "0") + "m";
  }
  else if (mins > 0) {
    res = mins + "m " + sec.toString().padStart(2, "0") + "s";
  }
  else {
    res = sec + " seconds";
  }

  return res;
};


const cyrb128 = (str) => {
  let h1 = 1779033703, h2 = 3144134277,
    h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= (h2 ^ h3 ^ h4);
  h2 ^= h1;
  h3 ^= h1;
  h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
};

function randomIntInRange(min, max) {
  const randomVal = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomVal;
};

export { cyrb128, filterGroups, getCountryCode, secondConverter, randomIntInRange, durationFormatter };