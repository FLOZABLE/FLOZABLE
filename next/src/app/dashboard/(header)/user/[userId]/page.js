"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { useAccountProfile } from "@/Hooks/accountHooks";
import { timelineSorter } from "@/app/utils/timelineSorting";
import StudyTrendChart from "@/app/components/Charts/StudyTrendChart/StudyTrendChart";
import RankingsTrendsChart from "@/app/components/Charts/RankingsTrendsChart/RankingsTrendsChart";
import GroupContainer from "@/app/components/Groups/GroupContainer/GroupContainer";
import ChatBtn from "@/app/components/Buttons/ChatBtn/ChatBtn";
import FriendRequestBtn from "@/app/components/Buttons/FriendRequestBtn/FriendRequestBtn";
import { useGroups } from "@/Hooks/groupsHook";
import config from "@/app/utils/config";
import UserStatus from "@/app/components/Users/UserStatus/UserStatus";
import { DateTime } from "luxon";

function User({ params }) {
  const { userId } = React.use(params);

  const { accountProfileData } = useAccountProfile(userId);
  const { groups } = useGroups();

  const [subjects, setSubjects] = useState([]);
  const [friends, setFriends] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [joinedAt, setJointedAt] = useState("");

  const [viewDate, setViewDate] = useState(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [viewer, setViewer] = useState("day");

  useEffect(() => {
    if (!accountProfileData) return;

    const { userInfo, friends, subjects } = accountProfileData;

    const sortedSubjects = timelineSorter(subjects);

    setSubjects(sortedSubjects.subjects);
    setUserInfo(userInfo);
    setFriends(friends);
  }, [accountProfileData]);

  useEffect(() => {
    if (!userInfo) return;

    const diff = DateTime.now().diff(DateTime.fromSeconds(userInfo.created_at));
    const diffSec = diff.as("seconds");

    let mode = "seconds";

    if (diffSec > 60 * 60 * 24 * 30) {
      mode = "months";
    } else if (diffSec > 60 * 60 * 24) {
      mode = "days";
    } else if (diffSec > 60 * 60) {
      mode = "hours";
    } else if (diffSec > 60) {
      mode = "minutes";
    }

    const value = Math.round(diff.as(mode));
    setJointedAt(`Joined ${value} ${mode} ago`);
  }, [userInfo]);

  useEffect(() => {
    if (!userInfo || !groups) return;
    setUserGroups(
      groups.filter((group) => userInfo.groups.includes(group.group_id))
    );
  }, [groups, userInfo]);

  if (!userInfo) {
    return null;
  }

  return (
    <div className={`Main`}>
      <div className={styles.User}>
        <div className={styles.left}>
          <div id={styles.profileCard}>
            <div id={styles.profile}>
              <img
                id={styles.profileImg}
                src={`${config.static_server}/img/profile-images/${userId}.jpeg`}
              />
              <div id={styles.userStatus}>
                <UserStatus userId={userId} />
              </div>
            </div>
            <div id={styles.userInfo}>
              <p id={styles.name}>{userInfo.name}</p>
              <p>{joinedAt}</p>
              <div className={styles.buttons}>
                <FriendRequestBtn userInfo={userInfo} />
                <ChatBtn targetInfo={userInfo} />
              </div>
            </div>
          </div>
          <div className={`BoxContainer ${styles.boxContainer}`}>
            <StudyTrendChart
              viewDate={viewDate}
              setViewDate={setViewDate}
              viewer={viewer}
              subjects={subjects}
              userId={userId}
            />
          </div>
          <div className={`BoxContainer ${styles.boxContainer}`}>
            <RankingsTrendsChart
              viewDate={viewDate}
              setViewDate={setViewDate}
              viewer={viewer}
              userId={userInfo?.user_id}
            />
          </div>
        </div>
        <div className={styles.right}>
          <div id={styles.myGroups}>
            {userGroups.map((group, i) => {
              return (
                <GroupContainer groupInfo={group} key={i} isSearched={true} />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default User;
