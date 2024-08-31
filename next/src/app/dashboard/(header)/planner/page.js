import PlansTimeline from "@/app/components/Plans/PlansTimeline/PlansTimeline";
import styles from "./page.module.css";
import { default as EventPlanner } from "@/app/components/Plans/Planner/Planner";

function Planner({}) {
  return (
    <div className={`Main`}>
      <div className={styles.Planner}>
        <div className={styles.layer}>
          <div className={`BoxContainer ${styles.box}`} id={styles.calendar}>
            <div className={styles.title}>Calendar</div>
            <EventPlanner />
          </div>
          <div
            className={`${styles.box} BoxContainer`}
            id={styles.planTimeline}
          >
            <PlansTimeline
              viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
              viewer={"day"}
              mode={"study"}
              maxHeight="calc(100vh - 2.5rem)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Planner;
