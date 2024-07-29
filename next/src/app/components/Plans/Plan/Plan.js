import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CircularCheckBox from "../../Buttons/CircularCheckBox/CircularCheckBox";
import styles from "./Plan.module.css";
import { useCallback, useContext, useEffect, useState } from "react";
import { PlansContext } from "@/app/utils/Contexts";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import parse from "html-react-parser";
import { DEFAULT_PLAN } from "@/app/utils/Constant";
import { patchPlanStatus } from "@/Api/plansApi";

export default function Plan({ plan, children }) {
  const { plans, setPlanModal, setPlans } = useContext(PlansContext);

  const [hover, setHover] = useState(false);

  const togglePlan = useCallback(() => {
    (async () => {
      const planIndex = plans.findIndex((planInfo) => planInfo.plan_id === plan.plan_id);
      if (planIndex === -1) return;

      const updatedEvents = [...plans];
      updatedEvents[planIndex] = {
        ...updatedEvents[planIndex],
        completed: plan.completed ? 0 : 1,
        className: plan.completed ? "" : "completed",
      };

      const data = await patchPlanStatus(plan.plan_id, plan.completed);
      if (data.success) {
        setPlans(updatedEvents);
      }
    })();
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
        <div style={{ color: plan.subject_color }} className={styles.icon}>
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
            setPlanModal((prev) => {
              if (prev.plan_id === plan.plan_id) {
                return { ...DEFAULT_PLAN, ...plan, opened: false };
              }
              return { ...DEFAULT_PLAN, ...plan, opened: true };
            });
          }}
        >
          <FontAwesomeIcon icon={faEllipsis} />
        </div>
      </div>
    </li>
  );
}
