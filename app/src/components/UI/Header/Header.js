import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCommentDots, faCalendar, faClock } from '@fortawesome/free-solid-svg-icons';
import ToggleBtn from "../ToggleBtn/ToggleBtn";
import styles from "./Header.module.css";

function Header(props) {
  const [hoveredElement, setHoveredElement] = useState(null);

  const handleMouseEnter = (elementId) => {
    setHoveredElement(elementId);
  };

  const handleMouseLeave = () => {
    setHoveredElement('null');
  };
  return (
    <header className={`${styles.header} ${props.isSidebarOpen || props.isSidebarHovered ? styles.isOpen : ''}`}>
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
            <img src="./logo512.png" alt="" />
          </div>
          <div className={styles.text}>
            <h5>20k</h5>
            <h6>Attended</h6>
          </div>
        </div>
        <div className={styles.headerEl}>
          <div className={styles.circle}>
            <img src="./logo512.png" alt="" />
          </div>
          <div className={styles.text}>
            <h5>20k</h5>
            <h6>Attended</h6>
          </div>
        </div>
        <div className={styles.headerEl}>
          <div className={styles.circle}>
            <img src="./logo512.png" alt="" />
          </div>
          <div className={styles.text}>
            <h5>20k</h5>
            <h6>Attended</h6>
          </div>
        </div>
        <div className={styles.headerEl}>
          <div className={styles.circle}>
            <img src="./logo512.png" alt="" />
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
            <button><FontAwesomeIcon icon={faBell} style={{ color: "#ffffff" }} /></button>
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
          <button
                  onMouseEnter={() => handleMouseEnter('navItemProfile')}
                  onMouseLeave={handleMouseLeave}
                  className={`${hoveredElement === 'navItemProfile' ? styles.hovered : ''}`}
          >
            <img src="./profile.png" alt="" />
            <div className={styles.dropDownMenu}>

            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;