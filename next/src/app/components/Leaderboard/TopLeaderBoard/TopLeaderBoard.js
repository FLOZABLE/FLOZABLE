import { useRankings } from "@/Hooks/rankingsHooks";
import SimpleToggleBtn from "../../Buttons/SimpleToggleBtn/SimpleToggleBtn";
import UserContainer from "../../Users/UserContainer/UserContainer";
import styles from "./TopLeaderBoard.module.css";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import DateSelectorBtn from "../../Buttons/DateSelectorBtn/DateSelectorBtn";
import { useRouter } from "next/navigation";
import { UserInfoContext } from "@/app/utils/Contexts";
import { useContext } from "react";

function RankingContainer({ title, viewDate, viewer, isOnlyFriends }) {
  const { rankingsData, rankingsIsLoading } = useRankings(viewer, viewDate);

  const { userInfo } = useContext(UserInfoContext);

  const router = useRouter();

  if (rankingsIsLoading || !rankingsData?.success) {
    return <CircularLoading />;
  }

  let slicedRanking = [];

  if (userInfo && isOnlyFriends) {
    slicedRanking = rankingsData.data.rankings
      .filter(
        (ranking) =>
          userInfo.friends.includes(ranking.user_id) ||
          ranking.user_id === userInfo.user_id
      )
      .slice(0, 3);
  } else {
    slicedRanking = rankingsData.data.rankings.slice(0, 3);
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
            <UserContainer
              userInfo={user}
              onClick={() => {
                router.push(`/dashboard/user/${user.user_id}`);
              }}
            />
            <div className={styles.studyTime}>
              {(user.study_time / (60 * 60)).toFixed(2)}hr
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ViewOption({ name, value, viewer, setViewer }) {
  return (
    <div
      className={`${styles.viewOption} ${
        value === viewer ? styles.active : null
      } `}
      onClick={() => {
        setViewer(value);
      }}
    >
      {name}
    </div>
  );
}

export default function TopLeaderBoard({
  isOnlyFriends,
  setIsOnlyFriends,
  viewDate,
  setViewDate,
  viewer,
  setViewer,
}) {
  return (
    <div className={`Box ${styles.TopLeaderBoard}`}>
      <div className={`header ${styles.header}`}>
        <p>Leaderboard</p>
        <div className={styles.DateSelectorBtn}>
          <DateSelectorBtn
            viewDate={viewDate}
            setViewDate={setViewDate}
            viewer={viewer}
          />
        </div>
      </div>
      <div className={styles.options}>
        <div className={styles.viewOptions}>
          <ViewOption
            name={"Day"}
            value={"day"}
            viewer={viewer}
            setViewer={setViewer}
          />
          <div className={styles.divider}></div>
          <ViewOption
            name={"Week"}
            value={"week"}
            viewer={viewer}
            setViewer={setViewer}
          />
          <div className={styles.divider}></div>
          <ViewOption
            name={"Month"}
            value={"month"}
            viewer={viewer}
            setViewer={setViewer}
          />
        </div>
        <div
          className={`${styles.friendsBtn} ${
            isOnlyFriends ? `${styles.enabled}` : null
          }`}
        >
          <SimpleToggleBtn
            id={"onlyFriend"}
            checked={isOnlyFriends}
            onToggle={() => {
              setIsOnlyFriends((prev) => !prev);
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
