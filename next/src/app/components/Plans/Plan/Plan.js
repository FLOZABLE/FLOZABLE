import styles from "./Plan.module.css";
import { useCallback, useContext } from "react";
import { PlansContext } from "@/app/utils/Contexts";
import parse from "html-react-parser";
import { DEFAULT_PLAN } from "@/app/utils/Constant";
import { patchPlanStatus } from "@/Api/plansApi";
import BounceCheckBox from "../../Buttons/BounceCheckBox/BounceCheckBox";

export default function Plan({ plan }) {
  const { plans, setPlanModal, setPlans } = useContext(PlansContext);

  const togglePlan = useCallback(async () => {
    try {
      const planIndex = plans.findIndex(
        (planInfo) => planInfo.plan_id === plan.plan_id
      );
      if (planIndex === -1) return;

      const updatedEvents = [...plans];
      updatedEvents[planIndex] = {
        ...updatedEvents[planIndex],
        completed: plan.completed ? 0 : 1,
        className: plan.completed ? "" : "completed",
      };

      const response = await patchPlanStatus(plan.plan_id, plan.completed);
      if (response.success) {
        setPlans(updatedEvents);
      }
    } catch (err) {
      console.log(err);
    }
  }, [plans, plan]);

  return (
    <div
      className={styles.Plan}
      onClick={(e) => {
        e.stopPropagation();
        setPlanModal((prev) => {
          if (prev.plan_id === plan.plan_id && prev.opened) {
            return { ...DEFAULT_PLAN, ...plan, opened: false };
          }
          return { ...DEFAULT_PLAN, ...plan, opened: true };
        });
      }}
    >
      <div className={styles.layer}>
        {plan.type === "google" ? (
          <div className={`overflowDot ${styles.title}`}>{plan.title}</div>
        ) : (
          <BounceCheckBox
            id={plan.plan_id}
            checked={plan.completed}
            onClick={(e) => {
              e.stopPropagation();
              togglePlan();
            }}
          >
            <div className={`overflowDot ${styles.title}`}>{plan.title}</div>
          </BounceCheckBox>
        )}
        <div className={styles.date}>{plan.dispStart}</div>
      </div>
      <div className={styles.layer}>
        <div className={`${styles.description} customScroll`}>
          {plan.description ? parse(plan.description) : ""}
        </div>
      </div>
    </div>
  );
}
