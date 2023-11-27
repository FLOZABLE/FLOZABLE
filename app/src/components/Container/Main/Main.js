import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PieChart from "../../UI/PieChart";
import ChartDataLabel from "chartjs-plugin-datalabels";
import { colorsList } from "../../../constant";
import styles from "./Main.module.css";
import parse from "html-react-parser";
import { plugins } from "chart.js";
import Draggable, { DraggableCore } from "react-draggable";
import { DateTime } from "luxon";
import { Quotes } from "../../../utils/Quotes.js";
import PlanTimeline from "../../UI/PlanTimeline/PlanTimeline.js";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Main({
  isSidebarOpen,
  isSidebarHovered,
  subjects,
  plans,
  setIsAddPlanModal,
  setPlans,
}) {
  const subjectRef = useRef(null);
  const hiMsgRef = useRef(null);
  const recentActivityRef = useRef(null);
  const plannerRef = useRef(null);
  const memoRef = useRef(null);
  const mainRef = useRef(null);

  const [yesterdayTotal, setYesterdayTotal] = useState("");
  const [weeklyAverage, setWeeklyAverage] = useState(""); // compare yesterday study total to montly percentage
  const [quoteMsg, setQuoteMsg] = useState("");

  useEffect(() => {
    setQuoteMsg(Quotes[Math.floor(Math.random() * Quotes.length)]);
  }, []);

  useEffect(() => {
    if (!!!subjects.daily) {
      return;
    }
    if (subjects.daily.groupedTotal.length > 1) {
      let yesterdaySeconds =
        subjects.daily.groupedTotal[subjects.daily.groupedTotal.length - 2];
      let yesterdayMinutes = Math.floor(yesterdaySeconds / 60);
      let yesterdayHours = Math.floor(yesterdayMinutes / 60);
      if (yesterdayHours > 0) {
        setYesterdayTotal(
          "You studied for " +
          yesterdayHours +
          " hours and " +
          (yesterdayMinutes % 60) +
          " minutes yesterday!",
        );
      } else {
        if (yesterdayMinutes > 5) {
          setYesterdayTotal(
            "You studied for " + yesterdayMinutes + " minutes yesterday!",
          );
        } else {
          setYesterdayTotal(
            "You studied for " + yesterdayMinutes + " minutes yesterday",
          );
        }
      }

      let weekTotal =
        subjects.weekly.groupedTotal[subjects.weekly.groupedTotal.length - 1];
      const weekday = DateTime.fromISO(new Date().toISOString()).weekday;
      let weeklySeconds = weekTotal / weekday;
      let weeklyMinutes = Math.floor(weeklySeconds / 60);
      let weeklyHours = Math.floor(weeklyMinutes / 60);
      if (weeklyHours > 0) {
        setWeeklyAverage(
          "Your daily average is " +
          weeklyHours +
          " hours and " +
          (weeklyMinutes % 60) +
          " minutes this week",
        );
      } else {
        setWeeklyAverage(
          "Your daily average is " + weeklyMinutes + " minutes this week",
        );
      }
    } else {
      setYesterdayTotal("Welcome to FLOZABLE!"); //their first time day at flozable
    }
  }, [subjects]);

  let subjectActivity = [];
  function sortActivity() {
    for (let i = 0; i < subjects.length; i++) {
      subjects[i].daily.grouped[subjects[i].daily.grouped.length - 1].map(
        ([startUnix, stopUnix]) => {
          subjectActivity.push([startUnix, stopUnix, subjects[i].name]);
        },
      );
    }

    subjectActivity.sort((a, b) => b[1] - a[1]);
  }
  sortActivity();

  const eventHandler = (e, dragElement, id) => {
    let posX = dragElement.x;
    let posY = dragElement.y;
    localStorage.setItem(id, JSON.stringify([posX, posY]));
    setPositions((prevPositions) => ({
      ...prevPositions,
      [id]: { x: posX, y: posY },
    }));
  };

  const [welcomePos, setWelcomePos] = useState();
  const [positions, setPositions] = useState({
    welcome: { x: 0, y: 0 },
    subject: { x: 0, y: 0 },
    planner: { x: 0, y: 0 },
    activity: { x: 0, y: 0 },
    quote: { x: 0, y: 0 },
  });

  const updatePos = (id, pos) => {
    const [x,y] = pos;
    setPositions((prevPositions) => ({
      ...prevPositions,
      [id]: { x: x, y: y },
    }));
  }

  useEffect(() => {
    console.log(mainRef.current);
    if (!mainRef.current) return;
    const width = mainRef.current.offsetWidth;
    const height = mainRef.current.offsetHeight;
    if (localStorage.welcome) {
      updatePos('welcome', JSON.parse(localStorage.welcome))
    } else if (width >= 1760 ){
      updatePos('welcome', [0, 0])
    } else {
      updatePos('welcome', [0, 0])
    }

    if (localStorage.subject) {
      updatePos('subject', JSON.parse(localStorage.subject))
    } else if (width >= 1760 ){
      updatePos('subject', [399,0])
    } else {
      updatePos('subject', [399,0])
    }

    if (localStorage.planner) {
      updatePos('planner', JSON.parse(localStorage.planner))
    } else if (width >= 1760 ){
      updatePos('planner', [779,0])
    } else {
      updatePos('planner', [779,0])
    }

    if (localStorage.activity) {
      updatePos('activity', JSON.parse(localStorage.activity))
    } else if (width >= 1760 ){
      updatePos('activity', [1161,0])
    } else {
      updatePos('activity', [0, 420])
    }

    if (localStorage.quote) {
      updatePos('quote', JSON.parse(localStorage.quote))
    } else if (width >= 2000 ){
      updatePos('quote', [1550, 0])
    } else if (width >= 1760 ){
      updatePos('quote', [790,380])
    } else {
      updatePos('quote', [395, 466])
    }
  }, [mainRef, mainRef.current ? mainRef.current.offsetWidth : null]);

  return (
    <div className={styles.MainContainer}>
      <div className={` Main ${isSidebarOpen || isSidebarHovered ? 'sidebarOpen' : ''}`} ref={mainRef}>
        <Draggable
          position={
            positions.welcome
          }
          onStop={(e, element) => {
            eventHandler(e, element, "welcome");
          }}
          nodeRef={hiMsgRef}
        >
          <div ref={hiMsgRef} className={`${styles.box}`} id={styles.welcome}>
            <div className={styles.inner}>
              <p className={styles.name}>Welcome Back!</p>
              <div className={styles.progress}>
                <p className={styles.report}>
                  {yesterdayTotal}
                  <br />
                  {weeklyAverage}
                </p>

                <div className={styles.btnCenter}>
                  <Link to="/dashboard/study">
                    <button className={styles.toStatsBtn}>Go Study!</button>
                  </Link>
                </div>
              </div>
            </div>
            <img draggable="false" src="./img/collaboration.jpeg" alt="" />
          </div>
        </Draggable>
        <Draggable
          position={
            positions.subject
          }
          onStop={(e, element) => {
            eventHandler(e, element, "subject");
          }}
          nodeRef={subjectRef}
        >
          <div ref={subjectRef} className={`${styles.box} box 2`}>
            <div className={styles.inner}>
              <p className={styles.name}>Subject Usage</p>
              <div className={styles.progress}>
                <PieChart
                  labels={subjects.map((subject) => subject.name)}
                  datasets={[
                    {
                      label: "Seconds",
                      backgroundColor: colorsList,
                      borderColor: colorsList,
                      data: subjects.map(
                        (subject) =>
                          subject.daily.total[subject.daily.total.length - 1],
                      ),
                    },
                  ]}
                  options={{
                    plugins: {
                      datalabels: {
                        color: "#ffffff",
                        font: {
                          size: 32,
                          family: "Arial",
                          weight: 700,
                        },
                        formatter: (value, context, index) => {
                          const { chart, dataIndex } = context;
                          const labels = chart.data.labels;
                          const label = labels[dataIndex];
                          return ``;
                        },
                      },
                    },
                  }}
                  plugins={ChartDataLabel}
                />

                <div className={styles.btnCenter}>
                  <Link to="/dashboard/stats">
                    <button className={styles.toStatsBtn}>View Stats</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Draggable>
        <Draggable
          position={
            positions.planner
          }
          onStop={(e, element) => {
            eventHandler(e, element, "planner");
          }}
          nodeRef={plannerRef}
        >
          <div ref={plannerRef} className={`${styles.box}`} id={styles.planner}>
            <div className={styles.inner}>
              <p className={styles.name}>Planner</p>
              {/* {
                planActivity.map((plan, i) => {
                  const startTime = plan.start;
                  const endTime = plan.end;


                  const date1 = new Date(startTime);
                  const hours1 = date1.getHours();
                  const minutes1 = "0" + date1.getMinutes();
                  const startString = (hours1 > 12 ? hours1 - 12 : hours1) + ':' + minutes1.substring(minutes1.length - 2) + (hours1 >= 12 ? "PM" : "AM");


                  const date2 = new Date(endTime);
                  const hours2 = date2.getHours();
                  const minutes2 = "0" + date2.getMinutes();
                  const endString = (hours2 > 12 ? hours2 - 12 : hours2) + ':' + minutes2.substring(minutes2.length - 2) + (hours2 >= 12 ? "PM" : "AM");


                  const prevTime = i > 0 ? new Date(planActivity[i - 1].end) : new Date(); //check if event has passed
                  const timeDiff = prevTime - endTime;


                  if (endTime < Date.now()){
                    return (
                      <li className={styles.plan} key={i}>
                        <p className={styles.topic}>{plan.title}<strong><br></br>(Passed)<br></br>({startString} - {endString})</strong></p>
                        <div className={styles.explanation}>{parse(plan.description)}</div>
                      </li>
                    )
                  }
                  return (
                    <li className={styles.plan} key={i}>
                      <p className={styles.topic}>{plan.title}<br></br><strong> ({startString} - {endString})</strong></p>
                      <div className={styles.explanation}>{parse(plan.description)}</div>
                    </li>
                  );
                })
              } */}
              <PlanTimeline
                plans={plans}
                viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
                viewMode={"timeGridDay"}
                subjects={subjects}
                setPlans={setPlans}
                mode={"study"}
                setIsAddPlanModal={setIsAddPlanModal}
              />
              <Link to="/dashboard/planner">
                <button className={styles.toStatsBtn}>View Plans</button>
              </Link>
            </div>
          </div>
        </Draggable>
        <Draggable
          position={
            positions.activity
          }
          onStop={(e, element) => {
            eventHandler(e, element, "activity");
          }}
          nodeRef={recentActivityRef}
        >
          <div ref={recentActivityRef} className={`${styles.box} box 4`}>
            <div className={styles.inner}>
              <p className={styles.name}>Recent Activity</p>
              <ul>
                {subjectActivity
                  .slice(0, Math.min(7, subjectActivity.length))
                  .map((subject, i) => {
                    const startTime = subject[0];
                    const endTime = subject[1];

                    const date1 = new Date(startTime * 1000);
                    const hours1 = date1.getHours();
                    const minutes1 = "0" + date1.getMinutes();
                    const startString =
                      (hours1 > 12 ? hours1 - 12 : hours1) +
                      ":" +
                      minutes1.substring(minutes1.length - 2) +
                      (hours1 >= 12 ? "PM" : "AM");

                    const date2 = new Date(endTime * 1000);
                    const hours2 = date2.getHours();
                    const minutes2 = "0" + date2.getMinutes();
                    const endString =
                      (hours2 > 12 ? hours2 - 12 : hours2) +
                      ":" +
                      minutes2.substring(minutes2.length - 2) +
                      (hours2 >= 12 ? "PM" : "AM");

                    const prevTime =
                      i > 0
                        ? new Date(subjectActivity[i - 1][0] * 1000)
                        : new Date();
                    const prevDate =
                      prevTime.getMonth() +
                      1 +
                      "/" +
                      prevTime.getDate() +
                      "/" +
                      prevTime.getFullYear();
                    const startDate =
                      date1.getMonth() +
                      1 +
                      "/" +
                      date1.getDate() +
                      "/" +
                      date1.getFullYear();

                    if (prevDate != startDate) {
                      return (
                        <div key={i}>
                          <div className={styles.divider}>
                            <p>{startDate}</p>
                          </div>
                          <li className={styles.plan} key={i}>
                            <p className={styles.topic}>
                              {subject[2]}
                              <strong>
                                {" "}
                                ({startString} - {endString})
                              </strong>
                            </p>
                          </li>
                        </div>
                      );
                    }

                    return (
                      <li className={styles.plan} key={i}>
                        <p className={styles.topic}>
                          {subject[2]}
                          <strong>
                            {" "}
                            ({startString} - {endString})
                          </strong>
                        </p>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        </Draggable>
        <Draggable
          position={
            positions.quote
          }
          onStop={(e, element) => {
            eventHandler(e, element, "quote");
          }}
          nodeRef={memoRef}
        >
          <div ref={memoRef} className={`${styles.box} box 5 ${styles.memo}`}>
            <div className={styles.inner}>
              <p>{quoteMsg}</p>
            </div>
          </div>
        </Draggable>
      </div>
    </div>
  );
}

export default Main;