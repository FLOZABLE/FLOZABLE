"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./PlanTimeline.module.css";
import { ResponsiveRadialBar } from "@nivo/radial-bar";
import { Alert } from "@/app/utils/Svg";
import {
  PlansContext,
  SubjectsContext,
  TutorialsContext,
} from "@/app/utils/Contexts";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import { DateTime } from "luxon";
import { subjectIcons } from "@/app/utils/Constant";
import Plan from "../Plan/Plan";

function PlanTimeline({ viewMode, viewDate, mode, maxHeight = "18.75rem" }) {
  const { tutorialBoxRef, tutorialTextRef, tutorial, setTutorial } =
    useContext(TutorialsContext);
  const { subjects } = useContext(SubjectsContext);
  const { plans, setPlanModal } = useContext(PlansContext);

  const [planSeries, setPlanSeries] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  //const searchParams = useSearchParams();
  const addBtnRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!subjects.length || !filteredPlans.length) return;

    const planSeries = [];
    subjects.map((subject, i) => {
      const subjectPlans = filteredPlans.filter(
        (plan) => plan.subject === subject.id
      );
      if (subjectPlans.length) {
        const { id, name } = subject;
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

    if (viewMode === "timeGridDay") {
      if (
        viewDateTime.startOf("day").toMillis() <= plan.start.getTime() &&
        plan.start.getTime() <= viewDateTime.endOf("day").toMillis()
      ) {
        isInRange = true;
      }
    } else if (viewMode === "timeGridWeek") {
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
    setFilteredPlans(plans.filter((plan) => isInViewRange(plan)));
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
      className={`hiddenScroll ${styles.PlanTimeline} ${
        mode === "study" ? styles.studyMode : ""
      }`}
      ref={containerRef}
    >
      {filteredPlans.length ? (
        <div className={styles.chartContainer}>
          <ResponsiveRadialBar
            data={planSeries}
            padding={0.4}
            cornerRadius={2}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            enableRadialGrid={false}
            enableCircularGrid={false}
            radialAxisStart={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
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
            legends={[]}
            valueFormat={(val) => val + "%"}
          />
        </div>
      ) : (
        <div className={styles.radialPlaceholder}>
          All done!
          <br />
          There are no plans
        </div>
      )}
      <div id={styles.addBtnWrapper} ref={addBtnRef}>
        <BlobBtn
          onClick={() => {
            setPlanModal((prev) => ({ ...prev, opened: true }));
            if (tutorial === 1) {
              setTutorial(2);
            }
          }}
          color1={"#fff"}
          color2={"var(--blue2)"}
          id={"tutorial-1"}
        >
          Add a New Plan
        </BlobBtn>
      </div>
      {filteredPlans.length ? (
        <ul
          className={`${styles.plans} hiddenScroll`}
          /* style={{ maxHeight: maxHeight }} */
        >
          {filteredPlans.map((plan, i) => {
            const planSubject = subjects.find((subject) => {
              return subject.id === plan.subject;
            });

            plan.dispStart = DateTime.fromJSDate(plan.start).toLocaleString(
              DateTime.TIME_SIMPLE
            );
            plan.dispEnd = DateTime.fromJSDate(plan.end).toLocaleString(
              DateTime.TIME_SIMPLE
            );

            let icon;
            plan.color = "#fff";
            if (planSubject) {
              plan.color = planSubject.color;
              icon = subjectIcons[planSubject.icon];
            }

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
