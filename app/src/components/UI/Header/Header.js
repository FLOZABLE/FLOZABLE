import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCommentDots, faCalendar, faClock, faBook, faMobileScreenButton, faFire, faArrowsToCircle, faBars } from '@fortawesome/free-solid-svg-icons';
import ToggleBtn from "../ToggleBtn/ToggleBtn";
import styles from "./Header.module.css";

function Header(props) {
  const { isChatModal, setIsChatModal, subjects } = props;

  const [totalStudied, setTotalStudied] = useState("0m"); // string
  const [longestSession, setLongestSession] = useState("0s");
  const [studyStreak, setStudyStreak] = useState(0); //days of consecutive study

  const [isScrolled, setIsScrolled] = useState(false);
  const messageDropDownRef = useRef(null);

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
    let totalMinutes = Math.round(totalSeconds/60);
    let totalHours = Math.round(totalMinutes/60);

    let displayString = "";
    if (totalHours > 0){
      displayString += "" + totalHours + "h ";
      displayString += "" + (totalMinutes % 60) + "m";
    }
    else{
      displayString += "" + totalMinutes + "m";
    }
    setTotalStudied(displayString);

    //Solve streak
    let tempStreak = 0;
    let day = 0;
    for (let i = 0; i < subjects.length; i++){
      day = Math.max(day, subjects[i].daily.grouped.length - 1); //find the latest day
      // this will find the maximum length in all the daily arrays
    }
    while (day >= 0){
      let studiedToday = false;
      for (let i = 0; i < subjects.length; i++){
        if (subjects[i].daily.grouped[day].length > 0){
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
    for (let i = 0; i < subjects.length; i++){
      subjects[i].daily.grouped[subjects[i].daily.grouped.length - 1].map(([startUnix, stopUnix]) => {
        subjectActivity.push(stopUnix - startUnix);
      });
    }
    subjectActivity.sort((a,b) => a - b);
    console.log(subjectActivity);
    let longestSessionSeconds = subjectActivity.length ? subjectActivity[subjectActivity.length - 1] : 0;
    let longestSessionMinutes = Math.floor(longestSessionSeconds / 60);
    let longestSessionHours = Math.floor(longestSessionMinutes / 60);
    let longestSessionString = "";
    if (longestSessionHours > 0){
      longestSessionString += "" + longestSessionHours + "h ";
      longestSessionString += "" + (longestSessionMinutes % 60) + "m";
    }
    else{
      longestSessionString += "" + longestSessionMinutes + "m";
    }

    setLongestSession(longestSessionString);

  },[subjects]);

  return (
    <header className={`${styles.header} ${props.isSidebarOpen || props.isSidebarHovered ? styles.isOpen : ''} ${props.mode === "study" ? styles.studyMode : ''} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.left}>
        <ToggleBtn
          on={<p>on</p>}
          off={<p>off</p>}
          style={{ backgroundColor: '#fff' }}
          onToggle={props.onToggleSidebar}
          isToggled={props.isSidebarOpen}
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
          <div className={styles.dropDown}>
            <button><FontAwesomeIcon icon={faCalendar} style={{ color: "#ffffff" }} /></button>
            <div className={styles.dropDownContent}>
              <div className={styles.inner}>
                <h3 className={styles.title}>Today's Plan</h3>
                <ul>
                  <li>
                    <div className={styles.icon}>
                      <FontAwesomeIcon icon={faClock} style={{ color: "#ffffff" }} />
                    </div>
                    <div className={styles.explanation}>
                      <p className={styles.topic}>JaSon</p>
                      <p className={styles.time}>Sup bro</p>
                    </div>
                  </li>
                  <li>
                    <div className={styles.icon}>
                      <FontAwesomeIcon icon={faClock} style={{ color: "#ffffff" }} />
                    </div>
                    <div className={styles.explanation}>
                      <p className={styles.topic}>Run payoll</p>
                      <p className={styles.time}>Mar 4 at 6:00pm</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className={styles.dropDown}>
            <button><FontAwesomeIcon icon={faBell} style={{ color: "#ffffff" }} /></button>
            <div className={styles.dropDownContent}>
              <div className={styles.inner}>
                <h3 className={styles.title}>Notifications</h3>
                <ul>
                  <li>
                    <div className={styles.icon}>
                      <FontAwesomeIcon icon={faClock} style={{ color: "#ffffff" }} />
                    </div>
                    <div className={styles.explanation}>
                      <p className={styles.topic}>JaSon</p>
                      <p className={styles.time}>Sup bro</p>
                    </div>
                  </li>
                  <li>
                    <div className={styles.icon}>
                      <FontAwesomeIcon icon={faClock} style={{ color: "#ffffff" }} />
                    </div>
                    <div className={styles.explanation}>
                      <p className={styles.topic}>Run payoll</p>
                      <p className={styles.time}>Mar 4 at 6:00pm</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className={styles.dropDown}>
            <button onClick={() => { setIsChatModal(!isChatModal) }}><FontAwesomeIcon icon={faCommentDots} style={{ color: "#ffffff" }} /></button>
            <div className={`${styles.dropDownContent} ${isChatModal ? styles.chatModalOpen : ''}`} onClick={() => {setIsChatModal(!isChatModal)}} >
              <div className={styles.inner}>
                <h3 className={styles.title}>Messages</h3>
                <ul>
                  <li>
                    <div className={styles.icon}>
                      <FontAwesomeIcon icon={faClock} style={{ color: "#ffffff" }} />
                    </div>
                    <div className={styles.explanation}>
                      <p className={styles.topic}>JaSon</p>
                      <p className={styles.time}>Sup bro</p>
                    </div>
                  </li>
                  <li>
                    <div className={styles.icon}>
                      <FontAwesomeIcon icon={faClock} style={{ color: "#ffffff" }} />
                    </div>
                    <div className={styles.explanation}>
                      <p className={styles.topic}>Run payoll</p>
                      <p className={styles.time}>Mar 4 at 6:00pm</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className={styles.dropDown}>
            <button><img src="/profile.png" alt="" /></button>
            <div className={styles.dropDownContent}>
              <div className={styles.inner}>
                <h3 className={styles.title}>Profile Setting</h3>
                <ul>
                  <li>
                    <div className={styles.icon}>
                      <FontAwesomeIcon icon={faClock} style={{ color: "#ffffff" }} />
                    </div>
                    <div className={styles.explanation}>
                      <p className={styles.topic}>JaSon</p>
                      <p className={styles.time}>Sup bro</p>
                    </div>
                  </li>
                  <li>
                    <div className={styles.icon}>
                      <FontAwesomeIcon icon={faClock} style={{ color: "#ffffff" }} />
                    </div>
                    <div className={styles.explanation}>
                      <p className={styles.topic}>Run payoll</p>
                      <p className={styles.time}>Mar 4 at 6:00pm</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;