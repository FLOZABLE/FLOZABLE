"use client"

import React, { useState, useEffect, useRef, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell, faMessage,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Header.module.css";
import { secondConverter } from "../../../utils/Tool";
import Link from "next/link";
import { HeaderBook, HeaderFocus, HeaderMeteor, HeaderMonitor } from "@/app/utils/Svg";
import { ModalsContext, NotificationsContext, SubjectsContext, TutorialsContext, UserInfoContext } from "@/app/utils/Contexts";
import ProfileImage from "@/app/components/Users/ProfileImage/ProfileImage";
import Image from "next/image";

function Header({
}) {
  const { subjects } = useContext(SubjectsContext);
  const { userInfo } = useContext(UserInfoContext);
  const { notifications } = useContext(NotificationsContext);
  const { setChatModal, chatModal, setIsNotificationModal } = useContext(ModalsContext);
  const { tutorialBoxRef, tutorialTextRef, tutorial, setTutorial } = useContext(TutorialsContext);

  const [totalStudied, setTotalStudied] = useState("0m"); // string
  const [longestSession, setLongestSession] = useState("0s");
  const [studyStreak, setStudyStreak] = useState('0 day'); //days of consecutive study


  const studyBtnRef = useRef(null);

  useEffect(() => {
    if (tutorial === 6) {
      const { width, top, left, height } = studyBtnRef.current.getBoundingClientRect();
      tutorialBoxRef.current.style.left = left - 10 + 'px';
      tutorialBoxRef.current.style.top = top - 10 + 'px';
      tutorialBoxRef.current.style.width = width + 20 + 'px';
      tutorialBoxRef.current.style.height = height + 20 + 'px';

      tutorialTextRef.current.style.top = top + height + 30 + 'px';
      tutorialTextRef.current.style.right = 30 + 'px';
      tutorialTextRef.current.innerText = "Click here to start a study session!";
    }
  }, [tutorial]);

  useEffect(() => {
    if (!subjects.daily) return;

    //Solve daily
    let totalSeconds = subjects.daily.total[subjects.daily.total.length - 1];
    totalSeconds = totalSeconds ? totalSeconds : 0;
    const { value, type } = secondConverter(totalSeconds);
    setTotalStudied(value + type);

    //Solve streak
    let tempStreak = 0;
    let day = 0;
    for (let i = 0; i < subjects.length; i++) {
      day = Math.max(day, subjects[i].daily.grouped.length - 1); //find the latest day
      // this will find the maximum length in all the daily arrays
    }
    while (day >= 0) {
      let studiedToday = false;
      for (let i = 0; i < subjects.length; i++) {
        if (
          subjects[i].daily.grouped[day] &&
          subjects[i].daily.grouped[day].length > 0
        ) {
          //the user has studied in this subject this day
          tempStreak += 1;
          studiedToday = true;
          break; //to prevent adding streak for other subjects;
        }
      }
      if (!studiedToday) break;
      day -= 1;
    };
    if (tempStreak) {
      setStudyStreak(tempStreak + ' days');
    }

    //Solve focus
    let subjectActivity = [];
    for (let i = 0; i < subjects.length; i++) {
      subjects[i].daily.grouped[subjects[i].daily.grouped.length - 1].map(
        ([startUnix, stopUnix]) => {
          subjectActivity.push(stopUnix - startUnix);
        },
      );
    }
    subjectActivity.sort((a, b) => a - b);

    let longestSessionSeconds = subjectActivity.length
      ? subjectActivity[subjectActivity.length - 1]
      : 0;
    let longestSessionMinutes = Math.floor(longestSessionSeconds / 60);
    let longestSessionHours = Math.floor(longestSessionMinutes / 60);
    let longestSessionString = "";
    if (longestSessionHours > 0) {
      longestSessionString += "" + longestSessionHours + "h ";
      longestSessionString += "" + (longestSessionMinutes % 60) + "m";
    } else {
      longestSessionString += "" + longestSessionMinutes + "m";
    }

    setLongestSession(longestSessionString);
  }, [subjects]);

  return (
    <header className={styles.Header}>
      <div className={styles.left}>
        <div className={styles.headerEl}>
          <div>
            <i>
              <HeaderBook />
            </i>
            <div>
              <p>Today total</p>
              <strong>{totalStudied}</strong>
            </div>
          </div>
        </div>
        <div className={styles.divider}>
        </div>
        <div className={styles.headerEl}>
          <div>
            <i>
              <HeaderMonitor />
            </i>
            <div>
              <p>App Usage</p>
              <strong>0 hour</strong>
            </div>
          </div>
        </div>
        <div className={styles.divider}>
        </div>
        <div className={styles.headerEl}>
          <div>
            <i>
              <HeaderMeteor />
            </i>
            <div>
              <p>Streak</p>
              <strong>{studyStreak}</strong>
            </div>
          </div>
        </div>
        <div className={styles.divider}>
        </div>
        <div className={styles.headerEl}>
          <div>
            <i>
              <HeaderFocus />
            </i>
            <div>
              <p>Focus</p>
              <strong>{longestSession}</strong>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.headerEl} id={styles.chats}
          onClick={() => { setChatModal(prev => ({ ...prev, open: !prev.open })) }}
        >
          <i>
            <FontAwesomeIcon icon={faMessage} bounce={chatModal?.totalNewMsg ? true : false} />
          </i>
          <div>
            {chatModal?.totalNewMsg ? chatModal.totalNewMsg : 0}
          </div>
        </div>
        <div className={styles.headerEl} id={styles.notifications}
          onClick={() => { setIsNotificationModal(prev => !prev) }}
        >
          <i>
            <FontAwesomeIcon icon={faBell} bounce={notifications ? notifications.filter(notification => notification.t !== -2).length ? true : false : false} />
          </i>
          <div>
            {notifications ? notifications.filter(notification => notification.t !== -2).length : 0}
          </div>
        </div>
        <div className={styles.divider}>
        </div>
        <Link
          href="/dashboard/account"
          className={styles.headerEl} id={styles.user}>
          <div>
            <p>{userInfo?.name}</p>
            <p>@{userInfo?.email?.split("@")[0]}</p>
          </div>
          <ProfileImage
            userId={userInfo?.user_id}
            width="4rem"
            height="4rem"
          />
        </Link>
        <div className={styles.headerEl}>
          <Link href="/dashboard/study" id="tutorial-6" ref={studyBtnRef} onClick={() => {
            if (tutorial === 6) {
              setTutorial(7);
            };
          }}
            className={styles.StudyButton}
          >
            Study
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;