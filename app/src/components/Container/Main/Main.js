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
    </div>
    </div>
  );
}

export default Main;