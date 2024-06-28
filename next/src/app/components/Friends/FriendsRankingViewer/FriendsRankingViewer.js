"use client";

import styles from "./FriendsRankingViewer.module.css";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import DropDownButton from "../../Buttons/DropDownButton/DropDownButton";
import ProfileImage from "../../Users/ProfileImage/ProfileImage";
import CountryViewer from "../../Others/CountryViewer/CountryViewer";
import { fetchFriendsRanking } from "@/Api/friendsApi";
import { secondConverter } from "@/app/utils/Tool";
import { UserInfoContext } from "@/app/utils/Contexts";
import { IconStatsChart } from "@/app/utils/Svg";
import UserContainer from "../../Users/UserContainer/UserContainer";

function FriendsRankingViewer({}) {
  const { userInfo } = useContext(UserInfoContext);

  const [viewer, setViewer] = useState("day");
  const [friendsRanking, setFriendsRanking] = useState([]);

  useEffect(() => {
    if (!userInfo) return;

    (async () => {
      const response = await fetchFriendsRanking();
      if (response.success) {
        const { day, week, month } = response;
        setFriendsRanking({ day, week, month });
      }
    })();
  }, [userInfo]);

  return (
    <div className={`Box ${styles.FriendsRankingViewer}`}>
      <div className="header">
        <h3>Friend Ranking</h3>
        <i>
          <IconStatsChart />
        </i>
      </div>
      <div className={styles.Button}>
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
      <div className={`contents customScroll`}>
        {friendsRanking?.[viewer]?.map((friend, i) => {
          let value = friend.dayTotal;
          if (viewer === "month") {
            value = friend.monthTotal;
          } else if (viewer === "week") {
            value = friend.weekTotal;
          }

          const formattedVal = secondConverter(value);

          return (
            <div
              className={styles.userContainer}
              key={i}
              style={{ zIndex: friendsRanking[viewer].length - i }}
            >
              <div className={styles.rank}>#{i + 1}</div>
              <UserContainer userInfo={friend}> </UserContainer>
              <div className={styles.diff}>
                {formattedVal.value} {formattedVal.type}
              </div>
            </div>
          );
        })}
        {friendsRanking?.[viewer]?.map((friend, i) => {
          let value = friend.dayTotal;
          if (viewer === "month") {
            value = friend.monthTotal;
          } else if (viewer === "week") {
            value = friend.weekTotal;
          }

          const formattedVal = secondConverter(value);

          return (
            <div
              className={styles.userContainer}
              key={i}
              style={{ zIndex: friendsRanking[viewer].length - i }}
            >
              <div className={styles.rank}>#{i + 1}</div>
              <UserContainer userInfo={friend}> </UserContainer>
              <div className={styles.diff}>
                {formattedVal.value} {formattedVal.type}
              </div>
            </div>
          );
        })}
        {friendsRanking?.[viewer]?.map((friend, i) => {
          let value = friend.dayTotal;
          if (viewer === "month") {
            value = friend.monthTotal;
          } else if (viewer === "week") {
            value = friend.weekTotal;
          }

          const formattedVal = secondConverter(value);

          return (
            <div
              className={styles.userContainer}
              key={i}
              style={{ zIndex: friendsRanking[viewer].length - i }}
            >
              <div className={styles.rank}>#{i + 1}</div>
              <UserContainer userInfo={friend}> </UserContainer>
              <div className={styles.diff}>
                {formattedVal.value} {formattedVal.type}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FriendsRankingViewer;
