"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./Sidebar.module.css";
import Link from "next/link";
import { IconBxHome, IconClipboardOutline, IconGalleryLine, IconPeople16, IconRankingChart, IconStatsChart, IconUserAdd } from "@/app/utils/Svg";
import Image from "next/image";
import { TutorialsContext } from "@/app/utils/Contexts";

function Sidebar({
}) {
  const {tutorialBoxRef, tutorialTextRef, tutorial, setTutorial} = useContext(TutorialsContext);

  const toStatsRef = useRef(null);
  const toGroupsRef = useRef(null);

  /* useEffect(() => {
    if (!searchParams) return;

    const tutorial = searchParams.get("tutorial");
    if (!tutorial) {
      return;
    };

    if (parseInt(tutorial) === 10) {
      setTutorial(10);
      setTimeout(() => {
        const { width, top, left, height, bottom } = toStatsRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left - 20 + 'px';
        tutorialBoxRef.current.style.top = top - 20 + 'px';
        tutorialBoxRef.current.style.width = width + 40 + 'px';
        tutorialBoxRef.current.style.height = height + 40 + 'px';
  
        tutorialTextRef.current.style.top = top + height + 30 + 'px';
        tutorialTextRef.current.style.left = left - 20 + 'px';
        tutorialTextRef.current.innerText = "Navigate to your stats with the sidebar";
      }, 500);
    } else if (tutorial === "12") {
      setTutorial(12);
      const { width, top, left, height, bottom } = toGroupsRef.current.getBoundingClientRect();
      hole.style.left = left + 'px';
      hole.style.top = top  + 'px';
      hole.style.width = width + 'px';
      hole.style.height = height + 'px';

      text.style.top = top + height + 30 + 'px';
      text.style.left = left + 'px';
      text.innerText = "Let's go to groups page!";
    }
  }, [searchParams]); */

  useEffect(() => {
    if (tutorial === 11) {
      setTimeout(() => {
        const { width, top, left, height } = toStatsRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left - 20 + 'px';
        tutorialBoxRef.current.style.top = top - 20 + 'px';
        tutorialBoxRef.current.style.width = width + 40 + 'px';
        tutorialBoxRef.current.style.height = height + 40 + 'px';
  
        tutorialTextRef.current.style.top = top + height + 30 + 'px';
        tutorialTextRef.current.style.left = left - 20 + 'px';
        tutorialTextRef.current.innerText = "Navigate to your stats with the sidebar";
      }, 500);
    };
  }, [tutorial]);

  return (
    <aside className={styles.Sidebar}>
      <div className={styles.logo}>
        <a href="https://flozable.com">
          <Image
            src="/logo.png"
            alt="FLOZABLE"
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: '100%', height: 'auto' }}
          />
        </a>
      </div>
      <div className={styles.sidebarContainer}>
        <div>
          <Link
            className={styles.sidebarEl}
            href={"/dashboard"}
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
            href="/dashboard/stats"
            id="tutorial-11"
            onClick={() => {
              if (tutorial === 11) {
                setTutorial(12);
              };
            }}
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
            href={"/dashboard/planner"}
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
            href={"/dashboard/ranking"}
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
            href={"/dashboard/groups"}
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
            href={"/dashboard/friends"}
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
            href={"/dashboard/themes"}
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
    </aside>
  );
}

export default Sidebar;
