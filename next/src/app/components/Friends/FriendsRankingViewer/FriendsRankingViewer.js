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

function FriendsRankingViewer({  }) {
  const {userInfo} = useContext(UserInfoContext);

  const [viewer, setViewer] = useState('day');
  const [friendsRanking, setFriendsRanking] = useState([]);

  useEffect(() => {
    if (!userInfo) return;
    
    (async() => {
      const response = await fetchFriendsRanking();
      if (response.success) {
        const { day, week, month } = response;
        setFriendsRanking({ day, week, month });
      };
    })();
  }, [userInfo]);

  return (
    <div className={styles.FriendsRankingViewer}>
      <div className={styles.Button}>
        <div>
          <DropDownButton
            options={{
              "day": "Today",
              "week": "This Week",
              "month": "This Month"
            }}
            setValue={setViewer}
            value={viewer}
          />
        </div>
      </div>
      <div className={`${styles.rankings} customScroll`}>
        {friendsRanking?.[viewer]?.map((friend, i) => {
          let value = friend.dayTotal;
          if (viewer === "month") {
            value = friend.monthTotal;
          } else if (viewer === "week") {
            value = friend.weekTotal;
          };

          const formattedVal = secondConverter(value);

          return (
            <div className={styles.userContainer} key={i} style={{zIndex: friendsRanking[viewer].length - i}}>
              <div className={styles.rank}>
                #{i + 1}
              </div>
              <Link
                href={`/dashboard/user/${friend.user_id}`}
                className={styles.userInfo}>
                <ProfileImage 
                  userId={friend.user_id}
                />
                <div className={`${styles.name} overflowDot`}>{friend.name}</div>
                <CountryViewer timezone={friend.timezone} />
              </Link>
              <div className={styles.diff}>
                {formattedVal.value} {formattedVal.type}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default FriendsRankingViewer;