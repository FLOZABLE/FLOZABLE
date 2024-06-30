"use client";

import FriendsRankingViewer from "../../components/Friends/FriendsRankingViewer/FriendsRankingViewer";
import RecommendedFriendsViewer from "../../components/Friends/RecommendedFriendsViewer/RecommendedFriendsViewer";
import PlanTimeline from "../../components/Plans/PlanTimeline/PlanTimeline";
import SmallSubjectsViewer from "../../components/Subjects/SmallSubjectsViewer/SmallSubjectsViewer";
import WelcomeModal from "@/app/components/Modals/WelcomeModal/WelcomeModal";
import styles from "./page.module.css";
import StudyTrendChart from "@/app/components/Charts/StudyTrendChart/StudyTrendChart";
import FriendsActivityViewer from "@/app/components/Friends/FriendsActivityViewer/FriendsActivityViewer";
import FriendsTrendChart from "@/app/components/Charts/FriendsTrendChart";
import { useQuery } from "@tanstack/react-query";
import { getFriendsRanking } from "@/Api/friendsApi";
import { useContext } from "react";
import { UserInfoContext } from "@/app/utils/Contexts";

export default function Dashboard() {
  const { userInfo } = useContext(UserInfoContext);

  const { data: friendsRankingData, isLoading } = useQuery({
    queryKey: [`friendTrend`],
    queryFn: () => getFriendsRanking(),
    enabled: !!userInfo,
  });
  console.log(friendsRankingData);
  return (
    <div className={`Main`}>
      <WelcomeModal />
      {/* <div className="title">Dashboard</div> */}
      <div className={styles.Main}>
        <div className={styles.layer}>
          <div className={styles.box}>
            <StudyTrendChart viewDate={new Date()} />
          </div>
          <div className={styles.box} id={styles.planTimeline}>
            <PlanTimeline
              viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
              viewMode={"timeGridDay"}
              mode={"study"}
            />
          </div>
        </div>
        <div className={styles.layer}>
          <div className={styles.box}>
            <FriendsActivityViewer />
          </div>
          <div className={styles.box}>
            <SmallSubjectsViewer />
          </div>
        </div>
        <div className={styles.layer}>
          <div className={styles.box}>
            {friendsRankingData?.success ? (
              <FriendsTrendChart friendsTrends={friendsRankingData.dayTrend} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
