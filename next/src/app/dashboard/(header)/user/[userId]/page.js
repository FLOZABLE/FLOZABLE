"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import ProfileImage from "@/app/components/Users/ProfileImage/ProfileImage";
import { useAccountProfile } from "@/Hooks/accountHooks";
import { timelineSorter } from "@/app/utils/timelineSorting";
import StudyTrendChart from "@/app/components/Charts/StudyTrendChart/StudyTrendChart";
import RankingsTrendsChart from "@/app/components/Charts/RankingsTrendsChart/RankingsTrendsChart";
import GroupContainer from "@/app/components/Groups/GroupContainer/GroupContainer";
import CountryViewer from "@/app/components/Others/CountryViewer/CountryViewer";
import ChatBtn from "@/app/components/Buttons/ChatBtn/ChatBtn";
import FriendRequestBtn from "@/app/components/Buttons/FriendRequestBtn/FriendRequestBtn";
import { useGroups } from "@/Hooks/groupsHook";
import config from "@/app/utils/config";

function User({ params }) {
  const { userId } = React.use(params);

  const { accountProfileData } = useAccountProfile(userId);
  const { groups } = useGroups();

  const [subjects, setSubjects] = useState([]);
  const [friends, setFriends] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [userGroups, setUserGroups] = useState([]);

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
            <img
              id={styles.profileImg}
              src={`${config.static_server}/img/profile-images/${userId}.jpeg`}
            />
            <div id={styles.userInfo}>
              <p id={styles.name}>{userInfo.name}</p>
              <p>Joined 2 months ago</p>
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
