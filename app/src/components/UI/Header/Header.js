import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCommentDots,
  faCalendar,
  faBook,
  faFire,
  faArrowsToCircle,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Header.module.css";
import PlanTimeline from "../PlanTimeline/PlanTimeline";
import { secondConverter } from "../../../utils/Tool";
import ChatModalBtn from "../ChatModalBtn/ChatModalBtn";
import { ButtonLogout, HeaderBook, HeaderFocus, HeaderMeteor, HeaderMonitor, IconBell, IconBook, IconBxHome, IconBxMessageSquareDetail, IconClipboardOutline, IconEyeOutline, IconIconStar, IconMonitor, IconUser } from "../../../utils/svgs";
import StudyBtn from "../StudyBtn/StudyBtn";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Header({
  setIsChatModal,
  setPlans,
  setPlanModal,
  planModal,
  plans,
  subjects,
  isSidebarHovered,
  userInfo,
  mode,
  isSidebarOpen,
  onToggleSidebar,
  totalNewMsg,
}) {
  const [totalStudied, setTotalStudied] = useState("0m"); // string
  const [longestSession, setLongestSession] = useState("0s");
  const [studyStreak, setStudyStreak] = useState('0 day'); //days of consecutive study

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!subjects.daily) return;

    //Solve daily
    let totalSeconds = subjects.daily.groupedTotal[subjects.daily.groupedTotal.length - 1];
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
        <div className={styles.headerEl}>
          <IconBell />
        </div>
        <div className={styles.divider}>
        </div>
        <div className={styles.headerEl} id={styles.user}>
          <div>
            <p>{userInfo?.name}</p>
          </div>
          <div className={styles.profileImg}
            style={{
              backgroundImage: `url("${serverOrigin}/profile-images/{}.jpeg")`, backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}
          >
          </div>
          <div>
            <Link to="/dashboard/study">
              <i>
              <ButtonLogout />
              </i>
            </Link>      
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;