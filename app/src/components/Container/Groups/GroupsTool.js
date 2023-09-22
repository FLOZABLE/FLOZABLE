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
  const now  = Math.floor(new Date().getTime() / 1000);
  const todayStart = new Date().setHours(0, 0, 0, 0) / 1000;
  const todayEnd = new Date().setHours(23, 59, 59, 0) / 1000;

  groups.map((group) => {
    group.members = group.members.split(',');
    group.members = group.members.map(member => {
      member = users.find((userInfo) => { return member == userInfo.user_id });
      if (typeof member.study == "string") {
        member.study = JSON.parse(member.study);
        const datum = member.study.datum;
        member.study.total = 0;
        /* member.study.timeline = member.study.timeline.map(([start, stop]) => {
          console.log(start, stop);
          start += datum;
          stop += datum;
          if (start > todayStart && stop < todayEnd) {
            //return [start, stop];
            member.study.total += stop - start;
          } else if (start > todayStart) {
            //return [todayStart, todayEnd];
            member.study.total += stop - start;
          } else if (stop < todayEnd) {
            //return [todayStart, stop];
          }
        }) */
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
        console.log(member.study.total);
        
      };
      return member;
    });
    return group;
  });
  return groups;
}

export { getLikedGroups, getMyGroups, setGroupMembers };