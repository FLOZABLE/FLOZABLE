import styles from "./FriendsRankingViewer.module.css";
import React, { useState } from "react";
import { secondConverter } from "../../../utils/Tool";
import config from "@/utils/config";
import Link from "next/link";
import CountryViewer from "@/Components/Others/CountryViewer/CountryViewer";
import DropDownButton from "@/Components/Buttons/DropDownButton/DropDownButton";

async function getFriendsRanking() {
  const response = await fetch(`${config.server}/ranking/friends`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("Response from server:", response); // Log the response object

  const data = await response.json();

  console.log("Data from server:", data); // Log the data object

  if (data.success) {
    const { day, week, month } = data;
    return { day, week, month };
  }

  throw new Error("Failed to fetch friends ranking");
}

export const getServerSideProps = async () => {
  const friendsRanking = await getFriendsRanking();

  console.log("Friends Ranking:", friendsRanking); // Log the friendsRanking object

  return {
    props: {
      friendsRanking,
    },
  };
};

const FriendsRankingViewer = ({ friendsRanking }) => {
  const [viewer, setViewer] = useState("day");

  console.log("Friends Ranking in component:", friendsRanking); // Log the friendsRanking object in the component

  return (
    <div className={styles.FriendsRankingViewer}>
      <div className={styles.Button}>
        <div>
          <DropDownButton
            options={{ day: "Today", week: "This Week", month: "This Month" }}
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
          }
          const formattedVal = secondConverter(value);
          return (
            <div className={styles.userContainer} key={i}>
              <div className={styles.rank}>#{i + 1}</div>
              <Link
                href={`/dashboard/user/${friend.user_id}`}
                className={styles.userInfo}
              >
                <div
                  className={styles.profileImg}
                  style={{
                    backgroundImage: `url("${config.server}/profile-images/${friend.user_id}.jpeg")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat",
                  }}
                ></div>
                <div className={`${styles.name} overflowDot`}>{friend.name}</div>
                <CountryViewer timezone={friend.timezone} />
              </Link>
              <div className={styles.diff}>
                {formattedVal.value} {formattedVal.type}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FriendsRankingViewer;