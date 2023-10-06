function setGroupMembers(groups, users) {
  /* groups.map((group) => {
    group.members = group.members.split(',');
    group.members = group.members.map(member => {
      member = users.find((userInfo) => { return member == userInfo.user_id });
      if (typeof member.study == "string") {
        member.study = JSON.parse(member.study);
      }
      return member;
    });
    return group;
  }); */
  return groups;
};

function getMyGroups(userInfo, groups, users) {
  const userId = userInfo.user_id;
  const myGroups = [];
  const allGroups = groups;
  const todayStart = new Date().setHours(0, 0, 0, 0) / 1000;
  const todayEnd = new Date().setHours(23, 59, 59, 0) / 1000;
  if (!allGroups.length) {
    return { myGroups: myGroups}
  }
  allGroups.map(group => {
    if(typeof group.members === "string") {
      group.members = group.members.split(',');
      if (group.members.find(member => member == userId)) {
        group.members = group.members.map(member => {
          const memberInfo = users.find((user) => { return user.user_id == member });
          if (typeof memberInfo.study == "string") {
            memberInfo.study = JSON.parse(memberInfo.study);
            const datum = memberInfo.study.datum;
            memberInfo.study.total = 0;
            memberInfo.study.timeline.map(([start, stop]) => {
              start += datum;
              stop += datum;
              if (start >= todayStart && stop <= todayEnd) {
                memberInfo.study.total += stop - start;
              } else if (start >= todayStart) {
                memberInfo.study.total += todayEnd - start;
              } else if (stop <= todayEnd) {
                memberInfo.study.total += stop - todayStart;
              };
            });
          }
          return memberInfo;
        });
        myGroups.push(group);
      };
    }
  });
  return { myGroups: myGroups };
};

export { setGroupMembers, getMyGroups };