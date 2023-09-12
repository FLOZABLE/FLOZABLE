import React, { useEffect } from "react";
import styles from "./PlanTimeline.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";

function PlanTimeline(props) {
  const [plans, start, end] = props;
  const [plansEl, setPlansEl] = useEffect([]);

  /* useEffect(() => {
    setPlansEl(plans.map((plan, i) => {
      if (start < plan.start.getTime() && plan.start.getTime() < end) {
        return (
          <li className={styles.plan} key={i}>
            
          </li>
        );
      };
    }));
  }, [plans]); */
  return (
    <div className={styles.PlanTimeline}>
      <ul>
        <li className={styles.plans}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faBook} />
          </div>
        </li>
      </ul>
    </div>
  );
};

export default PlanTimeline;