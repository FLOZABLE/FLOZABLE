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
import { useExtensionUsage } from "@/Hooks/extensionHooks";
import ProfileImage from "../../Users/ProfileImage/ProfileImage";
import Link from "next/link";
import NotificationsContainer from "../../Notifications/NotificationsContainer/NotificationsContainer";
import { useAccount } from "@/Hooks/accountHooks";
import { useSubjects } from "@/Hooks/subjectsHooks";
import ChatModalBtn from "../../Buttons/ChatModalBtn/ChatModalBtn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen } from "@fortawesome/free-solid-svg-icons";

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
  const { accountData } = useAccount();
  const { groupedSubjects } = useSubjects();

  const [totalStudied, setTotalStudied] = useState("0 minutes"); // string
  const [appUsage, setAppUsage] = useState("0 minutes");
  const [longestSession, setLongestSession] = useState("0 seconds");
  const [studyStreak, setStudyStreak] = useState("0 day"); //days of consecutive study

  const studyBtnRef = useRef(null);

  const { extensionUsageData } = useExtensionUsage(
    new Date(new Date().setHours(0, 0, 0, 0)),
    "day"
  );

  useEffect(() => {
    if (!groupedSubjects.day) return;

    //Solve day
    const todayTotal = todayTotalCalculator(groupedSubjects);
    const formattedTodayTotal = secondConverter(todayTotal, [
      "seconds",
      "minutes",
      "hours",
    ]);
    setTotalStudied(formattedTodayTotal.value + " " + formattedTodayTotal.type);

    //Solve streak
    const streaks = streakCalculator(groupedSubjects);
    setStudyStreak(streaks + " days");

    const focus = todayFocusCalculator(groupedSubjects);
    const formattedFocus = secondConverter(focus, [
      "seconds",
      "minutes",
      "hours",
    ]);
    setLongestSession(formattedFocus.value + " " + formattedFocus.type);
  }, [groupedSubjects]);

  useEffect(() => {
    if (!extensionUsageData?.success || !extensionUsageData.data.usage.length)
      return;
    const totalWebsiteUsage = extensionUsageData.data.usage.reduce((a, b) => {
      return a + b.duration;
    }, 0);
    const { value, type } = secondConverter(totalWebsiteUsage, [
      "seconds",
      "minutes",
      "hours",
    ]);
    setAppUsage(value + " " + type);
  }, [extensionUsageData]);

  return (
    <header className={styles.Header}>
      <div className={styles.left}>
        <HeaderEl title={"Today Total"} value={totalStudied}>
          <i>
            <FontAwesomeIcon icon={faBookOpen} />
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
      {accountData ? (
        <div className={styles.right}>
          <div className={styles.ChatBtn}>
            <ChatModalBtn />
          </div>
          <div className={styles.NotificationsBtn}>
            <NotificationsContainer />
          </div>
          <Link href={"/dashboard/account"} className={styles.userInfo}>
            <div>
              <p className={styles.name}>{accountData.name}</p>
              <p className={styles.email}>@{accountData.email.split("@")[0]}</p>
            </div>
            <div className={styles.ProfileImage}>
              <ProfileImage
                userId={accountData.user_id}
                width="100%"
                height="100%"
              />
            </div>
          </Link>
        </div>
      ) : null}
    </header>
  );
}

export default Header;
