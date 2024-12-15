"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./PlansTimeline.module.css";
import { PlanModalContext, PlansContext } from "@/app/utils/Contexts";
import { DateTime } from "luxon";
import { DEFAULT_PLAN } from "@/app/utils/Constant";
import Plan from "../Plan/Plan";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import SubjectsLabels from "../../Charts/SubjectsLabels/SubjectsLabels";
import DateSelectorBtn from "../../Buttons/DateSelectorBtn/DateSelectorBtn";
import { useSubjects } from "@/Hooks/subjectsHooks";
import { useTour } from "@reactour/tour";

export default function PlansTimeline({
  viewer,
  viewDate,
  mode,
  setViewDate,
  maxHeight = "50rem",
}) {
  const { subjects } = useSubjects();
  const { planModal, setPlanModal } = useContext(PlanModalContext);
  const { plans, setPlans, setPlansDate } = useContext(PlansContext);

  const { currentStep, setCurrentStep } = useTour();

  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [donePlans, setDonePlans] = useState([]);
  const [todoPlans, setTodoPlans] = useState([]);

  //const searchParams = useSearchParams();
  const addBtnRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setPlansDate(new Date(new Date(viewDate).setHours(0, 0, 0, 0)));
  }, [viewDate]);

  const isInViewRange = (plan) => {
    const viewDateTime = DateTime.fromJSDate(viewDate);
    let isInRange = false;

    if (viewer === "day") {
      if (
        viewDateTime.startOf("day").toMillis() <= plan.start.getTime() &&
        plan.start.getTime() <= viewDateTime.endOf("day").toMillis()
      ) {
        isInRange = true;
      }
    } else if (viewer === "week") {
      if (
        viewDateTime
          .plus({ days: 1 })
          .startOf("week")
          .minus({ days: 1 })
          .toMillis() <= plan.start.getTime() &&
        plan.start.getTime() <=
          viewDateTime
            .plus({ days: 1 })
            .endOf("week")
            .minus({ days: 1 })
            .toMillis()
      ) {
        isInRange = true;
      }
    } else {
      if (viewDate.getMonth() === plan.start.getMonth()) {
        isInRange = true;
      }
    }
    return isInRange;
  };

  useEffect(() => {
    if (!viewer || !viewDate || !subjects) return;
    const filteredPlans = plans.filter((plan) => isInViewRange(plan));
    const donePlans = [];
    const todoPlans = [];
    filteredPlans.map((plan) => {
      if (plan.completed) {
        donePlans.push(plan);
      } else {
        todoPlans.push(plan);
      }
    });

    setDonePlans(donePlans);
    setTodoPlans(todoPlans);
  }, [plans, viewer, viewDate, subjects]);

  return (
    <div
      className={`hiddenScroll ${styles.PlansTimeline} ${
        mode === "study" ? styles.studyMode : ""
      }`}
      ref={containerRef}
      style={{ maxHeight }}
    >
      <div className={styles.header}>
        <div className={styles.layer}>
          <h2>Tasks</h2>
          <div className={styles.DateSelectorBtn}>
            <DateSelectorBtn
              viewDate={viewDate}
              setViewDate={setViewDate}
              viewer={viewer}
              style={{ color: "var(--gray2)" }}
            />
          </div>
          <div className={styles.buttons}>
            <div
              id={styles.addPlan}
              className=""
              data-tutorial={0}
              onClick={() => {
                if (currentStep === 0) {
                  setTimeout(() => {
                    setCurrentStep(1);
                  }, 300);
                }

                if (planModal.plan_id === "0000000000") {
                  return;
                }
                const subject = subjects?.[0];
                const subject_id = subject?.subject_id;
                const color = subject ? subject.color : "#000000";

                const newPlan = {
                  ...DEFAULT_PLAN,
                  plan_id: "0000000000",
                  opened: true,
                  subject_id,
                };
                setPlanModal(newPlan);
                newPlan.backgroundColor = color;
                newPlan.borderColor = color;
                setPlans((prev) => [...prev, newPlan]);
              }}
              ref={addBtnRef}
            >
              <FontAwesomeIcon icon={faCirclePlus} />
            </div>
          </div>
        </div>
        <div className={styles.layer} id={styles.notes}>
          <p>Notes: We need to get focused ASAP!</p>
        </div>
      </div>
      <div className={styles.subjects}>
        <SubjectsLabels
          subjects={subjects}
          filteredSubjects={filteredSubjects}
          setFilteredSubjects={setFilteredSubjects}
        />
      </div>
      <div className={styles.plansContainer} id={styles.donePlans}>
        <p className={styles.type}>Done</p>
        <div className={styles.plans}>
          {donePlans.map((plan, i) => {
            plan.dispStart = DateTime.fromJSDate(plan.start).toLocaleString(
              DateTime.TIME_SIMPLE
            );
            plan.dispEnd = DateTime.fromJSDate(plan.end).toLocaleString(
              DateTime.TIME_SIMPLE
            );

            if (filteredSubjects.includes(plan.subject_id)) {
              return null;
            }

            return <Plan plan={plan} key={i} />;
          })}
        </div>
      </div>
      <div className={styles.plansContainer} id={styles.todoPlans}>
        <p className={styles.type}>To-Do</p>
        <div className={styles.plans}>
          {todoPlans.map((plan, i) => {
            plan.dispStart = DateTime.fromJSDate(plan.start).toLocaleString(
              DateTime.TIME_SIMPLE
            );
            plan.dispEnd = DateTime.fromJSDate(plan.end).toLocaleString(
              DateTime.TIME_SIMPLE
            );

            if (filteredSubjects.includes(plan.subject_id)) {
              return null;
            }

            return <Plan plan={plan} key={i} />;
          })}
        </div>
      </div>
    </div>
  );
}
