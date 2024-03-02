import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faHeart,
  faPeopleGroup,
  faStopwatch,
  faLock,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import LikeBtn from "../LikeBtn/LikeBtn";
import styles from "./GroupsGen.module.css";
import GroupUrlBtn from "../GroupUrlBtn/GroupUrlBtn";
import GroupContainer from "../GroupContainer/GroupContainer";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function GroupsGen({
  searchQuery,
  setMyGroups,
  setOtherGroups,
  setJoinGroupResponse,
  setIsGroupPwModal,
  setJoinTarget,
  groups,
  userInfo,
  queryTags,
  myGroups,
  groupsViewerRef,
  setResponse,
}) {
  const [otherGroupsEl, setOtherGroupsEl] = useState(null);
  const [maxGroups, setMaxGroups] = useState(-1);

  const joinGroup = (targetGroup) => {
    setJoinTarget(targetGroup);
    if (targetGroup.visibility) {
      fetch(`${serverOrigin}/groups/join/${targetGroup.group_id}`, {
        method: "post",
      })
        .then((response) => response.json())
        .then((data) => {
          setJoinGroupResponse(data);
          if (data.success) {
            setOtherGroups(
              groups.filter((group) => {
                return group.group_id != targetGroup.group_id;
              }),
            );
            setMyGroups((myGroups) => [...myGroups, targetGroup]);
            if (groupsViewerRef) {
              document.body.scrollIntoView({ behavior: 'smooth', block: 'start' });
              setTimeout(() => {
                groupsViewerRef.current.swiper.slideTo(myGroups.length);
              }, 1000);
            };
          };
        })
        .catch((error) => console.error(error));
    } else {
      setIsGroupPwModal(true);
    }
  };

  useEffect(() => {
    if (userInfo === null || userInfo === undefined ) return;
    setOtherGroupsEl(
      [...groups].map((group, i) => {
        if (maxGroups !== -1 && i > maxGroups) {
          return;
        }
        const tags = JSON.parse(group.tags);

        let isSearched = false;
        if (
          !queryTags.length &&
          (searchQuery === "" || typeof searchQuery === "undefined")
        ) {
          isSearched = true;
        } else if (queryTags.length && searchQuery === "") {
          if (
            tags.some((element) => queryTags.includes(element.toLowerCase()))
          ) {
            isSearched = true;
          }
        } else if (!queryTags.length && searchQuery !== "") {
          if (
            group.name.toLowerCase().includes(searchQuery) ||
            group.tags.includes(searchQuery)
          ) {
            isSearched = true;
          }
        } else {
          if (
            tags.some((element) => queryTags.includes(element.toLowerCase())) &&
            (group.name.toLowerCase().includes(searchQuery) ||
              group.tags.includes(searchQuery))
          ) {
            isSearched = true;
          };
        };

        return (
          <GroupContainer key={i} isSearched={isSearched} joinGroup={joinGroup} groupInfo={group} userInfo={userInfo} myGroups={myGroups} setResponse={setResponse}/>
        );
      }),
    );
  }, [queryTags, searchQuery, groups, maxGroups, userInfo, myGroups]);

  return (
    <div className={styles.GroupsContainer}>
      {otherGroupsEl}
    </div>
  );
}

export default GroupsGen;