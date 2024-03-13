import styles from "./User.module.css";
import React, { useState, useEffect, useRef } from 'react';
import StuckModal from '../../UI/StuckModal/StuckModal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEarthAmericas } from "@fortawesome/free-solid-svg-icons";
import { timelineSort } from "../../../utils/timelineSorting";
import RadioBtn from "../../UI/RadioBtn/RadioBtn";
import CalendarModal from "../../UI/CalendarModal/CalendarModal";
import GroupsGen from "../../UI/GroupsGen/GroupsGen";
import { DateTime } from "luxon";
import { updateRankingTrend, updateSubjectsTrendChart, updateTimeTrend } from "../Stats/StatTools";
import FriendsViewer from "../../UI/FriendsViewer/FriendsViewer";
import ChallengeBtn from "../../UI/ChallengeBtn/ChallengeBtn";
import DmBtn from "../../UI/DmBtn/DmBtn";
import FriendRequestBtn from "../../UI/FriendRequestBtn/FriendRequestBtn";
import GroupPwModal from "../../UI/GroupPwModal/GroupPwModal";
import ApexChart from 'apexcharts';
import Chart from 'react-apexcharts';
import { secondConverter } from "../../../utils/Tool";
import CountryViewer from "../../UI/CountryViewer/CountryViewer";
import { CartesianGrid, Line, Tooltip, XAxis, YAxis, ResponsiveContainer, LineChart } from "recharts";
import StudyTrendChart from "../../UI/StudyTrendChart";
import { useLocation } from "react-router-dom";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function User({ groups, setResponse, setOtherGroups, setMyGroups, myGroups, myInfo, setIsChatModal }) {
  const [userInfo, setUserInfo] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [userSubjects, setUserSubjects] = useState([]);
  const [statsViewer, setStatsViewer] = useState('Daily');
  const [viewDate, setViewDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [userGroups, setUserGroups] = useState([]);
  const [userFriends, setUserFriends] = useState([]);

  const [rankingsTrend, setRankingsTrend] = useState([]);
  const [subjectsTrend, setSubjectsTrend] = useState([]);

  const [isGroupPwModal, setIsGroupPwModal] = useState(false);
  const [joinTarget, setJoinTarget] = useState(null);

  const location = useLocation();

  useEffect(() => {
    if (!joinTarget) return;
    setJoinTarget(joinTarget);
    const { group_id, visibility } = joinTarget;

    if (visibility) {
      fetch(`${serverOrigin}/groups/join/${group_id}`, {
        method: "post",
      })
        .then((response) => response.json())
        .then((data) => {
          setResponse(data);
          setOtherGroups(
            (prev) => {
              prev.filter(group => {
                return group.group_id != group_id;
              })
            }
          );
          setMyGroups((prev) => [...prev, joinTarget]);
        })
        .catch((error) => console.error(error));
    } else {
      setIsGroupPwModal(true);
    };
  }, [joinTarget]);

  useEffect(() => {
    if (!groups) return;
    const pathName = location.pathname.split('/');
    const selectedUserId = pathName[pathName.length - 1];

    fetch(`${serverOrigin}/account/profile/${selectedUserId}`, { method: 'get' })
      .then((response) => response.json())
      .then((data) => {

        if (data.success) {
          const { userInfo, subjectsInfo, friendsInfo } = data;
          setUserInfo(userInfo);
          const sortedSubject = timelineSort(subjectsInfo);
          setUserSubjects(sortedSubject);
          const userGroups = groups.filter(group => {
            return userInfo.groups.includes(group.group_id);
          });
          setUserFriends(friendsInfo)
          setUserGroups(userGroups);
        };
      })
      .catch((error) => console.error(error));
  }, [groups, location.pathname]);

  const updateViewer = async (item) => {
    setStatsViewer(item);
  };

  const updateViewDate = (date) => {
    setViewDate(date);
  };


  useEffect(() => {
    if (!userInfo) return;
    const { user_id } = userInfo;
    const viewDateTime = DateTime.fromJSDate(viewDate).toUTC().toISODate();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    fetch(`${serverOrigin}/ranking/user?userId=${user_id}&mode=${statsViewer.toLowerCase()}&date=${viewDateTime}&timezone=${timezone}`, {
      method: 'get'
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const rankingsTrend = updateRankingTrend(data.rankings, statsViewer);
          setRankingsTrend(rankingsTrend);
        }
      })
      .catch((error) => console.error(error));
  }, [userInfo, statsViewer, viewDate]);

  useEffect(() => {
    if (!userSubjects.length || !statsViewer) return;
    let change = 'days';
    if (statsViewer === 'Monthly') {
      change = 'months';
    } else if (statsViewer === 'Weekly') {
      change = 'weeks';
    };

    const subjectsTrend = updateSubjectsTrendChart(userSubjects, viewDate, statsViewer, change);
    setTimeout(() => {
      setSubjectsTrend(subjectsTrend);
    }, 500)
  }, [userSubjects, statsViewer]);

  return (
    <div>
      <CalendarModal isCalendarOpen={isCalendarOpen} setIsCalendarOpen={setIsCalendarOpen} updateViewDate={updateViewDate} viewDate={viewDate} />
      <GroupPwModal
        setMyGroups={setMyGroups}
        setOtherGroups={setOtherGroups}
        setIsGroupPwModal={setIsGroupPwModal}
        isGroupPwModal={isGroupPwModal}
        joinTarget={joinTarget}
        setJoinGroupResponse={setResponse}
      />
      <div className={`Main`}>
        <div className="title">
          User
        </div>
        <div className={styles.User}>
          <div className={styles.searchOpt}>
            <RadioBtn items={[{ view: 'Daily', value: 'Daily' }, { view: 'Weekly', value: 'Weekly' }, { view: 'Monthly', value: 'Monthly' }]} changeEvent={updateViewer} defaultViewer={0} />
          </div>
          <div className={styles.profileCard}>
            <div>
              <div className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/${userInfo ? userInfo.user_id : ''}.jpeg")`, backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}
              ></div>
              <div className={`${styles.name} overflowDot`}>
                {userInfo?.name}
              </div>
            </div>
            <div>
              Joined at {userInfo ? DateTime.fromSeconds(parseInt(userInfo.datum_point)).toLocaleString(DateTime.DATE_FULL) : null}
            </div>
            <div>
              <FriendRequestBtn setResponse={setResponse} userInfo={userInfo} />
              <DmBtn setIsChatModal={setIsChatModal} setResponse={setResponse} userInfo={userInfo} />
            </div>
            <div className={styles.timezone}>
              Timezone:
              {userInfo?.timezone ? <>
                <i>
                  <CountryViewer timezone={userInfo.timezone} />
                </i>
                <p>
                {userInfo.timezone}
                </p>
              </> : 'UTC'}
            </div>
          </div>
          <div className={styles.boxContainer}>
            <div className={styles.box}>
              <div className={styles.title}>
                Study Trend
              </div>
              <div className={styles.chartContainer}>
                <StudyTrendChart
                  subjectsTrend={subjectsTrend}
                />
              </div>
            </div>
            <div className={styles.box}>
              <div className={styles.title}>
                Ranking Trend
              </div>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={rankingsTrend}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickFormatter={(data) => {
                      const dateTime = DateTime.fromISO(data);

                      return dateTime.toFormat('M/d');
                    }} />
                    <YAxis reversed={true} />
                    <Tooltip />
                    <Line type="monotone" dataKey={"ranking"} stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className={styles.box} id={styles.groupBox}>
              <div className={styles.title}>
                {userInfo ? userInfo.name : ''}'s groups
              </div>
              <div className={`${styles.groupsContainer} customScroll`}>
                <GroupsGen
                  groups={userGroups}
                  myGroups={myGroups}
                  setMyGroups={setMyGroups}
                  setOtherGroups={setOtherGroups}
                  setJoinGroupResponse={setResponse}
                  setIsGroupPwModal={setIsGroupPwModal}
                  setJoinTarget={setJoinTarget}
                  userInfo={myInfo}
                  queryTags={[]}
                  type={1}
                />
              </div>
            </div>
            <div className={styles.box} id={styles.friendsBox}>
              <div className={styles.title}>
                {userInfo ? userInfo.name : ''}'s friends
              </div>
              <div className={styles.friendsContainer}>
                <FriendsViewer friends={userFriends} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default User;