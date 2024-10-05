"use client";

import React, { useContext, useEffect, useRef } from "react";
import styles from "./Sidebar.module.css";
import Link from "next/link";
import {
  Gear,
  IconBxHome,
  IconClipboardOutline,
  IconFriend,
  IconGalleryLine,
  IconGear,
  IconPeople16,
  IconRankingChart,
  IconStatsChart,
} from "@/app/utils/Svg";
import Image from "next/image";
import { TutorialsContext } from "@/app/utils/Contexts";
import TutorialBtn from "../../Buttons/TutorialBtn/TutorialBtn";
import { usePathname } from "next/navigation";
import { useWindowSize } from "@/Hooks/otherHooks";
import AccountBtn from "../../Buttons/AccountBtn/AccountBtn";

function SidebarEl({ pathname, href, children }) {
  return (
    <Link
      href={href}
      className={`${styles.SidebarEl} ${
        href === pathname ? styles.activeSidebar : ""
      }`}
      id={href === pathname ? "activeSidebar" : ""}
    >
      {children}
    </Link>
  );
}

function Sidebar({}) {
  const { tutorialBoxRef, tutorialTextRef, tutorial } =
    useContext(TutorialsContext);

  const toStatsRef = useRef(null);
  const toGroupsRef = useRef(null);

  const focusBackgroundRef = useRef(null);

  const pathname = usePathname();

  const windowSize = useWindowSize();

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

  useEffect(() => {
    const activeItem = document.getElementById("activeSidebar");
    if (activeItem && focusBackgroundRef.current) {
      const itemRect = activeItem.getBoundingClientRect();
      const sidebarRect = activeItem.parentElement.getBoundingClientRect();
      const topOffset = itemRect.top - sidebarRect.top;
      focusBackgroundRef.current.style.transform = `translateY(${topOffset}px)`;
    }
  }, [pathname, windowSize]);

  return (
    <aside className={styles.Sidebar}>
      <div className={styles.logoContainer}>
        <a href="https://flozable.com" className={styles.logo}>
          <Image
            src="/logo.png"
            alt="FLOZABLE"
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "100%", height: "auto" }}
          />
        </a>
        <p className="jost">FLOZABLE</p>
      </div>
      <div ref={focusBackgroundRef} id={styles.focusBackground}></div>
      <SidebarEl pathname={pathname} href={"/dashboard"}>
        <i>
          <IconBxHome />
        </i>
        <h3>Dashboard</h3>
      </SidebarEl>
      <SidebarEl pathname={pathname} href={"/dashboard/stats"}>
        <i ref={toStatsRef}>
          <IconStatsChart />
        </i>
        <h3>Statistics</h3>
      </SidebarEl>
      <SidebarEl pathname={pathname} href={"/dashboard/planner"}>
        <i>
          <IconClipboardOutline />
        </i>
        <h3>Planner</h3>
      </SidebarEl>
      <SidebarEl pathname={pathname} href={"/dashboard/leaderboard"}>
        <i>
          <IconRankingChart />
        </i>
        <h3>Leaderboard</h3>
      </SidebarEl>
      <SidebarEl pathname={pathname} href={"/dashboard/groups"}>
        <i ref={toGroupsRef}>
          <IconPeople16 />
        </i>
        <h3>Groups</h3>
      </SidebarEl>
      <SidebarEl pathname={pathname} href={"/dashboard/friends"}>
        <i>
          <IconFriend />
        </i>
        <h3>Friends</h3>
      </SidebarEl>
      <SidebarEl pathname={pathname} href={"/dashboard/themes"}>
        <i>
          <IconGalleryLine />
        </i>
        <h3>Themes</h3>
      </SidebarEl>
      <SidebarEl pathname={pathname} href={"/dashboard/account"}>
        <i>
          <IconGear />
        </i>
        <h3>Settings</h3>
      </SidebarEl>
      <div className={styles.buttons}>
        <TutorialBtn />
        <AccountBtn />
      </div>
    </aside>
  );
}

export default Sidebar;
