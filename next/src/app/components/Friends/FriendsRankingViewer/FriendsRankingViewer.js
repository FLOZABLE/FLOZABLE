"use client";

import styles from "./FriendsRankingViewer.module.css";
import React, { useState } from "react";
import DropDownButton from "../../Buttons/DropDownButton/DropDownButton";
import { secondConverter } from "@/app/utils/Tool";
import { IconStatsChart } from "@/app/utils/Svg";
import UserContainer from "../../Users/UserContainer/UserContainer";
import { useRouter } from "next/navigation";
import { useRankingsFriends } from "@/Hooks/rankingsHooks";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";

function FriendsRankingViewer() {
  const [viewer, setViewer] = useState("day");

  const router = useRouter();

  const { data: rankingsFriendsData, isLoading: rankingsFriendsIsLoading } =
    useRankingsFriends(viewer);

  return (
    <div className={`Box ${styles.FriendsRankingViewer}`}>
      <div className="header">
        <h3>Friend Ranking</h3>
        <i>
          <IconStatsChart />
        </i>
      </div>
      <div className={styles.buttons}>
        <div>
          <DropDownButton
            options={{
              day: "Today",
              week: "This Week",
              month: "This Month",
            }}
            setValue={setViewer}
            value={viewer}
          />
        </div>
      </div>
      <div className={`contents customScroll ${styles.rankingsContainer}`}>
        {rankingsFriendsIsLoading || !rankingsFriendsData?.success ? (
          <CircularLoading />
        ) : (
          rankingsFriendsData.rankings.map((friend, i) => {
            const formattedVal = secondConverter(friend.study_time);

            return (
              <div
                className={styles.userContainer}
                key={i}
                style={{ zIndex: rankingsFriendsData.rankings.length - i }}
              >
                <div className={styles.rank}>#{i + 1}</div>
                <UserContainer
                  userInfo={friend}
                  onClick={() => {
                    router.push(`/dashboard/user/${friend.user_id}`);
                  }}
                ></UserContainer>
                <div className={styles.diff}>
                  {formattedVal.value} {formattedVal.type}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default FriendsRankingViewer;
