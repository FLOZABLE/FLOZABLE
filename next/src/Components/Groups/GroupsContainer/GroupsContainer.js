import React, { useContext, useEffect, useState } from "react";
import styles from "./GroupsContainer.module.css";
import { GroupsContext } from "@/utils/Contexts";
import GroupContainer from "../GroupContainer/GroupContainer";
import { DateTime } from "luxon";
import config from "@/utils/config";

function GroupsContainer({
  searchQuery,
  queryTags,
}) {
  const { otherGroups } = useContext(GroupsContext);

  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    fetch(`${config.server}/ranking/sort?mode=Daily&date=${DateTime.now().toISODate()}&timezone=${timezone}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          setRankings(response.data);
        }
      });
  }, []);




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

        return (
          <GroupContainer
            groupInfo={group}
            key={i}
            rankings={rankings}
            isSearched={isSearched}
          />
        )
      })}
    </div>
  );
}

export default GroupsContainer;