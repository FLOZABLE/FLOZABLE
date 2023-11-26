import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartColumn,
  faHouse,
  faCalendar,
  faUserGroup,
  faRankingStar,
  faPeopleGroup,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";

function Sidebar({
  onMouseEnter,
  onMouseLeave,
  isSidebarHovered,
  isSidebarOpen,
  mode,
}) {
  const [hoveredElement, setHoveredElement] = useState(null);

  const handleMouseEnter = (elementId) => {
    setHoveredElement(elementId);
  };

  const handleMouseLeave = () => {
    setHoveredElement("null");
  };
  return (
    <aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`${styles.Sidebar} ${
        mode === "study" ? styles.studyMode : ""
      } ${isSidebarOpen ? styles.isOpen : ""} ${
        isSidebarHovered ? styles.isOpen : isSidebarHovered
      }`}
    >
      {isSidebarOpen}
      <div
        onMouseEnter={() => handleMouseEnter("navItem1")}
        onMouseLeave={handleMouseLeave}
        className={`${styles.startStudy} ${styles.navItemWrapper} ${
          hoveredElement === "navItem1" ? styles.hovered : ""
        }`}
      >
        <Link to="/dashboard" className={styles.navItem}>
          <div className={styles.icon}>
            <FontAwesomeIcon icon={faHouse} />
          </div>
          <p className={styles.navText} data-text="Home">
            Home
          </p>
        </Link>
      </div>
      <ul>
        <li>
          <div
            onMouseEnter={() => handleMouseEnter("navItem2")}
            onMouseLeave={handleMouseLeave}
            className={`${styles.startStudy} ${styles.navItemWrapper} ${
              hoveredElement === "navItem2" ? styles.hovered : ""
            }`}
          >
            <Link to="/dashboard/stats" className={styles.navItem}>
              <div className={styles.icon}>
                <FontAwesomeIcon icon={faChartColumn} />
              </div>
              <p className={styles.navText} data-text="Stats">
                Stats
              </p>
            </Link>
          </div>
        </li>
        <li>
          <div
            onMouseEnter={() => handleMouseEnter("navItem3")}
            onMouseLeave={handleMouseLeave}
            className={`${styles.startStudy} ${styles.navItemWrapper} ${
              hoveredElement === "navItem3" ? styles.hovered : ""
            }`}
          >
            <Link to="/dashboard/planner" className={styles.navItem}>
              <div className={styles.icon}>
                <FontAwesomeIcon icon={faCalendar} />
              </div>
              <p className={styles.navText} data-text="Planner">
                Planner
              </p>
            </Link>
          </div>
        </li>
        <li>
          <div
            onMouseEnter={() => handleMouseEnter("navItem4")}
            onMouseLeave={handleMouseLeave}
            className={`${styles.startStudy} ${styles.navItemWrapper} ${
              hoveredElement === "navItem4" ? styles.hovered : ""
            }`}
          >
            <Link to="/dashboard/groups" className={styles.navItem}>
              <div className={styles.icon}>
                <FontAwesomeIcon icon={faPeopleGroup} />
              </div>
              <p className={styles.navText} data-text="Groups">
                Groups
              </p>
            </Link>
          </div>
        </li>
        <li>
          <div
            onMouseEnter={() => handleMouseEnter("navItem5")}
            onMouseLeave={handleMouseLeave}
            className={`${styles.startStudy} ${styles.navItemWrapper} ${
              hoveredElement === "navItem5" ? styles.hovered : ""
            }`}
          >
            <Link to="/dashboard/ranking" className={styles.navItem}>
              <div className={styles.icon}>
                <FontAwesomeIcon icon={faRankingStar} />
              </div>
              <p className={styles.navText} data-text="Ranking">
                Ranking
              </p>
            </Link>
          </div>
        </li>
        <li>
           <div
             onMouseEnter={() => handleMouseEnter('navItem6')}
             onMouseLeave={handleMouseLeave}
             className={`${styles.startStudy} ${styles.navItemWrapper} ${hoveredElement === 'navItem6' ? styles.hovered : ''}`}
           >
             <Link to="/dashboard/friends" className={styles.navItem}>
               <div className={styles.icon}>
               <FontAwesomeIcon icon={faUserGroup} />
               </div>
               <p className={styles.navText}  data-text="Friends">Friends</p>
             </Link>
           </div>
          </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
