import StudyTrendChart from "../components/Charts/StudyTrendChart";
import FriendsRankingViewer from "../components/Friends/FriendsRankingViewer/FriendsRankingViewer";
import RecommendedFriendsViewer from "../components/Friends/RecommendedFriendsViewer/RecommendedFriendsViewer";
import PlanTimeline from "../components/Plans/PlanTimeline/PlanTimeline";
import SmallSubjectsViewer from "../components/Subjects/SmallSubjectsViewer/SmallSubjectsViewer";
import { IconStatsChart } from "../utils/Svg";
import styles from "./page.module.css";

export default function Dashboard() {

  return (
    <div className={`Main`}>
      <div className="title">
        Dashboard
      </div>
      <div className={styles.Main}>
        <div className={styles.boxesWrapper}>
          <div className={styles.boxesContainer} >
            <div className={styles.box} id={styles.subjectsTrend}>
              <StudyTrendChart
                viewDate={new Date()}
              />
            </div>
            <div className={styles.smallBoxesWrapper}  >
              <div className={styles.box}>
                <SmallSubjectsViewer
                />
              </div>
              <div className={styles.box} id={styles.rankingContainer}>
                <div>
                  <div className={styles.title}>
                    <h3>Friend Ranking</h3>
                    <i>
                      <IconStatsChart />
                    </i>
                  </div>
                  <div className={styles.friendsRankingWrapper}>
                    <FriendsRankingViewer
                    />
                  </div>
                </div>
              </div>
              <div className={styles.box} id={styles.recommendedFriends}>
                <RecommendedFriendsViewer />
              </div>
            </div>
          </div>
          <div className={styles.boxesContainer}>
            <div className={styles.box} id={styles.planTimeline}>
              <PlanTimeline
                viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
                viewMode={"timeGridDay"}
                mode={"study"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
