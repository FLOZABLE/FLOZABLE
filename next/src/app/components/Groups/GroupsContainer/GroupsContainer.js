import React, { useEffect, useState } from "react";
import styles from "./GroupsContainer.module.css";
import GroupContainer from "../GroupContainer/GroupContainer";
import { useRankings } from "@/Hooks/rankingsHooks";
import { useGroups } from "@/Hooks/groupsHook";
import { useTour } from "@reactour/tour";

function GroupsContainer({ searchQuery, tags }) {
  const { currentStep, setCurrentStep } = useTour();
  const { groups } = useGroups();

  const { rankingsData } = useRankings(
    "day",
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    if (!rankingsData?.success) return;
    setRankings(rankingsData.data.rankings);
  }, [rankingsData]);

  useEffect(() => {
    if (currentStep === 21) {
      setTimeout(() => {
        setCurrentStep(22);
      }, 3000);
    } else if (currentStep === 22) {
      setTimeout(() => {
        setCurrentStep(23);
      }, 3000);
    }
  }, [currentStep]);

  return (
    <div
      className={`${styles.GroupsContainer} customScroll`}
      data-tutorial={22}
    >
      {groups.map((group, i) => {
        let isSearched = false;

        const lowecaseTags = group.tags.map((tag) => tag.toLowerCase());

        const searchQueryRegex = new RegExp(`${searchQuery}`, "i");

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
            searchQueryRegex.test(group.name + group.description);
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
