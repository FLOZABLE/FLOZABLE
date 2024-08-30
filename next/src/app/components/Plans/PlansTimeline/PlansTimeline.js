"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./PlansTimeline.module.css";
import { Alert } from "@/app/utils/Svg";
import {
  PlansContext,
  SubjectsContext,
  TutorialsContext,
} from "@/app/utils/Contexts";
import { DateTime } from "luxon";
import { DEFAULT_PLAN, subjectIcons } from "@/app/utils/Constant";
import Plan from "../Plan/Plan";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import SubjectsLabels from "../../Charts/SubjectsLabels/SubjectsLabels";

export default function PlansTimeline({
  viewMode,
  viewDate,
  mode,
  maxHeight = "50rem",
}) {
  const { tutorialBoxRef, tutorialTextRef, tutorial, setTutorial } =
    useContext(TutorialsContext);
  const { subjects } = useContext(SubjectsContext);
  const { plans, setPlans, planModal, setPlanModal } = useContext(PlansContext);

  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [donePlans, setDonePlans] = useState([]);
  const [todoPlans, setTodoPlans] = useState([]);

  //const searchParams = useSearchParams();
  const addBtnRef = useRef(null);
  const containerRef = useRef(null);

  const isInViewRange = (plan) => {
    const viewDateTime = DateTime.fromJSDate(viewDate);
    let isInRange = false;

    if (viewMode === "day") {
      if (
        viewDateTime.startOf("day").toMillis() <= plan.start.getTime() &&
        plan.start.getTime() <= viewDateTime.endOf("day").toMillis()
      ) {
        isInRange = true;
      }
    } else if (viewMode === "week") {
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
    if (!viewMode || !viewDate || !subjects) return;
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
  }, [plans, viewMode, viewDate, subjects]);

  useEffect(() => {
    if (tutorial === 1) {
      containerRef.current.scroll({
        top: 200000,
        behavior: "smooth",
      });
      setTimeout(() => {
        const { width, top, left, height } =
          addBtnRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left - 20 + "px";
        tutorialBoxRef.current.style.top = top - 18 + "px";
        tutorialBoxRef.current.style.width = width + 40 + "px";
        tutorialBoxRef.current.style.height = height + 40 + "px";

        tutorialTextRef.current.textContent =
          "First, add an event to your planner!";
        tutorialTextRef.current.style.left = left - 15 + "px";
        tutorialTextRef.current.style.top = top + 80 + "px";
      }, 1000);
    }
  }, [tutorial]);

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
          <p className={styles.date}>
            {viewDate.getMonth() + 1}/{viewDate.getDate()}
          </p>
          <div className={styles.buttons}>
            <div
              id={styles.addPlan}
              onClick={() => {
                if (planModal.plan_id === "0000000000") {
                  return;
                }
                const subject_id = subjects?.[0].subject_id;

                const newPlan = {
                  ...DEFAULT_PLAN,
                  plan_id: "0000000000",
                  opened: true,
                  subject_id,
                };
                setPlanModal(newPlan);
                setTimeout(() => {
                  setPlans((prev) => [...prev, newPlan]);
                }, 50);
                if (tutorial === 1) {
                  setTutorial(2);
                }
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

            let icon = subjectIcons[plan.icon];

            if (!icon) {
              icon = <Alert />;
            }

            if (filteredSubjects.includes(plan.subject_id)) {
              return null;
            }

            return (
              <Plan plan={plan} key={i}>
                {icon}
              </Plan>
            );
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

            let icon = subjectIcons[plan.icon];

            if (!icon) {
              icon = <Alert />;
            }

            if (filteredSubjects.includes(plan.subject_id)) {
              return null;
            }

            return (
              <Plan plan={plan} key={i}>
                {icon}
              </Plan>
            );
          })}
        </div>
      </div>
    </div>
  );
}
