"use client";

import React, { useContext, useEffect, useRef } from "react";
import styles from "./Sidebar.module.css";
import Link from "next/link";
import {
  IconBxHome,
  IconClipboardOutline,
  IconFriend,
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
      <div className={styles.hoverEl}></div>
      {children}
    </Link>
  );
}

function Sidebar({}) {
  const { tutorialBoxRef, tutorialTextRef, tutorial } =
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
          <IconFriend />
        </i>
      </SidebarEl>
      <SidebarEl pathname={pathname} href={"/dashboard/themes"}>
        <i>
          <IconGalleryLine />
        </i>
      </SidebarEl>
      <TutorialBtn />
    </aside>
  );
}

export default Sidebar;
