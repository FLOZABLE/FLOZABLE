import React, { useContext, useEffect, useState } from "react";
import styles from "./GroupsContainer.module.css";
import { GroupsContext } from "@/app/utils/Contexts";
import GroupContainer from "../GroupContainer/GroupContainer";
import { DateTime } from "luxon";
import config from "@/app/utils/config";
import { useRankings } from "@/Hooks/rankingsHooks";

function GroupsContainer({ searchQuery, tags }) {
  const { otherGroups } = useContext(GroupsContext);

  const { useRankingsData } = useRankings(
    "day",
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    if (!useRankingsData?.success) return;
    setRankings(useRankingsData.rankings);
  }, [useRankingsData]);

  return (
    <div className={`${styles.GroupsContainer} customScroll`}>
      {otherGroups.map((group, i) => {
        let isSearched = false;

        const lowecaseTags = group.tags.map((tag) => tag.toLowerCase());
        if (!tags.length && searchQuery === "") {
          isSearched = true;
        } else if (searchQuery === "") {
          isSearched = lowecaseTags.some((tag) =>
            tags.includes(tag.toLowerCase())
          );
        } else if (!tags.length) {
          isSearched = group.name.toLowerCase().includes(searchQuery);
        } else {
          isSearched =
            lowecaseTags.some((tag) => tags.includes(tag.toLowerCase())) &&
            group.name.toLowerCase().includes(searchQuery.toLowerCase());
        }

        return (
          <GroupContainer
            groupInfo={group}
            key={i}
            rankings={rankings}
            isSearched={isSearched}
          />
        );
      })}
    </div>
  );
}

export default GroupsContainer;
