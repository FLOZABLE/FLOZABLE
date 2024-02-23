import React, { useEffect, useState } from "react";
import styles from "./PlanTimeline.module.css";
import Chart from 'react-apexcharts';
import parse from "html-react-parser";
import {
  WritePen,
  Book,
  Microscope,
  Article,
  Coding,
  Globe,
  Workout,
  Alert,
} from "../../../utils/svgs";

import CircularCheckBox from "../CircularCheckBox/CircularCheckBox";
import { DateTime } from "luxon";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadialBar, ResponsiveContainer } from "recharts";
import { subjectIcons, warmColorsList } from "../../../constant";
import { Cell } from "recharts";
import { randomIntInRange } from "../../../utils/Tool";
import { ResponsiveRadialBar } from "@nivo/radial-bar";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function PlanTimeline({
  plans,
  viewMode,
  viewDate,
  subjects,
  setPlanModal,
  mode,
  setPlans,
  maxHeight = "200px"
}) {
  const [planSeries, setPlanSeries] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);

  const togglePlan = (plan) => {
    const eventIndex = plans.findIndex((planInfo) => planInfo.id === plan.id);
    if (eventIndex !== -1) {
      const updatedEvents = [...plans];
      updatedEvents[eventIndex] = {
        ...updatedEvents[eventIndex],
        completed: plan.completed ? 0 : 1,
        className: plan.completed ? "" : "completed"
      };
      const planInfo = {
        id: plan.id,
        completed: plan.completed ? 0 : 1,
      };

      delete planInfo.saved;
      fetch(`${serverOrigin}/plan/status-change`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(planInfo),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setPlans(updatedEvents);
            //setPlanModal((prev) => ({...prev, opened: false}));
          }
        })
        .catch((error) => console.error(error));
    }
  };

  useEffect(() => {
    if (!subjects.length || !filteredPlans.length) return;

    const planSeries = [];
    subjects.map((subject, i) => {
      const subjectPlans = filteredPlans.filter(plan => plan.subject === subject.id);
      if (subjectPlans.length) {
        const { id, name } = subject;
        const total = subjectPlans.length;
        const completed = subjectPlans.filter(plan => plan.completed).length;
        const ratio = Math.floor(completed / total * 100);
        const data = [{
          x: name,
          y: ratio,
          axisStartValue: 's'
        }]
        planSeries.push({ id: name, data });
      }
    });
    setPlanSeries(planSeries);
    console.log('plan series', planSeries)
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
        viewDateTime.plus({ days: 1 }).startOf("week").minus({ days: 1 }).toMillis() <= plan.start.getTime() &&
        plan.start.getTime() <= viewDateTime.plus({ days: 1 }).endOf("week").minus({ days: 1 }).toMillis()
      ) {
        isInRange = true;
      }
    } else {
      if (viewDate.getMonth() === plan.start.getMonth()) {
        isInRange = true;
      }
    };
    return isInRange;
  };

  useEffect(() => {
    setFilteredPlans(plans.filter(plan => isInViewRange(plan)));
  }, [plans, viewMode, viewDate, subjects]);

  return (
    <div
      className={`hiddenScroll ${styles.PlanTimeline} ${mode === "study" ? styles.studyMode : ""
        }`}
    >
      {filteredPlans.length ?
        <div className={styles.chartContainer}>
          <ResponsiveRadialBar
            data={planSeries}
            padding={0.4}
            cornerRadius={2}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            enableRadialGrid={false}
            enableCircularGrid={false}
            radialAxisStart={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
            circularAxisOuter={null}
            legends={[]}
            valueFormat={val => val + '%'}
          />
        </div>
        : null
      }
      {filteredPlans.length ?
        <div className={styles.contents}>
          <h4
            onClick={() => {
              setPlanModal((prev) => ({ ...prev, opened: true }));
            }}
          >
            Add a New Plan
          </h4>
          <ul className={`${styles.plans} hiddenScroll`} style={{ maxHeight: maxHeight }}>
            {filteredPlans.map((plan, i) => {
              const planSubject = subjects.find((subject) => {
                return subject.id === plan.subject;
              });

              const dispStart = DateTime.fromJSDate(plan.start).toLocaleString(DateTime.TIME_SIMPLE);
              const dispEnd = DateTime.fromJSDate(plan.end).toLocaleString(DateTime.TIME_SIMPLE);
              let icon;
              let color = "#fff";
              if (planSubject) {
                color = planSubject.color;
                icon = subjectIcons[planSubject.icon];
              };

              if (!icon) {
                icon = (
                  <Alert />
                );
              }
              return (
                <li className={styles.plan} key={i}>
                  <div className={styles.iconWrapper}>
                    <div style={{ color }} className={styles.icon}>{icon}</div>
                    <div
                      className={styles.hoverDisp}
                      onClick={() => {
                        togglePlan(plan);
                      }}
                    >
                      <CircularCheckBox checked={plan.completed} />
                    </div>
                  </div>
                  <div className={styles.content}>
                    <div className={styles.title}>
                      <h2>{plan.title}</h2>
                      <div className={`${styles.line} ${plan.completed ? styles.completed : ''}`}></div>
                    </div>
                    <p>
                      ({dispStart}-{dispEnd})
                    </p>
                    <div className={`${styles.description} customScroll`}>
                      {plan.description ? parse(plan.description) : ''}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        : <div className={styles.noPlans}
        onClick={() => {
          setPlanModal((prev) => ({ ...prev, opened: true }));
        }}
        >
          Add new Plans to view!
        </div>
      }
    </div>
  );
}

export default PlanTimeline;