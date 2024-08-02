"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import styles from "./Header.module.css";
import {
  secondConverter,
  streakCalculator,
  todayFocusCalculator,
  todayTotalCalculator,
} from "../../../utils/Tool";
import {
  HeaderBook,
  HeaderGamepad,
  HeaderMeteor,
  HeaderTarget,
} from "@/app/utils/Svg";
import { SubjectsContext, TutorialsContext } from "@/app/utils/Contexts";
import { useExtensionUsage } from "@/Hooks/extensionHooks";

function HeaderEl({ children, value, title }) {
  return (
    <div className={styles.HeaderEl}>
      {children}
      <div>
        <div className={`jost ${styles.title}`}>{title}</div>
        <div className={styles.value}>{value}</div>
      </div>
    </div>
  );
}
function Header({}) {
  const { groupedSubjects } = useContext(SubjectsContext);

  const { tutorialBoxRef, tutorialTextRef, tutorial } =
    useContext(TutorialsContext);

  const [totalStudied, setTotalStudied] = useState("0 minutes"); // string
  const [appUsage, setAppUsage] = useState("0 minutes");
  const [longestSession, setLongestSession] = useState("0 seconds");
  const [studyStreak, setStudyStreak] = useState("0 day"); //days of consecutive study

  const studyBtnRef = useRef(null);

  useEffect(() => {
    if (tutorial === 6) {
      const { width, top, left, height } =
        studyBtnRef.current.getBoundingClientRect();
      tutorialBoxRef.current.style.left = left - 10 + "px";
      tutorialBoxRef.current.style.top = top - 10 + "px";
      tutorialBoxRef.current.style.width = width + 20 + "px";
      tutorialBoxRef.current.style.height = height + 20 + "px";

      tutorialTextRef.current.style.top = top + height + 30 + "px";
      tutorialTextRef.current.style.right = 30 + "px";
      tutorialTextRef.current.innerText =
        "Click here to start a study session!";
    }
  }, [tutorial]);

  const { data: websitesData } = useExtensionUsage(
    new Date(new Date().setHours(0, 0, 0, 0)),
    "day"
  );

  useEffect(() => {
    if (!groupedSubjects.daily) return;

    //Solve daily
    const todayTotal = todayTotalCalculator(groupedSubjects);
    const formattedTodayTotal = secondConverter(todayTotal);
    setTotalStudied(formattedTodayTotal.value + " " + formattedTodayTotal.type);

    //Solve streak
    const streaks = streakCalculator(groupedSubjects);
    setStudyStreak(streaks + " days");

    const focus = todayFocusCalculator(groupedSubjects);
    const formattedFocus = secondConverter(focus);
    setLongestSession(formattedFocus.value + " " + formattedFocus.type);
  }, [groupedSubjects]);

  useEffect(() => {
    if (!websitesData?.success || !websitesData.websites.length) return;

    const totalWebsiteUsage = websitesData.websites.reduce((a, b) => {
      return a + b;
    });
    const { value, type } = secondConverter(totalWebsiteUsage);
    setAppUsage(value + " " + type);
  }, [websitesData]);

  return (
    <header className={styles.Header}>
      <div className={styles.left}>
        <HeaderEl title={"Today Total"} value={totalStudied}>
          <i>
            <HeaderBook />
          </i>
        </HeaderEl>
        <div className={styles.divider}></div>
        <HeaderEl title={"App Usage"} value={appUsage}>
          <i>
            <HeaderGamepad />
          </i>
        </HeaderEl>
        <div className={styles.divider}></div>
        <HeaderEl title={"Streak"} value={studyStreak}>
          <i>
            <HeaderMeteor />
          </i>
        </HeaderEl>
        <div className={styles.divider}></div>
        <HeaderEl title={"Focus Time"} value={longestSession}>
          <i>
            <HeaderTarget />
          </i>
        </HeaderEl>
      </div>
    </header>
  );
}

export default Header;
