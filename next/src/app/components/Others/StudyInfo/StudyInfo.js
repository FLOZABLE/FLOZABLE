import { useExtensionUsage } from "@/Hooks/extensionHooks";
import styles from "./StudyInfo.module.css";
import {
  HeaderBook,
  HeaderFocus,
  HeaderMeteor,
  HeaderMonitor,
} from "@/app/utils/Svg";
import {
  focusCalculator,
  secondConverter,
  streakCalculator,
  todayTotalCalculator,
} from "@/app/utils/Tool";
import { useContext, useEffect, useState } from "react";
import { useSubjects } from "@/Hooks/subjectsHooks";

export default function StudyInfo() {
  const { subjects } = useSubjects();

  const [totalStudied, setTotalStudied] = useState("0m"); // string
  const [appUsage, setAppUsage] = useState("0 m");
  const [longestSession, setLongestSession] = useState("0s");
  const [studyStreak, setStudyStreak] = useState("0 day"); //days of consecutive study

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
    <div className={styles.StudyInfo}>
      <div className={styles.box}>
        <div className={styles.icon}>
          <HeaderBook />
        </div>
        <div className={styles.text}>
          <p>Today total</p>
          <strong>{totalStudied}</strong>
        </div>
      </div>
      <div className={styles.box}>
        <div className={styles.icon}>
          <HeaderMonitor />
        </div>
        <div className={styles.text}>
          <p>App Usage</p>
          <strong>{appUsage}</strong>
        </div>
      </div>
      <div className={styles.box}>
        <div className={styles.icon}>
          <HeaderMeteor />
        </div>
        <div className={styles.text}>
          <p>Streak</p>
          <strong>{studyStreak}</strong>
        </div>
      </div>
      <div className={styles.box}>
        <div className={styles.icon}>
          <HeaderFocus />
        </div>
        <div className={styles.text}>
          <p>Focus</p>
          <strong>{longestSession}</strong>
        </div>
      </div>
    </div>
  );
}
