import React, { useContext, useEffect, useState } from "react";
import styles from "./GroupsContainer.module.css";
import { GroupsContext } from "@/utils/Contexts";
import GroupContainer from "../GroupContainer/GroupContainer";

function GroupsContainer({
  searchQuery,
  queryTags,
}) {
  const { otherGroups } = useContext(GroupsContext);

  /* const joinGroup = (targetGroup) => {
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
  }; */


  return (
    <div className={styles.GroupsContainer}>
      {otherGroups.map((group, i) => {

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

        if (isSearched) {
          return (
            <></>
          )
        }
      })}
    </div>
  );
}

export default GroupsContainer;