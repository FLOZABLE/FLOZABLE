"use client";

import React, { useContext, useEffect, useRef } from "react";
import styles from "./Sidebar.module.css";
import Link from "next/link";
import {
  IconBxHome,
  IconClipboardOutline,
  IconGalleryLine,
  IconPeople16,
  IconRankingChart,
  IconStatsChart,
  IconUserAdd,
} from "@/app/utils/Svg";
import Image from "next/image";
import { TutorialsContext } from "@/app/utils/Contexts";
import TutorialBtn from "../../Buttons/TutorialBtn/TutorialBtn";
import { usePathname } from "next/navigation";

function SidebarEl({ pathname, href, children }) {
  return (
    <Link
      href={href}
      className={styles.SidebarEl}
      id={href === pathname ? styles.selected : ""}
    >
      <div className={styles.hoverEl}>
        
      </div>
      {children}
    </Link>
  );
}

function Sidebar({}) {
  const { tutorialBoxRef, tutorialTextRef, tutorial, setTutorial } =
    useContext(TutorialsContext);

  const toStatsRef = useRef(null);
  const toGroupsRef = useRef(null);

  const pathname = usePathname();

  useEffect(() => {
    if (tutorial === 11) {
      setTimeout(() => {
        const { width, top, left, height } =
          toStatsRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left - 20 + "px";
        tutorialBoxRef.current.style.top = top - 20 + "px";
        tutorialBoxRef.current.style.width = width + 40 + "px";
        tutorialBoxRef.current.style.height = height + 40 + "px";

        tutorialTextRef.current.style.top = top + height + 30 + "px";
        tutorialTextRef.current.style.left = left - 20 + "px";
        tutorialTextRef.current.innerText =
          "Navigate to your stats with the sidebar";
      }, 500);
    }
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
            style={{ width: "100%", height: "auto" }}
          />
        </a>
      </div>
      <SidebarEl pathname={pathname} href={"/dashboard"}>
        <i>
          <IconBxHome />
        </i>
      </SidebarEl>
      <SidebarEl pathname={pathname} href={"/dashboard/stats"}>
        <i ref={toStatsRef}>
          <IconStatsChart />
        </i>
      </SidebarEl>
      <SidebarEl pathname={pathname} href={"/dashboard/planner"}>
        <i>
          <IconClipboardOutline />
        </i>
      </SidebarEl>
      <SidebarEl pathname={pathname} href={"/dashboard/ranking"}>
        <i>
          <IconRankingChart />
        </i>
      </SidebarEl>
      <SidebarEl pathname={pathname} href={"/dashboard/groups"}>
        <i ref={toGroupsRef}>
          <IconPeople16 />
        </i>
      </SidebarEl>
      <SidebarEl pathname={pathname} href={"/dashboard/friends"}>
        <i>
          <IconUserAdd />
        </i>
      </SidebarEl>
      <SidebarEl pathname={pathname} href={"/dashboard/themes"}>
        <i>
          <IconGalleryLine />
        </i>
      </SidebarEl>
      {/* <Link href={"/dashboard"} className={styles.sidebarEl}>
        <i>
          <IconBxHome />
        </i>
      </Link>
      <Link href={"/dashboard/stats"} className={styles.sidebarEl}>
        <i ref={toStatsRef}>
          <IconStatsChart />
        </i>
      </Link>
      <Link href={"/dashboard/planner"} className={styles.sidebarEl}>
        <i>
          <IconClipboardOutline />
        </i>
      </Link>
      <Link href={"/dashboard/ranking"} className={styles.sidebarEl}>
        <i>
          <IconRankingChart />
        </i>
      </Link>
      <Link href={"/dashboard/groups"} className={styles.sidebarEl}>
        <i ref={toGroupsRef}>
          <IconPeople16 />
        </i>
      </Link>
      <Link href={"/dashboard/friends"} className={styles.sidebarEl}>
        <i>
          <IconUserAdd />
        </i>
      </Link>
      <Link href={"/dashboard/themes"} className={styles.sidebarEl}>
        <i>
          <IconGalleryLine />
        </i>
      </Link> */}
      {/* <div className={styles.sidebarContainer}>
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
          </Link>
        </div>
      </div> */}
      <TutorialBtn />
    </aside>
  );
}

export default Sidebar;
