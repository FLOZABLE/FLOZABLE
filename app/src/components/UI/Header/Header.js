import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCommentDots, faCalendar, faClock, faBook, faMobileScreenButton, faFire, faArrowsToCircle } from '@fortawesome/free-solid-svg-icons';
import ToggleBtn from "../ToggleBtn/ToggleBtn";
import styles from "./Header.module.css";

function Header(props) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
          <FontAwesomeIcon icon={faBook} style={{color: "#348d50",}} />
          </div>
          <div className={styles.text}>
            <h5>20k</h5>
            <h6>Attended</h6>
          </div>
        </div>
        <div className={styles.headerEl}>
          <div className={styles.circle}>
          <FontAwesomeIcon icon={faMobileScreenButton} style={{color: "#ff562d",}} />
          </div>
          <div className={styles.text}>
            <h5>20k</h5>
            <h6>Attended</h6>
          </div>
        </div>
        <div className={styles.headerEl}>
          <div className={styles.circle}>
          <FontAwesomeIcon icon={faFire} style={{color: "#2c70ff",}} />
          </div>
          <div className={styles.text}>
            <h5>20k</h5>
            <h6>Attended</h6>
          </div>
        </div>
        <div className={styles.headerEl}>
          <div className={styles.circle}>
          <FontAwesomeIcon icon={faArrowsToCircle} style={{color: "#705dc1",}} />
          </div>
          <div className={styles.text}>
            <h5>20k</h5>
            <h6>Attended</h6>
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
            <button><FontAwesomeIcon icon={faCommentDots} style={{ color: "#ffffff" }} /></button>
            <div className={styles.dropDownContent}>
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