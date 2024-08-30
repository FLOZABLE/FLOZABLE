import WelcomeModal from "@/app/components/Modals/WelcomeModal/WelcomeModal";
import styles from "./page.module.css";
import PlansTimeline from "@/app/components/Plans/PlansTimeline/PlansTimeline";
import EventPlanner from "@/app/components/Plans/EventPlanner/EventPlanner";
import Planner from "@/app/components/Plans/Planner/Planner";

export default function Dashboard() {
  return (
    <div className={`Main`}>
      <WelcomeModal />
      <div className={styles.Main}>
        <div className={styles.layer}>
          <div className={`BoxContainer ${styles.box}`} id={styles.calendar}>
            <div className={styles.title}>Calendar</div>
            <Planner
              viewMode={"month"}
              viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </div>
          <div
            className={`${styles.box} BoxContainer`}
            id={styles.planTimeline}
          >
            <PlansTimeline
              viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
              viewMode={"day"}
              mode={"study"}
              maxHeight="calc(100vh - 2.5rem)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
