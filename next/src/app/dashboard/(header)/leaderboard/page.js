"use client";

import { useContext, useState } from "react";
import styles from "./page.module.css";
import TopLeaderBoard from "@/app/components/Leaderboard/TopLeaderBoard/TopLeaderBoard";
import Leaderboard from "@/app/components/Leaderboard/Leaderboard/Leaderboard";
import RankingsTrendsChart from "@/app/components/Charts/RankingsTrendsChart/RankingsTrendsChart";
import { UserInfoContext } from "@/app/utils/Contexts";

function Ranking({}) {
  const { userInfo } = useContext(UserInfoContext);

  const [viewDate, setViewDate] = useState(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [viewer, setViewer] = useState("day");
  const [isOnlyFriends, setIsOnlyFriends] = useState(false);

  return (
    <div className={`Main`}>
      <div className={styles.Leaderboard}>
        <div className={styles.layer} id={styles.left}>
          <div
            className={`BoxContainer ${styles.boxContainer}`}
            id={styles.RankingsTrendsChart}
          >
            <RankingsTrendsChart
              viewDate={viewDate}
              setViewDate={setViewDate}
              viewer={viewer}
              userInfo={userInfo}
            />
          </div>
          <div
            className={`BoxContainer ${styles.boxContainer}`}
            id={styles.Leaderboard}
          >
            <Leaderboard
              viewDate={viewDate}
              viewer={viewer}
              isOnlyFriends={isOnlyFriends}
            />
          </div>
        </div>
        <div className={styles.layer} id={styles.right}>
          <div
            className={`BoxContainer ${styles.boxContainer}`}
            id={styles.TopLeaderBoard}
          >
            <TopLeaderBoard
              viewer={viewer}
              viewDate={viewDate}
              setViewDate={setViewDate}
              setViewer={setViewer}
              isOnlyFriends={isOnlyFriends}
              setIsOnlyFriends={setIsOnlyFriends}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ranking;
