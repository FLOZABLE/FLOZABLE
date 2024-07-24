"use client";

import PlanTimeline from "../../components/Plans/PlanTimeline/PlanTimeline";
import SmallSubjectsViewer from "../../components/Subjects/SmallSubjectsViewer/SmallSubjectsViewer";
import WelcomeModal from "@/app/components/Modals/WelcomeModal/WelcomeModal";
import styles from "./page.module.css";
import StudyTrendChart from "@/app/components/Charts/StudyTrendChart/StudyTrendChart";
import FriendsActivityViewer from "@/app/components/Friends/FriendsActivityViewer/FriendsActivityViewer";
import FriendsTrendChart from "@/app/components/Charts/FriendsTrendChart";
import { useContext } from "react";
import { ModalsContext, UserInfoContext } from "@/app/utils/Contexts";
import StudyInfo from "@/app/components/Others/StudyInfo/StudyInfo";
import FriendsBar from "@/app/components/Friends/FriendsBar/FriendsBar";

export default function Dashboard() {
  const { setChatModal } = useContext(ModalsContext);

  return (
    <div className={`Main`}>
      <WelcomeModal />
      <div className="title">Dashboard</div>
      <div
        onClick={() => {
          setChatModal((prev) => ({ ...prev, open: !prev.open }));
        }}
      >
        dfd
      </div>
      <div className={styles.Main}>
        <div className={styles.layer}>
          <FriendsBar />
        </div>
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
        <div className={styles.layer}>
          <div className={`${styles.box} BoxContainer`}>
            <FriendsTrendChart />
          </div>
        </div>
      </div>
    </div>
  );
}
