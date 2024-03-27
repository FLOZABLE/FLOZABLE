import StudyTrendChart from "@/Components/Charts/StudyTrendChart";
import styles from "./page.module.css";
import SmallSubjectsViewer from "@/Components/Subjects/SmallSubjectsViewer/SmallSubjectsViewer";
import { IconStatsChart } from "@/utils/Svg";
import FriendsRankingViewer from "@/Components/Friends/FriendsRankingViewer/FriendsRankingViewer";
import RecommendedFriendsViewer from "@/Components/Friends/RecommendedFriendsViewer/RecommendedFriendsViewer";
import PlanTimeline from "@/Components/Plans/PlanTimeline/PlanTimeline";

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
