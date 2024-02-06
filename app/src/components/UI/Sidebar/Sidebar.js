import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartColumn,
  faHouse,
  faCalendar,
  faUserGroup,
  faRankingStar,
  faPeopleGroup,
  faShop,
  faHandFist,
  faPencil,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { Knife } from "../../../utils/svgs";

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
      className={`${styles.Sidebar} ${mode === "study" ? styles.studyMode : ""
        } ${isSidebarOpen ? styles.isOpen : ""} ${isSidebarHovered ? styles.isOpen : isSidebarHovered
        }`}
    >
      {isSidebarOpen}
      <div
        onMouseEnter={() => handleMouseEnter("navItem1")}
        onMouseLeave={handleMouseLeave}
        className={`${styles.startStudy} ${styles.navItemWrapper} ${hoveredElement === "navItem1" ? styles.hovered : ""
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
          <Link
            className={styles.navItemWrapper}
            to="/dashboard/stats"
          >
            <div className={styles.navItem}>
              <div className={styles.icon}>
                <FontAwesomeIcon icon={faChartColumn} />
              </div>
              <p className={styles.navText} data-text="Stats">
                Stats
              </p>
            </div>
          </Link>
        </li>
        <li>
          <Link
            className={styles.navItemWrapper}
            to="/dashboard/planner"
          >
            <div className={styles.navItem}>
              <div className={styles.icon}>
                <FontAwesomeIcon icon={faCalendar} />
              </div>
              <p className={styles.navText} data-text="Planner">
                Planner
              </p>
            </div>
          </Link>
        </li>
        <li>
          <Link
            className={styles.navItemWrapper}
            to="/dashboard/groups"
          >
            <div className={styles.navItem}>
              <div className={styles.icon}>
                <FontAwesomeIcon icon={faPeopleGroup} />
              </div>
              <p className={styles.navText} data-text="Groups">
                Groups
              </p>
            </div>
          </Link>
        </li>
        <li>
          <Link
            className={styles.navItemWrapper}
            to="/dashboard/ranking"
          >
            <div className={styles.navItem}>
              <div className={styles.icon}>
                <FontAwesomeIcon icon={faRankingStar} />
              </div>
              <p className={styles.navText} data-text="Ranking">
                Ranking
              </p>
            </div>
          </Link>
        </li>
        <li>
          <Link
            className={styles.navItemWrapper}
            to="/dashboard/friends"
          >
            <div className={styles.navItem}>
              <div className={styles.icon}>
                <FontAwesomeIcon icon={faUserGroup} />
              </div>
              <p className={styles.navText} data-text="Friends">Friends</p>
            </div>
          </Link>
        </li>
        <li>
          <Link
            className={styles.navItemWrapper}
            to="/dashboard/themes"
          >
            <div className={styles.navItem}>
              <div className={styles.icon}>
                <FontAwesomeIcon icon={faShop} />
              </div>
              <p className={styles.navText} data-text="Themes">
                Themes
              </p>
            </div>
          </Link>
        </li>
        <li>
          <div className={styles.studyOption}>
            <Link
              className={styles.navItemWrapper}
              to="/dashboard/study"
            >
              <div className={styles.navItem}>
                <div className={styles.icon}>
                  <FontAwesomeIcon icon={faPencil} />
                </div>
                <p className={styles.navText} data-text="Study">
                  Study
                </p>
              </div>
            </Link>
          </div>
        </li>
        {/* <li>
          <div
            className={styles.navItemWrapper}
          >
            <Link to="/dashboard/challenges" className={styles.navItem}>
              <div className={styles.icon}>
              <FontAwesomeIcon icon={faHandFist} />
              </div>
              <p className={styles.navText} data-text="Compete">
                Compete
              </p>
            </Link>
          </div>
        </li> */}
        {/* <li>
        <div
            className={styles.navItemWrapper}
          >
            <Link to="/dashboard/friends" className={styles.navItem}>
              <div className={styles.icon}>
                <img src={<Knife />} alt="" />
              </div>
              <p className={styles.navText} data-text="Friends">Friends</p>
            </Link>
          </div>
        </li> */}
      </ul>
    </aside>
  );
}

export default Sidebar;
