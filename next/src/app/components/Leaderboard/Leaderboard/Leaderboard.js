import { useRankings } from "@/Hooks/rankingsHooks";
import styles from "./Leaderboard.module.css";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import UserContainer from "../../Users/UserContainer/UserContainer";
import { UserInfoContext } from "@/app/utils/Contexts";

const PAGE_LENGTH = 30;

export default function Leaderboard({ viewer, viewDate, isOnlyFriends }) {
  const { userInfo } = useContext(UserInfoContext);

  const { rankingsData, rankingsIsLoading } = useRankings(viewer, viewDate);

  const [page, setPage] = useState(1);
  const [rankings, setRankings] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(document.location.search);
    const searchPage = parseInt(searchParams.get("page"));
    if (!searchPage) {
      router.push("?page=1", { scroll: false });
      setPage(1);
    } else {
      setPage(searchPage);
    }
  }, []);

  useEffect(() => {
    router.replace(`?page=${page}`, { scroll: false });
  }, [page]);

  useEffect(() => {
    if (!rankingsData?.success) return;

    if (!isOnlyFriends || !userInfo) {
      setRankings(rankingsData.data.rankings);
    } else {
      setRankings(
        rankingsData.data.rankings.filter((ranking) =>
          userInfo.friends.includes(ranking.user_id)
        )
      );
    }
    setPage(1);
  }, [rankingsData, isOnlyFriends, userInfo]);

  return (
    <div className={`Box ${styles.Leaderboard}`}>
      <div className="header">Leaderboard</div>
      <div className={styles.rankings}>
        {rankingsIsLoading ? (
          <CircularLoading />
        ) : !rankingsData?.success ? null : (
          rankings
            .slice((page - 1) * PAGE_LENGTH, page * PAGE_LENGTH)
            .map((ranking, i) => {
              return (
                <div className={styles.userContainer} key={i}>
                  <div className={styles.rank}>{ranking.rank}</div>
                  <div className={styles.userInfo}>
                    <UserContainer
                      userInfo={ranking}
                      maxNameWidht="11rem"
                      onClick={() => {
                        router.push(`/dashboard/user/${ranking.user_id}`);
                      }}
                    />
                  </div>
                  <div className={styles.studyTime}>
                    {(ranking.study_time / (60 * 60)).toFixed(2)}hr
                  </div>
                </div>
              );
            })
        )}
      </div>
      <div className={styles.pageButtons}>
        <div
          className={styles.pageButton}
          onClick={() => {
            if (page > 1) {
              setPage(page - 1);
            }
          }}
        >
          {"<"}
        </div>
        <p>{page}</p>
        <div
          className={styles.pageButton}
          onClick={() => {
            if (page * PAGE_LENGTH < rankings.length) {
              setPage(page + 1);
            }
          }}
        >
          {">"}
        </div>
      </div>
    </div>
  );
}
