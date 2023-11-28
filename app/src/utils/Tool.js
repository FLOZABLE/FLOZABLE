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

export { filterGroups };