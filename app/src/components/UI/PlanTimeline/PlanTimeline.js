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
import RadialBarChart from "../RadialBarChart";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function PlanTimeline({
  plans,
  viewMode,
  viewDate,
  subjects,
  setIsAddPlanModal,
  mode,
  setPlans,
}) {
  const [plansEl, setPlansEl] = useState([]);
  const [isPlan, setIsPlan] = useState(false);
  const [planSeries, setPlanSeries] = useState([]);
  const [selected, setSelected] = useState(-2);

  const togglePlan = (plan) => {
    const eventIndex = plans.findIndex((planInfo) => planInfo.id === plan.id);
    if (eventIndex !== -1) {
      const updatedEvents = [...plans];
      updatedEvents[eventIndex] = {
        ...updatedEvents[eventIndex],
        completed: plan.completed ? 0 : 1,
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
            setIsAddPlanModal(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  useEffect(() => {
    if (!subjects.length || !plans.length) return;

    const planSeries = [];
    subjects.map(subject => {
      const subjectPlans = plans.filter(plan => plan.subject === subject.id && isInViewRange(plan));
      if (subjectPlans.length) {
        const {id, icon, color, name} = subject;
        const total = subjectPlans.length;
        const completed = subjectPlans.filter(plan => plan.completed).length;
        const val =  Math.floor(completed / total * 100);
        planSeries.push({id, icon, color, name, val, total, completed});
      }
    });
    setPlanSeries(planSeries);
  }, [subjects, plans, plansEl]);

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
        viewDateTime.startOf("week").toMillis() <= plan.start.getTime() &&
        plan.start.getTime() <= viewDateTime.endOf("week").toMillis()
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
    setIsPlan(false);
    setPlansEl(
      plans.map((plan, i) => {
        const planSubject = subjects.find((subject) => {
          return subject.id === plan.subject;
        });
        const isInRange = isInViewRange(plan);

        if (isInRange) {
          setIsPlan(true);
          const dispStart = `${plan.start.getHours() % 12}:${plan.start
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
          const dispEnd = `${plan.end.getHours() % 12}:${plan.end
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
          let icon;
          let subjectBg = "#fff";
          if (planSubject) {
            subjectBg = planSubject.color;
            if (planSubject.icon === "WritePen") {
              icon = (
                <WritePen
                  width={"40px"}
                  height={"40px"}
                  fill={subjectBg}
                  opt1={subjectBg}
                />
              );
            } else if (planSubject.icon === "Book") {
              icon = (
                <Book
                  width={"40px"}
                  height={"40px"}
                  fill={subjectBg}
                  opt1={subjectBg}
                />
              );
            } else if (planSubject.icon === "Microscope") {
              icon = (
                <Microscope
                  width={"40px"}
                  height={"40px"}
                  fill={subjectBg}
                  opt1={subjectBg}
                />
              );
            } else if (planSubject.icon === "Article") {
              icon = (
                <Article
                  width={"40px"}
                  height={"40px"}
                  fill={subjectBg}
                  opt1={subjectBg}
                />
              );
            } else if (planSubject.icon === "Coding") {
              icon = (
                <Coding
                  width={"40px"}
                  height={"40px"}
                  fill={subjectBg}
                  opt1={subjectBg}
                />
              );
            } else if (planSubject.icon === "Globe") {
              icon = (
                <Globe
                  width={"40px"}
                  height={"40px"}
                  fill={subjectBg}
                  opt1={subjectBg}
                />
              );
            } else if (planSubject.icon === "Workout") {
              icon = (
                <Workout
                  width={"40px"}
                  height={"40px"}
                  fill={subjectBg}
                  opt1={subjectBg}
                />
              );
            } else {
              icon = (
                <Alert
                  width={"40px"}
                  height={"40px"}
                  fill={subjectBg}
                  opt1={subjectBg}
                />
              );
            }
          } else {
            icon = (
              <Alert
                width={"40px"}
                height={"40px"}
                fill={"#000"}
                opt1={"#000"}
              />
            );
          }
          return (
            <li className={styles.plan} key={i}>
              <div className={styles.iconWrapper}>
                <div className={styles.icon}>{icon}</div>
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
                  <p>
                    ({dispStart}-{dispEnd})
                  </p>
                </div>
                <div className={`${styles.description} customScroll`}>
                  {plan.description ? parse(plan.description) : ''}
                </div>
              </div>
            </li>
          );
        }
      }),
    );
  }, [plans, viewMode, viewDate, subjects]);

  return (
    <div
      className={`${isPlan ? styles.noPlan : ""} ${styles.PlanTimeline} ${mode === "study" ? styles.studyMode : ""
        }`}
    >
      <RadialBarChart series={planSeries} selected={selected} setSelected={setSelected} />
      <h4
        onClick={() => {
          setIsAddPlanModal(true);
        }}
      >
        Add a New Plan
      </h4>
      <ul className={`${styles.plans} hiddenScroll`}>
        {isPlan ? (
          plansEl
        ) : (
          <div className={styles.noPlanText} key={10}>
            <h3>You don't have any plans!</h3>
          </div>
        )}
      </ul>
    </div>
  );
}

export default PlanTimeline;
