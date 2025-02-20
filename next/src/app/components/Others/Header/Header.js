"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import styles from "./Header.module.css";
import {
  secondConverter,
  streakCalculator,
  todayFocusCalculator,
  todayTotalCalculator,
} from "../../../utils/Tool";
import {
  HeaderBook,
  HeaderGamepad,
  HeaderMeteor,
  HeaderTarget,
} from "@/app/utils/Svg";
import {
  useExtensionSettings,
  useExtensionUsage,
} from "@/Hooks/extensionHooks";
import ProfileImage from "../../Users/ProfileImage/ProfileImage";
import Link from "next/link";
import NotificationsContainer from "../../Notifications/NotificationsContainer/NotificationsContainer";
import { useAccount } from "@/Hooks/accountHooks";
import { useSubjects } from "@/Hooks/subjectsHooks";
import ChatModalBtn from "../../Buttons/ChatModalBtn/ChatModalBtn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faBookOpen,
  faBrain,
  faHourglassStart,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import { AccountModalContext } from "@/app/utils/Contexts";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

function HeaderEl({ children, value, title }) {
  return (
    <div className={styles.HeaderEl}>
      {children}
      <div>
        <div className={`jost ${styles.title}`}>{title}</div>
        <div className={styles.value}>{value}</div>
      </div>
    </div>
  );
}
function Header({}) {
  const { setIsAccountModal } = useContext(AccountModalContext);

  const { accountData } = useAccount();
  const { groupedSubjects } = useSubjects();

  const [totalStudied, setTotalStudied] = useState("0 minutes"); // string
  const [appUsage, setAppUsage] = useState("0 minutes");
  const [longestSession, setLongestSession] = useState("0 seconds");
  const [studyStreak, setStudyStreak] = useState("0 day"); //days of consecutive study
  const { useExtensionSettingsData } = useExtensionSettings();

  const router = useRouter();

  const { extensionUsageData } = useExtensionUsage(
    new Date(new Date().setHours(0, 0, 0, 0)),
    "day"
  );

  useEffect(() => {
    if (!groupedSubjects.day) return;

    //Solve day
    const todayTotal = todayTotalCalculator(groupedSubjects);
    const formattedTodayTotal = secondConverter({
      sec: todayTotal,
      options: ["seconds", "minutes", "hours"],
    });
    setTotalStudied(formattedTodayTotal);

    //Solve streak
    const streaks = streakCalculator(groupedSubjects);
    setStudyStreak(streaks + " days");

    const focus = todayFocusCalculator(groupedSubjects);
    const formattedFocus = secondConverter({
      sec: focus,
      options: ["seconds", "minutes", "hours"],
    });
    setLongestSession(formattedFocus);
  }, [groupedSubjects]);

  useEffect(() => {
    if (!extensionUsageData?.success || !extensionUsageData.data.usage.length)
      return;
    const totalWebsiteUsage = extensionUsageData.data.usage.reduce((a, b) => {
      return a + b.duration;
    }, 0);
    const formattedWebsiteUsage = secondConverter({
      sec: totalWebsiteUsage,
      options: ["seconds", "minutes", "hours"],
    });
    setAppUsage(formattedWebsiteUsage);
  }, [extensionUsageData]);

  useEffect(() => {
    if (!accountData) {
      setIsAccountModal(true);
    } else {
      setIsAccountModal(false);
    }
  }, [accountData]);

  return (
    <header className={styles.Header}>
      <div className={styles.left}>
        <HeaderEl title={"Today Total"} value={totalStudied}>
          <i>
            <FontAwesomeIcon icon={faBookOpen} />
          </i>
        </HeaderEl>
        <div className={styles.divider}></div>
        <HeaderEl title={"App Usage"} value={appUsage}>
          <i>
            <FontAwesomeIcon icon={faHourglassStart} />
          </i>
        </HeaderEl>
        <div className={styles.divider}></div>
        <HeaderEl title={"Streak"} value={studyStreak}>
          <i>
            <FontAwesomeIcon icon={faRocket} />
          </i>
        </HeaderEl>
        <div className={styles.divider}></div>
        <HeaderEl title={"Focus Time"} value={longestSession}>
          <i>
            <FontAwesomeIcon icon={faBrain} />
          </i>
        </HeaderEl>
      </div>
      {accountData ? (
        <div className={styles.right}>
          {useExtensionSettingsData?.data?.settings?.length ? null : (
            <button
              id={styles.tryExtensionBtn}
              onClick={() => {
                router.push("/dashboard/account?website=youtube.com");
                window.open(
                  "https://chromewebstore.google.com/detail/flozable-tab-monitor/cmbdaanokelibhphiidlikongdoandlj",
                  "_blank"
                );
                setTimeout(() => {
                  toast.info(
                    "Manage the websites you want to block or track usage from this page!"
                  );
                }, 500);
              }}
            >
              Try our Chrome extension to block distractions!
              <i>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
              </i>
            </button>
          )}
          <div className={styles.ChatBtn}>
            <ChatModalBtn />
          </div>
          <div className={styles.NotificationsBtn}>
            <NotificationsContainer />
          </div>
          <Link href={"/dashboard/account"} className={styles.userInfo}>
            <div>
              <p className={styles.name}>{accountData.name}</p>
              <p className={styles.email}>&quot;</p>
            </div>
            <div className={styles.ProfileImage}>
              <ProfileImage
                userId={accountData.user_id}
                width="100%"
                height="100%"
              />
            </div>
          </Link>
        </div>
      ) : null}
    </header>
  );
}

export default Header;
