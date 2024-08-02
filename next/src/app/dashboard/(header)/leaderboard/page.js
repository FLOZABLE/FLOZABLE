"use client";

import { useState } from "react";
import styles from "./page.module.css";

import { useRankings } from "@/Hooks/rankingsHooks";
import TopLeaderBoard from "@/app/components/Leaderboard/TopLeaderBoard/TopLeaderBoard";

function Ranking({}) {
  const [viewDate, setViewDate] = useState(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [viewer, setViewer] = useState("day");
  const [isOnlyFriends, setIsOnlyFriends] = useState(false);

  return (
    <div>
      <div className={`Main`}>
        <div className={styles.Leaderboard}>
          <div className={styles.layer}>
            <div
              className={`BoxContainer ${styles.boxContainer}`}
              id={styles.TopLeaderBoard}
            >
              <TopLeaderBoard
                viewer={viewer}
                viewDate={viewDate}
                isOnlyFriends={isOnlyFriends}
                setIsOnlyFriends={setIsOnlyFriends}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ranking;
