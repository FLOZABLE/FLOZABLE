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
import { IconBxHome, Knife } from "../../../utils/svgs";

function Sidebar({
  onMouseEnter,
  onMouseLeave,
  isSidebarHovered,
  isSidebarOpen,
  mode,
}) {
  return (
    <aside className={styles.Sidebar}>
      <div className={styles.logo}>
        <img src="/logo.png" alt="" />
      </div>
      <div className={styles.sidebarContainer}>
        <Link
          className={styles.sidebarEl}
        >
          <i>
            <IconBxHome /> 
          </i>
          <h1>Home</h1>
        </Link>
        <Link
          className={styles.sidebarEl}
        >
          <i>
            <IconBxHome /> 
          </i>
          <h1>Home</h1>
        </Link>
        <Link
          className={styles.sidebarEl}
        >
          <i>
            <IconBxHome /> 
          </i>
          <h1>Home</h1>
        </Link>
        <Link
          className={styles.sidebarEl}
        >
          <i>
            <IconBxHome /> 
          </i>
          <h1>Home</h1>
        </Link>
        <Link
          className={styles.sidebarEl}
        >
          <i>
            <IconBxHome /> 
          </i>
          <h1>Home</h1>
        </Link>
        <Link
          className={styles.sidebarEl}
        >
          <i>
            <IconBxHome /> 
          </i>
          <h1>Home</h1>
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
