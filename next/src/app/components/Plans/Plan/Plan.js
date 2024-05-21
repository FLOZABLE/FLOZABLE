import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CircularCheckBox from "../../Buttons/CircularCheckBox/CircularCheckBox";
import styles from "./Plan.module.css";
import { useCallback, useContext, useEffect, useState } from "react";
import { PlansContext } from "@/app/utils/Contexts";
import config from "@/app/utils/config";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import parse from "html-react-parser";

export default function Plan({ plan, children }) {
  const { plans, setPlanModal, setPlans } = useContext(PlansContext);

  const [hover, setHover] = useState(false);

  const togglePlan = useCallback(() => {
    const eventIndex = plans.findIndex((planInfo) => planInfo.id === plan.id);
    if (eventIndex !== -1) {
      const updatedEvents = [...plans];
      updatedEvents[eventIndex] = {
        ...updatedEvents[eventIndex],
        completed: plan.completed ? 0 : 1,
        className: plan.completed ? "" : "completed",
      };
      const planInfo = {
        id: plan.id,
        completed: plan.completed ? 0 : 1,
      };

      delete planInfo.saved;
      fetch(`${config.server}/plan/status-change`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(planInfo),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setPlans(updatedEvents);
          }
        })
        .catch((error) => console.error(error));
    }
  }, [plans, plan]);
  
  return (
    <li
      className={styles.Plan}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      onClick={() => {
        togglePlan();
      }}
    >
      <div className={styles.iconWrapper}>
        <div style={{ color: plan.color }} className={styles.icon}>
          {children}
        </div>
        <div
          className={styles.hoverDisp}
          onClick={() => {
            togglePlan();
          }}
        >
          <CircularCheckBox checked={plan.completed} hover={hover} />
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.title}>
          <h2>{plan.title}</h2>
          <div
            className={`${styles.line} ${
              plan.completed ? styles.completed : ""
            }`}
          ></div>
        </div>
        <p>
          ({plan.dispStart}-{plan.dispEnd})
        </p>
        <div className={`${styles.description} customScroll`}>
          {plan.description ? parse(plan.description) : ""}
        </div>
        <div
          className={styles.modifyPlan}
          onClick={(e) => {
            e.stopPropagation();
            setPlanModal({ ...plan, opened: true });
          }}
        >
          <FontAwesomeIcon icon={faEllipsis} />
        </div>
      </div>
    </li>
  );
}
