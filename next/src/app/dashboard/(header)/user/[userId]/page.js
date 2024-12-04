"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import ProfileImage from "@/app/components/Users/ProfileImage/ProfileImage";
import { useAccountProfile } from "@/Hooks/accountHooks";
import { timelineSort } from "@/app/utils/timelineSorting";
import StudyTrendChart from "@/app/components/Charts/StudyTrendChart/StudyTrendChart";
import RankingsTrendsChart from "@/app/components/Charts/RankingsTrendsChart/RankingsTrendsChart";
import GroupContainer from "@/app/components/Groups/GroupContainer/GroupContainer";
import CountryViewer from "@/app/components/Others/CountryViewer/CountryViewer";
import ChatBtn from "@/app/components/Buttons/ChatBtn/ChatBtn";
import FriendRequestBtn from "@/app/components/Buttons/FriendRequestBtn/FriendRequestBtn";
import { useGroups } from "@/Hooks/groupsHook";

function User({ params }) {
  const { userId } = React.use(params);

  const { useAccountProfileData } = useAccountProfile(userId);
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
    if (!useAccountProfileData?.success) return;

    const { userInfo, friends, subjects } = useAccountProfileData.data;

    const sortedSubjects = timelineSort(subjects);

    setSubjects(sortedSubjects.subjects);
    setUserInfo(userInfo);
    setFriends(friends);
  }, [useAccountProfileData]);

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
        <div className={styles.profileCard}>
          <div className={styles.ProfileImage}>
            <ProfileImage
              userId={userInfo?.user_id}
              height="100%"
              width="100%"
            />
          </div>
          <div className={styles.info}>
            <p className={`overflowDot ${styles.name}`}>{userInfo?.name}</p>
            <i>
              <CountryViewer timezone={userInfo.timezone} />
            </i>
          </div>
          <div className={styles.buttons}>
            <ChatBtn targetInfo={userInfo} />
            <FriendRequestBtn userInfo={userInfo} />
          </div>
        </div>
        <div className={styles.layer}>
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
          {userGroups.length ? (
            <div
              className={`BoxContainer customScroll ${styles.boxContainer}`}
              id={styles.GroupsContainer}
            >
              <div className="customScroll">
                {userGroups.map((group, i) => {
                  return (
                    <GroupContainer
                      groupInfo={group}
                      key={i}
                      isSearched={true}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default User;
