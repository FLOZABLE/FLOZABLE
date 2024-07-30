import PlanTimeline from "../../components/Plans/PlanTimeline/PlanTimeline";
import SmallSubjectsViewer from "../../components/Subjects/SmallSubjectsViewer/SmallSubjectsViewer";
import WelcomeModal from "@/app/components/Modals/WelcomeModal/WelcomeModal";
import styles from "./page.module.css";
import StudyTrendChart from "@/app/components/Charts/StudyTrendChart/StudyTrendChart";
import FriendsActivityViewer from "@/app/components/Friends/FriendsActivityViewer/FriendsActivityViewer";
import FriendsTrendChart from "@/app/components/Charts/FriendsTrendChart";
import EventPlanner from "@/app/components/Plans/EventPlanner/EventPlanner";
import PlansTimeline from "@/app/components/Plans/PlansTimeline/PlansTimeline";

export default function Dashboard() {
  return (
    <div className={`Main`}>
      <WelcomeModal />
      {/* <div className="title">Dashboard</div> */}
      <div className={styles.Main}>
        <div className={styles.layer}>
          <div className={`BoxContainer ${styles.box}`} id={styles.calendar}>
            <div className={styles.title}>Calendar</div>
            <EventPlanner
              viewMode={"dayGridMonth"}
              viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
              controller={false}
            />
          </div>
          <div
            className={`${styles.box} BoxContainer`}
            id={styles.planTimeline}
          >
            <PlansTimeline
              viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
              viewMode={"timeGridDay"}
              mode={"study"}
              maxHeight="calc(100vh - 2.5rem)"
            />
          </div>
        </div>
        {/* <div className={styles.layer}>
          <div>
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
        </div> */}
      </div>
    </div>
  );
}
