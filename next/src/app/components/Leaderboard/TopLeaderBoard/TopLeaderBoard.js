import { useRankings } from "@/Hooks/rankingsHooks";
import SimpleToggleBtn from "../../Buttons/SimpleToggleBtn/SimpleToggleBtn";
import UserContainer from "../../Users/UserContainer/UserContainer";
import styles from "./TopLeaderBoard.module.css";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import { useAccount } from "@/Hooks/accountHooks";

function RankingContainer({ title, viewDate, viewer, isOnlyFriends }) {
  const { useRankingsData, useRankingsIsLoading } = useRankings(
    viewer,
    viewDate
  );

  const { userInfo } = useAccount();

  if (useRankingsIsLoading || !useRankingsData?.success) {
    return <CircularLoading />;
  }

  let slicedRanking = [];

  if (userInfo && isOnlyFriends) {
    slicedRanking = useRankingsData.rankings
      .filter((ranking) => userInfo.friends.includes(ranking.user_id))
      .slice(0, 3);
  } else {
    slicedRanking = useRankingsData.rankings.slice(0, 3);
  }
  return (
    <div className={styles.RankingContainer}>
      <div className={styles.title}>{title}</div>
      {slicedRanking.map((user, i) => {
        return (
          <div
            className={styles.userContainer}
            key={i}
            style={{ zIndex: slicedRanking.length - i }}
          >
            <UserContainer userInfo={user} />
            <div className={styles.studyTime}>
              {(user.study_time / (60 * 60)).toFixed(2)}hr
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TopLeaderBoard({
  isOnlyFriends,
  setIsOnlyFriends,
  viewDate,
}) {
  return (
    <div className={`Box ${styles.TopLeaderBoard}`}>
      <div className={`header ${styles.header}`}>Leaderboard</div>
      <div className={styles.options}>
        <div className={styles.viewOptions}>
          <div className={styles.viewOption}>Day</div>
          <div className={styles.divider}></div>
          <div className={styles.viewOption}>Week</div>
          <div className={styles.divider}></div>
          <div className={styles.viewOption}>Month</div>
        </div>
        <div
          className={`${styles.friendsBtn} ${
            isOnlyFriends ? `${styles.enabled}` : null
          }`}
        >
          <SimpleToggleBtn
            checked={isOnlyFriends}
            onToggle={(e) => {
              setIsOnlyFriends(e.target.checked);
            }}
          />
          <p>Friends Only</p>
        </div>
      </div>
      <div className="contents customScroll">
        <RankingContainer
          title={"Today's Top 3"}
          viewDate={viewDate}
          viewer={"day"}
          isOnlyFriends={isOnlyFriends}
        />
        <RankingContainer
          title={"This Week's Top 3"}
          viewDate={viewDate}
          viewer={"week"}
          isOnlyFriends={isOnlyFriends}
        />
        <RankingContainer
          title={"This Month's Top 3"}
          viewDate={viewDate}
          viewer={"month"}
          isOnlyFriends={isOnlyFriends}
        />
      </div>
    </div>
  );
}
