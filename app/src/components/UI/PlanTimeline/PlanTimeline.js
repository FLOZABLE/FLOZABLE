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
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadialBar, ResponsiveContainer, RadialBarChart } from "recharts";
import { RadarChart } from "recharts";
import { warmColorsList } from "../../../constant";
import { Cell } from "recharts";
import { randomIntInRange } from "../../../utils/Tool";

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
    if (!subjects.length || !plans.length) return;

    const planSeries = [];
    subjects.map((subject, i) => {
      const subjectPlans = plans.filter(plan => plan.subject === subject.id && isInViewRange(plan));
      if (subjectPlans.length) {
        const { id, icon, name } = subject;
        const total = subjectPlans.length;
        const completed = subjectPlans.filter(plan => plan.completed).length;
        const val = Math.floor(completed / total * 100);
        console.log(val, randomIntInRange(0, 2), Math.floor(completed / total))
        const fill = warmColorsList[i % (warmColorsList.length)];
        const pv = 5000;
        planSeries.push({ id, fill, name, val, total, completed, pv });
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
    setIsPlan(false);
    setPlansEl(
      plans.map((plan, i) => {
        const planSubject = subjects.find((subject) => {
          return subject.id === plan.subject;
        });
        const isInRange = isInViewRange(plan);

        if (isInRange) {
          setIsPlan(true);
          const dispStart = DateTime.fromJSDate(plan.start).toLocaleString(DateTime.TIME_SIMPLE);
          const dispEnd = DateTime.fromJSDate(plan.end).toLocaleString(DateTime.TIME_SIMPLE);
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
        }
      }),
    );
  }, [plans, viewMode, viewDate, subjects]);

  const data = [
    {
      name: '18-24',
      uv: 31.47,
      pv: 2400,
      fill: '#8884d8',
    },
    {
      name: '25-29',
      uv: 26.69,
      pv: 4567,
      fill: '#83a6ed',
    },
    {
      name: '30-34',
      uv: 15.69,
      pv: 1398,
      fill: '#8dd1e1',
    },
    {
      name: '35-39',
      uv: 8.22,
      pv: 9800,
      fill: '#82ca9d',
    },
    {
      name: '40-49',
      uv: 8.63,
      pv: 3908,
      fill: '#a4de6c',
    },
    {
      name: '50+',
      uv: 2.63,
      pv: 4800,
      fill: '#d0ed57',
    },
    {
      name: 'unknow',
      uv: 6.67,
      pv: 4800,
      fill: '#ffc658',
    },
  ];
  return (
    <div
      className={`${isPlan ? styles.noPlan : ""} ${styles.PlanTimeline} ${mode === "study" ? styles.studyMode : ""
        }`}
    >
      {/* <RadialBarChart series={planSeries} selected={selected} setSelected={setSelected} /> */}
      <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={10} data={planSeries}>
          <RadialBar
            label={{ position: 'insideStart', fill: '#fff' }}
            background
            clockWise
            dataKey="val"
            isAnimationActive={true}
            animationDuration={3000}
          >
          </RadialBar>
        </RadialBarChart>
      </ResponsiveContainer>
      </div>
      <h4
        onClick={() => {
          setPlanModal((prev) => ({ ...prev, opened: true }));
        }}
      >
        Add a New Plan
      </h4>
      <ul className={`${styles.plans} hiddenScroll`} style={{maxHeight: maxHeight}}>
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
