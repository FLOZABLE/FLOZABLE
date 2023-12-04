import ct from 'countries-and-timezones';

function filterGroups(userInfo, groups) {
  const userGroups = [];
  const otherGroups = [];
  const userGroupIds = userInfo.groups === "" ? [] : userInfo.groups.split(",");
  groups.map(group => {
    if (userGroupIds.includes(group.group_id)) {
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
}

export { filterGroups, getCountryCode };