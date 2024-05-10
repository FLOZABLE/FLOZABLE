"use client";

import { useContext, useEffect, useState } from "react";
import styles from "./page.module.css";
import RadioBtn from "@/app/components/Buttons/RadioBtn/RadioBtn";
import FriendRequestBtn from "@/app/components/Buttons/FriendRequestBtn/FriendRequestBtn";
import StudyTrendChart from "@/app/components/Charts/StudyTrendChart";
import config from "@/app/utils/config";
import ProfileImage from "@/app/components/Users/ProfileImage/ProfileImage";
import DmBtn from "@/app/components/Buttons/DmBtn/DmBtn";
import CountryViewer from "@/app/components/Others/CountryViewer/CountryViewer";
import RankingTrend from "@/app/components/Charts/RankingTrendChart";
import { GroupsContext } from "@/app/utils/Contexts";
import GroupContainer from "@/app/components/Groups/GroupContainer/GroupContainer";
import FriendsViewer from "@/app/components/Friends/FriendsViewer/FriendsViewer";
import { DateTime } from "luxon";
import { timelineSort } from "@/app/utils/timelineSorting";

function User({ params }) {
  const { userId } = params;

  const { groups } = useContext(GroupsContext);

  const [userInfo, setUserInfo] = useState(null);
  const [userSubjects, setUserSubjects] = useState([]);
  const [statsViewer, setStatsViewer] = useState("Daily");
  const [viewDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [userGroups, setUserGroups] = useState([]);
  const [userFriends, setUserFriends] = useState([]);

  useEffect(() => {
    if (!userId) return;

    fetch(`${config.server}/account/profile/${userId}`, {
      method: "get",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const { userInfo, subjectsInfo, friendsInfo } = data;
          setUserInfo(userInfo);
          const sortedSubject = timelineSort(subjectsInfo);
          setUserSubjects(sortedSubject);
          setUserFriends(friendsInfo);
        }
      })
      .catch((error) => console.error(error));
  }, [userId]);

  useEffect(() => {
    if (!userInfo || !userInfo.groups || !groups) return;

    const userGroups = groups.filter((group) => {
      return userInfo.groups.includes(group.group_id);
    });
    setUserGroups(userGroups);
  }, [userInfo, groups]);

  return (
    <div>
      <div className={`Main`}>
        <div className="title">User</div>
        <div className={styles.User}>
          <div className={styles.searchOpt}>
            <RadioBtn
              items={[
                { view: "Daily", value: "Daily" },
                { view: "Weekly", value: "Weekly" },
                { view: "Monthly", value: "Monthly" },
              ]}
              changeEvent={setStatsViewer}
              defaultViewer={0}
            />
          </div>
          <div className={styles.profileCard}>
            <div>
              <ProfileImage
                width="4rem"
                height="4rem"
                userId={userInfo?.user_id}
              />
              <div className={`${styles.name} overflowDot`}>
                {userInfo?.name}
              </div>
            </div>
            <div>
              Joined at{" "}
              {userInfo
                ? DateTime.fromSeconds(
                    parseInt(userInfo.datum_point)
                  ).toLocaleString(DateTime.DATE_FULL)
                : null}
            </div>
            <div>
              <div className={styles.btnContainer}>
                <FriendRequestBtn userInfo={userInfo} />
              </div>
              <div className={styles.btnContainer}>
                <DmBtn userInfo={userInfo} />
              </div>
            </div>
            <div className={styles.timezone}>
              Timezone:
              {userInfo?.timezone ? (
                <>
                  <i>
                    <CountryViewer timezone={userInfo.timezone} />
                  </i>
                  <p>{userInfo.timezone}</p>
                </>
              ) : (
                "UTC"
              )}
            </div>
          </div>
          <div className={styles.boxContainer}>
            <div className={styles.box}>
              <div className={styles.title}>Study Trend</div>
              <div className={styles.chartContainer}>
                <StudyTrendChart
                  viewDate={viewDate}
                  statsViewer={statsViewer}
                  subjectsProp={userSubjects}
                />
              </div>
            </div>
            <div className={styles.box}>
              <div className={styles.title}>Ranking Trend</div>
              <div className={styles.chartContainer}>
                <RankingTrend
                  viewDate={viewDate}
                  statsViewer={statsViewer}
                  userInfoProp={userInfo}
                />
              </div>
            </div>
            <div className={styles.box} id={styles.groupBox}>
              <div className={styles.title}>
                {userInfo ? userInfo.name : ""}&apos;s groups
              </div>
              <div className={`${styles.groupsContainer} customScroll`}>
                {userGroups.map((group, i) => {
                  return <GroupContainer key={i} groupInfo={group} />;
                })}
              </div>
            </div>
            <div className={styles.box} id={styles.friendsBox}>
              <div className={styles.title}>
                {userInfo ? userInfo.name : ""}&apos;s friends
              </div>
              <div className={styles.friendsContainer}>
                <FriendsViewer friends={userFriends} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default User;
