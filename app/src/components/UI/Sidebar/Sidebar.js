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
import { ButtonLogout, IconBxHome, IconClipboardOutline, IconGalleryLine, IconMonitor, IconPeople16, IconStatsChart, IconUserAdd, Knife } from "../../../utils/svgs";

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
        <a href="https://flozable.com">
          <img src="/logo.png" alt="" />
        </a>
      </div>
      <div className={styles.sidebarContainer}>
        <Link
          className={styles.sidebarEl}
          to={"/dashboard"}
        >
          <i>
            <IconBxHome />    
          </i>
          <h1>Home</h1>
        </Link>
        <Link
          className={styles.sidebarEl}
          to={"/dashboard/stats"}
        >
          <i>
            <IconMonitor /> 
          </i>
          <h1>Stats</h1>
        </Link>
        <Link
          className={styles.sidebarEl}
          to={"/dashboard/planner"}
        >
          <i>
            <IconClipboardOutline /> 
          </i>
          <h1>Planner</h1>
        </Link>
        <Link
          className={styles.sidebarEl}
          to={"/dashboard/ranking"}
        >
          <i>
            <IconStatsChart /> 
          </i>
          <h1>Rank</h1>
        </Link>
        <Link
          className={styles.sidebarEl}
          to={"/dashboard/groups"}
        >
          <i>
            <IconPeople16 /> 
          </i>
          <h1>Groups</h1>
        </Link>
        <Link
          className={styles.sidebarEl}
          to={"/dashboard/friends"}
        >
          <i>
            <IconUserAdd /> 
          </i>
          <h1>Friends</h1>
        </Link>
        <Link
          className={styles.sidebarEl}
          to={"/dashboard/themes"}
        >
          <i>
            <IconGalleryLine /> 
          </i>
          <h1>Themes</h1>
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
