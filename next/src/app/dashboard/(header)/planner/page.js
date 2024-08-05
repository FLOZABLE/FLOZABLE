import PlansTimeline from "@/app/components/Plans/PlansTimeline/PlansTimeline";
import styles from "./page.module.css";
import EventPlanner from "@/app/components/Plans/EventPlanner/EventPlanner";

function Planner({}) {
  return (
    <div className={`Main`}>
      <div className={styles.Planner}>
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
      </div>
    </div>
  );
}

export default Planner;
