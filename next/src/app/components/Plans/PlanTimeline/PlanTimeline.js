"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./PlanTimeline.module.css";
import { ResponsiveRadialBar } from "@nivo/radial-bar";
import { Alert } from "@/app/utils/Svg";
import { PlansContext, SubjectsContext, TutorialsContext } from "@/app/utils/Contexts";
import { DateTime } from "luxon";
import { subjectIcons } from "@/app/utils/Constant";
import Plan from "../Plan/Plan";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";

function PlanTimeline({ viewer, viewDate, mode, maxHeight = "50rem" }) {
  const { tutorialBoxRef, tutorialTextRef, tutorial, setTutorial } =
    useContext(TutorialsContext);
  const { subjects } = useContext(SubjectsContext);
  const { plans, setPlanModal } = useContext(PlansContext);

  const [planSeries, setPlanSeries] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);

  const [isGraph, setIsGraph] = useState(true);
  //const searchParams = useSearchParams();
  const addBtnRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!subjects.length || !filteredPlans.length) return;
    const planSeries = [];
    subjects.map((subject, i) => {
      const subjectPlans = filteredPlans.filter(
        (plan) => plan.subject_id === subject.subject_id
      );
      if (subjectPlans.length) {
        const { name } = subject;
        const total = subjectPlans.length;
        const completed = subjectPlans.filter((plan) => plan.completed).length;
        const ratio = Math.floor((completed / total) * 100);
        const data = [
          {
            x: name,
            y: ratio,
            axisStartValue: "s",
          },
        ];
        planSeries.push({ id: name, data });
      }
    });
    setPlanSeries(planSeries);
  }, [subjects, filteredPlans]);

  const isInViewRange = (plan) => {
    const viewDateTime = DateTime.fromJSDate(viewDate);
    let isInRange = false;

    if (viewer === "timeGridDay") {
      if (
        viewDateTime.startOf("day").toMillis() <= plan.start.getTime() &&
        plan.start.getTime() <= viewDateTime.endOf("day").toMillis()
      ) {
        isInRange = true;
      }
    } else if (viewer === "timeGridWeek") {
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
    setFilteredPlans(filteredPlans);
  }, [plans, viewer, viewDate, subjects]);

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
      className={`hiddenScroll ${styles.PlanTimeline} ${
        mode === "study" ? styles.studyMode : ""
      }`}
      ref={containerRef}
      style={{ maxHeight }}
    >
      <div className={styles.header}>
        <h2 className="jost">Tasks</h2>
        <p className={`jost ${styles.date}`}>
          {viewDate.getMonth() + 1}/{viewDate.getDate()}
        </p>
        <div className={styles.buttons}>
          <div
            id={styles.addPlan}
            onClick={() => {
              setPlanModal((prev) => ({ ...prev, opened: true }));
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
      {filteredPlans.length && isGraph ? (
        <div className={styles.chartContainer}>
          <ResponsiveRadialBar
            data={planSeries}
            padding={0.4}
            cornerRadius={2}
            enableRadialGrid={false}
            enableCircularGrid={false}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fontFamily: "Nunito, sans-serif",
                  },
                },
              },
            }}
            circularAxisOuter={null}
            maxValue={100}
            /* tracksColor="#fff" */
            legends={[
              {
                anchor: "top left",
                direction: "column",
                justify: false,
                translateX: 0,
                translateY: 0,
                itemsSpacing: 6,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: "#999",
                symbolSize: 18,
                symbolShape: "square",
                /* effects: [
                  {
                    on: "hover",
                    style: {
                      itemTextColor: "#000",
                    },
                  },
                ],
                onClick: (val) => {
                  if (val.id) {

                  }
                } */
              },
            ]}
            valueFormat={(val) => val + "%"}
          />
        </div>
      ) : null}
      {!filteredPlans.length ? (
        <div className={styles.radialPlaceholder}>
          All done!
          <br />
          There are no plans
        </div>
      ) : null}
      {filteredPlans.length ? (
        <ul
          className={`${styles.plans} hiddenScroll`}
          /* style={{ maxHeight: maxHeight }} */
        >
          {filteredPlans.map((plan, i) => {
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

            return (
              <Plan plan={plan} key={i}>
                {icon}
              </Plan>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export default PlanTimeline;
