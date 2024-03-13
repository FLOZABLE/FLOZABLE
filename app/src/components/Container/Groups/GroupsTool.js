const serverOrigin = process.env.REACT_APP_ORIGIN;

function getLikedGroups(userInfo, groups) {
  const userId = userInfo.user_id;
  const likedGroups = [];
  groups.map((group) => {
    const likes = group.likes.split(",");
    if (likes.includes(userId)) {
      likedGroups.push(group.group_id);
    }
  });

  return likedGroups;
}

function getMyGroups(userInfo, groups) {
  const otherGroups = [...groups];
  const myGroups = otherGroups.filter((group) =>
  userInfo.groups.includes(group.group_id),
  );
  const otherGroupsFiltered = otherGroups.filter(
    (group) => !userInfo.groups.includes(group.group_id),
  );
  return { myGroups: myGroups, otherGroups: otherGroupsFiltered };
}

function setGroupMembers(groups, users) {
  const todayStart = new Date().setHours(0, 0, 0, 0) / 1000;
  const todayEnd = new Date().setHours(23, 59, 59, 0) / 1000;
  const newGroups = [...groups];
  newGroups.map((group) => {
    group.members =
      typeof group.members === "string" ? group.members.split(",") : [];
    group.members = group.members.map((member) => {
      member = users.find((userInfo) => {
        return member == userInfo.user_id;
      });
      if (!member) return;
      const datum = member.timerInfo.dp;
      let timelineSum = 0;
      let total = 0;
      //used find instead of map because it is not possible to get out of the loop when using map
      member.timer.find((activity) => {
        const [start, duration] = JSON.parse(activity);
        const unixStart = start + datum + timelineSum;
        const unixStop = unixStart + duration;
        //
        timelineSum += start + duration;
        if (todayStart <= unixStart && unixStop <= todayEnd) {
          total += duration;
        } else if (todayStart <= unixStart) {
          //case when start time is between 0:00 and 23:59, but stop time is new date
          //in this case, we will separte the activity into 2 arrays one activity with [start, 23:59], [0:00, stop]
          //
          total += todayEnd - unixStart;
          //stop the loop because it is not in the range anymore
          return true;
        } /* else if (unixStop <= todayEnd) { //impossible value
          total += unixStop - todayStart;
          //stop the loop because it is not in the range anymore
          return true;
        }; */
      });
      member.timerInfo.total = total;
      return member;
    });
    return group;
  });
  return newGroups;
}

export { getLikedGroups, getMyGroups, setGroupMembers };