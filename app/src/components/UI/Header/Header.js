import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCommentDots, faCalendar, faClock, faBook, faMobileScreenButton, faFire, faArrowsToCircle, faBars } from '@fortawesome/free-solid-svg-icons';
import ToggleBtn from "../ToggleBtn/ToggleBtn";
import styles from "./Header.module.css";
import PlanTimeline from "../PlanTimeline/PlanTimeline";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Header({ isChatModal, setIsChatModal, setPlans, setIsAddPlanModal, isAddPlanModal, plans, subjects, isSlibarOpen, isSidebarHovered, userInfo, mode, isSidebarOpen, onToggleSidebar }) {

  const [totalStudied, setTotalStudied] = useState("0m"); // string
  const [longestSession, setLongestSession] = useState("0s");
  const [studyStreak, setStudyStreak] = useState(0); //days of consecutive study

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    }

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!!!subjects.daily) return;

    //Solve daily
    let totalSeconds = subjects.daily.groupedTotal[subjects.daily.groupedTotal.length - 1];
    let totalMinutes = Math.round(totalSeconds / 60);
    let totalHours = Math.round(totalMinutes / 60);

    let displayString = "";
    if (totalHours > 0) {
      displayString += "" + totalHours + "h ";
      displayString += "" + (totalMinutes % 60) + "m";
    }
    else {
      displayString += "" + totalMinutes + "m";
    }
    setTotalStudied(displayString);

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
        if (subjects[i].daily.grouped[day] && subjects[i].daily.grouped[day].length > 0) {
          //the user has studied in this subject this day
          tempStreak += 1;
          studiedToday = true;
          break; //to prevent adding streak for other subjects;
        }
      }
      if (!studiedToday) break;
      day -= 1;
    }
    setStudyStreak(tempStreak);

    //Solve focus
    let subjectActivity = [];
    for (let i = 0; i < subjects.length; i++) {
      subjects[i].daily.grouped[subjects[i].daily.grouped.length - 1].map(([startUnix, stopUnix]) => {
        subjectActivity.push(stopUnix - startUnix);
      });
    }
    subjectActivity.sort((a, b) => a - b);

    let longestSessionSeconds = subjectActivity.length ? subjectActivity[subjectActivity.length - 1] : 0;
    let longestSessionMinutes = Math.floor(longestSessionSeconds / 60);
    let longestSessionHours = Math.floor(longestSessionMinutes / 60);
    let longestSessionString = "";
    if (longestSessionHours > 0) {
      longestSessionString += "" + longestSessionHours + "h ";
      longestSessionString += "" + (longestSessionMinutes % 60) + "m";
    }
    else {
      longestSessionString += "" + longestSessionMinutes + "m";
    }

    setLongestSession(longestSessionString);

  }, [subjects]);

  return (
    <header className={`${styles.header} ${isSidebarOpen || isSidebarHovered ? styles.isOpen : ''} ${mode === "study" ? styles.studyMode : ''} ${isScrolled ? styles.scrolled : ''}`}>
      {/* <EventModal
        isAddPlanModal={isAddPlanModal}
        setIsAddPlanModal={setIsAddPlanModal}
        title={title}
        setTitle={setTitle}
        setStart={setStart}
        start={start}
        setEnd={setEnd}
        end={end}
        description={description}
        setDescription={setDescription}
        setSubject={setSubject}
        subjects={subjectsOpt}
        notification={notification}
        setNotification={setNotification}
        submit={submit}
        setSubmit={setSubmit}
        repeat={repeat}
        setRepeat={setRepeat}
        priority={priority}
        setPriority={setPriority}
        setIsAddSubjectModal={setIsAddSubjectModal}
        setPlanSubmit={() => { updatePlan(selectedEvent, title, start, end, description, subject, priority); }}
      /> */}
      <div className={styles.left}>
        <ToggleBtn
          on={<p>on</p>}
          off={<p>off</p>}
          style={{ backgroundColor: '#fff' }}
          onToggle={onToggleSidebar}
          isToggled={isSidebarOpen}
        />
        <div className={styles.headerEl}>
          <div className={styles.circle}>
            <FontAwesomeIcon icon={faBook} style={{ color: "#348d50", }} />
          </div>
          <div className={styles.text}>
            <h5>{totalStudied}</h5>
            <h6>Today Total</h6>
          </div>
        </div>
        <div className={styles.headerEl}>
          <div className={styles.circle}>
            <FontAwesomeIcon icon={faBars} style={{ color: "#ff562d", }} />
          </div>
          <div className={styles.text}>
            <h5>2h</h5>
            <h6>App Usage</h6>
          </div>
        </div>
        <div className={styles.headerEl}>
          <div className={styles.circle}>
            <FontAwesomeIcon icon={faFire} style={{ color: "#2c70ff", }} />
          </div>
          <div className={styles.text}>
            <h5>{studyStreak} Day</h5>
            <h6>Streak</h6>
          </div>
        </div>
        <div className={styles.headerEl}>
          <div className={styles.circle}>
            <FontAwesomeIcon icon={faArrowsToCircle} style={{ color: "#705dc1", }} />
          </div>
          <div className={styles.text}>
            <h5>{longestSession}</h5>
            <h6>Focus</h6>
          </div>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.headerEl}>
          <div className={styles.dropDownContainer}>
            <button>
              <i>
                <FontAwesomeIcon icon={faCalendar} />
              </i>
            </button>
            <div className={styles.dropDownContents} id={styles.planner}>
              <div className={styles.inner}>
                <PlanTimeline plans={plans} viewDate={new Date()} subjects={subjects} setIsAddPlanModal={setIsAddPlanModal} isAddPlanModal={isAddPlanModal} setPlans={setPlans} />
              </div>
            </div>
          </div>
          <div className={styles.dropDownContainer}>
            <button>
              <i>
                <FontAwesomeIcon icon={faBell} />
              </i>
            </button>
            <div className={styles.dropDownContents}>
              <div className={styles.inner}>
                <p>0 notifications</p>
              </div>
            </div>
          </div>
          <div className={styles.dropDownContainer}>
            <button onClick={() => { setIsChatModal(!isChatModal) }}>
              <i>
                <FontAwesomeIcon icon={faCommentDots} />
              </i>
            </button>
          </div>
          <div className={styles.dropDownContainer}>
            <button
            >
              <Link to="/dashboard/account" className={styles.navItem}>
                <div className={styles.profileImg} style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/${userInfo ? userInfo.user_id : ''}.jpeg")`, backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}>
                </div>
              </Link>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;