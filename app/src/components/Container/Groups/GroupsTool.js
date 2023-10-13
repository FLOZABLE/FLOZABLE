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
  const otherGroups = [...groups];
  const myGroupsId = userInfo.groups.split(",");
  const myGroups = otherGroups.filter(group => myGroupsId.includes(group.group_id));
  const otherGroupsFiltered = otherGroups.filter(group => !myGroupsId.includes(group.group_id));
  return { myGroups, otherGroups: otherGroupsFiltered };
  
};

function setGroupMembers(groups, users) {
  const todayStart = new Date().setHours(0, 0, 0, 0) / 1000;
  const todayEnd = new Date().setHours(23, 59, 59, 0) / 1000;
  const newGroups = [...groups];
  newGroups.map((group) => {
    group.members = group.members.split(',');
    group.members = group.members.map(member => {
      member = users.find((userInfo) => { return member == userInfo.user_id });
      if (typeof member.study == "string") {
        member.study = JSON.parse(member.study);
        const datum = member.study.datum;
        member.study.total = 0;
        member.study.timeline.map(([start, stop]) => {
          start += datum;
          stop += datum;
          if (start > todayStart && stop < todayEnd) {
            member.study.total += stop - start;
          } else if (start > todayStart) {
            member.study.total += todayEnd - start;
          } else if (stop < todayEnd) {
            member.study.total += stop - todayStart;
          };
        });
      };
      return member;
    });
    return group;
  });
  return newGroups;
};

export { getLikedGroups, getMyGroups, setGroupMembers };