const serverOrigin = process.env.REACT_APP_ORIGIN;

function getLikedGroups(userInfo, groups) {
  const userId = userInfo.user_id;
  const likedGroups = [];
  groups.map(group => {
    const likes = group.likes.split(',');
    if (likes.includes(userId)) {
      likedGroups.push(group.group_id);
    };
  });

  return likedGroups;
};

function getMyGroups(userInfo, groups) {
  const userId = userInfo.user_id;
  const myGroups = [];
  const otherGroups = [];
  groups.map(group => {
    if (group.members.find(member => member.user_id == userId)) {
      myGroups.push(group);
    } else {
      otherGroups.push(group);
    };
  });

  return { myGroups: myGroups, otherGroups: otherGroups };
};

function setGroupMembers(groups, users) {
  groups.map((group) => {
    group.members = group.members.split(',');
    group.members = group.members.map(member => {
      member = users.find((userInfo) => { return member == userInfo.user_id });
      if (typeof member.study == "string") {
        member.study = JSON.parse(member.study);
      }
      return member;
    });
    return group;
  });
  return groups;
}

export { getLikedGroups, getMyGroups, setGroupMembers };