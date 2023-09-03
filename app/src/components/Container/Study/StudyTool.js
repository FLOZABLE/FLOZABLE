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