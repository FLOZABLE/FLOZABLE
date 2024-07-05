"use client";

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
import StudyInfo from "@/app/components/Others/StudyInfo/StudyInfo";

export default function Dashboard() {
  const { userInfo } = useContext(UserInfoContext);

  const { data: friendsRankingData } = useQuery({
    queryKey: [`friendTrend`],
    queryFn: () => getFriendsRanking(),
    enabled: !!userInfo,
  });

  return (
    <div className={`Main`}>
      <WelcomeModal />
      <div className="title">Dashboard</div>
      <div className={styles.Main}>
        <div className={styles.layer}>
          <div>
            <div className={`${styles.box} BoxContainer`} id={styles.studyInfo}>
              <StudyInfo />
            </div>
            <div className={`${styles.box} BoxContainer`}>
              <StudyTrendChart viewDate={new Date()} />
            </div>
          </div>
          <div
            className={`${styles.box} BoxContainer`}
            id={styles.planTimeline}
          >
            <PlanTimeline
              viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
              viewMode={"timeGridDay"}
              mode={"study"}
              maxHeight="calc(100vh - 2.5rem)"
            />
          </div>
        </div>
        <div className={styles.layer}>
          <div className={`${styles.box} BoxContainer`}>
            <FriendsActivityViewer />
          </div>
          <div className={`${styles.box} BoxContainer`}>
            <SmallSubjectsViewer />
          </div>
        </div>
        {friendsRankingData?.success ? (
          <div className={styles.layer}>
            <div className={`${styles.box} BoxContainer`}>
              <FriendsTrendChart friendsTrends={friendsRankingData.dayTrend} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
