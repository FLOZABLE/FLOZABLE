import React from "react";
import styles from "./Timeline.module.css";

function Timeline({ refT, dailyTimeline }) {
  const timelineEl = [];
  for (let hour = 0; hour < 24; hour++) {
    timelineEl.push(
      <div className={styles.row} key={hour}>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
      </div>,
    );
  }
  return (
    <div className={styles.TimelineContainer} ref={refT}>
      <div className={styles.rowHeader}>
        <div>0</div>
        <div>10</div>
        <div>20</div>
        <div>30</div>
        <div>40</div>
        <div>50</div>
        <div>60</div>
      </div>
      <div className={styles.colHeader}>
        <div>12AM</div>
        <div>1AM</div>
        <div>2AM</div>
        <div>3AM</div>
        <div>4AM</div>
        <div>5AM</div>
        <div>6AM</div>
        <div>7AM</div>
        <div>8AM</div>
        <div>9AM</div>
        <div>10AM</div>
        <div>11AM</div>
        <div>12PM</div>
        <div>1PM</div>
        <div>2PM</div>
        <div>3PM</div>
        <div>4PM</div>
        <div>5PM</div>
        <div>6PM</div>
        <div>7PM</div>
        <div>8PM</div>
        <div>9PM</div>
        <div>10PM</div>
        <div>11PM</div>
      </div>
      <div className={styles.timelineWrapper}>
        {timelineEl}
        {dailyTimeline}
      </div>
    </div>
  );
}

export default Timeline;
