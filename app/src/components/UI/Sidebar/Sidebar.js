import React, { useEffect, useRef, useState } from "react";
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
import { Link, useSearchParams } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { ButtonLogout, IconBxHome, IconClipboardOutline, IconGalleryLine, IconMonitor, IconPeople16, IconRankingChart, IconStatsChart, IconUserAdd, Knife } from "../../../utils/svgs";

function Sidebar({
  onMouseEnter,
  onMouseLeave,
  isSidebarHovered,
  isSidebarOpen,
  mode,
}) {

  const [searchParams, setSearchParams] = useSearchParams();
  const toPlannerRef = useRef(null);
  const toStatsRef = useRef(null);
  const toGroupsRef = useRef(null);
  const [tutorial, setTutorial] = useState(null);

  useEffect(() => {
    if (!searchParams) return;

    const tutorial = searchParams.get("tutorial");
    if (!tutorial) {
      return;
    };

    const hole = document.getElementById("tutorialHole");
    const text = document.getElementById("tutorialText");

    if (parseInt(tutorial) === 10) {
      setTutorial(10);
      setTimeout(() => {
        const { width, top, left, height, bottom } = toStatsRef.current.getBoundingClientRect();
        hole.style.left = left - 20 + 'px';
        hole.style.top = top - 20 + 'px';
        hole.style.width = width + 40 + 'px';
        hole.style.height = height + 40 + 'px';
  
        text.style.top = top + height + 30 + 'px';
        text.style.left = left - 20 + 'px';
        text.innerText = "Navigate to your stats with the sidebar";
      }, 500);
    } /* else if (tutorial === "12") {
      setTutorial(12);
      const { width, top, left, height, bottom } = toGroupsRef.current.getBoundingClientRect();
      hole.style.left = left + 'px';
      hole.style.top = top  + 'px';
      hole.style.width = width + 'px';
      hole.style.height = height + 'px';

      text.style.top = top + height + 30 + 'px';
      text.style.left = left + 'px';
      text.innerText = "Let's go to groups page!";
    } */
  }, [searchParams]);

  return (
    <aside className={styles.Sidebar}>
      <div className={styles.logo}>
        <a href="https://flozable.com">
          <img src="/logo.png" alt="" />
        </a>
      </div>
      <div className={styles.sidebarContainer}>
      <div>
        <div>
           <Link
             className={styles.sidebarEl}
             to={"/dashboard"}
           >
              <div className={styles.hoverField}>
                <h4>Dashboard</h4>
              </div>
             <i>
               <IconBxHome />    
             </i>
             {/* <h1>Home</h1> */}
           </Link> 
        </div>
        <div>
          <Link
            className={styles.sidebarEl}
            to={tutorial ? `/dashboard/stats?tutorial=${tutorial + 1}` : "/dashboard/stats"} 
            id="tutorial-10"
          >
            <div className={styles.hoverField}>
              <h4>Stats</h4>
            </div>
            <i ref={toStatsRef}>
              <IconStatsChart />
            </i>
            {/* <h1>Stats</h1> */}
          </Link>
        </div>
        <div>
          <Link
            className={styles.sidebarEl}
            to={"/dashboard/planner"}
            id="tutorial-6"
            ref={toPlannerRef}
          >
            <div className={styles.hoverField}>
              <h4>Planner</h4>
            </div>
            <i>
              <IconClipboardOutline /> 
            </i>
           {/* <h1>Planner</h1> */}
          </Link>
        </div>
        <div>
          <Link
            className={styles.sidebarEl}
            to={"/dashboard/ranking"}
          >
            <div className={styles.hoverField}>
              <h4>Rank</h4>
            </div>
            <i>
              <IconRankingChart />
            </i>
          {/* <h1>Rank</h1> */}
          </Link>
        </div>
        <div>
          <Link
            className={styles.sidebarEl}
            to={"/dashboard/groups"}
          >
            <div className={styles.hoverField}>
             <h4>Groups</h4>
           </div>
            <i ref={toGroupsRef}>
             <IconPeople16 /> 
           </i>
            {/* <h1>Groups</h1> */}
         </Link>
        </div>
        <div>
          <Link
            className={styles.sidebarEl}
            to={"/dashboard/friends"}
          >
            <div className={styles.hoverField}>
              <h4>Friends</h4>
           </div>
            <i>
              <IconUserAdd /> 
            </i>
           {/* <h1>Friends</h1> */}
          </Link>
        </div>
        <div>
          <Link
            className={styles.sidebarEl}
            to={"/dashboard/themes"}
          >
            <div className={styles.hoverField}>
              <h4>Themes</h4>
            </div>
            <i>
              <IconGalleryLine /> 
            </i>
            {/* <h1>Themes</h1> */}
          </Link>
        </div>
      </div>
    </div>
    </aside>
  );
}

export default Sidebar;
