"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import styles from "./Header.module.css";
import {
  focusCalculator,
  secondConverter,
  streakCalculator,
  todayTotalCalculator,
} from "../../../utils/Tool";
import {
  HeaderBook,
  HeaderFocus,
  HeaderGamepad,
  HeaderMeteor,
  HeaderMonitor,
  HeaderTarget,
} from "@/app/utils/Svg";
import {
  TutorialsContext,
} from "@/app/utils/Contexts";
import { useSubjects } from "@/Hooks/subjectsHooks";
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
  const { subjects } = useSubjects();

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
    if (!subjects.daily) return;

    //Solve daily
    const todayTotal = todayTotalCalculator(subjects);
    const { value, type } = secondConverter(todayTotal);
    setTotalStudied(value + " " + type);

    //Solve streak
    const streaks = streakCalculator(subjects);
    setStudyStreak(streaks + " days");

    //Solve focus
    if (subjects.daily.grouped.length) {
      const focus = focusCalculator(
        subjects.daily.grouped[subjects.daily.grouped.length - 1]
      );
      const formattedDuration = secondConverter(focus);
      setLongestSession(formattedDuration.value + " " + formattedDuration.type);
    }
  }, [subjects]);

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
            <HeaderTarget/>
          </i>
        </HeaderEl>
      </div>
    </header>
  );
}

export default Header;
