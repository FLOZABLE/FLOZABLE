import styles from "./User.module.css";
import React, { useState, useEffect, useRef } from 'react';
import StuckModal from '../../UI/StuckModal/StuckModal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEarthAmericas } from "@fortawesome/free-solid-svg-icons";
import LineChart from "../../UI/LineChart";
import { timelineSort } from "../../../utils/timelineSorting";
import RadioBtn from "../../UI/RadioBtn/RadioBtn";
import CalendarModal from "../../UI/CalendarModal/CalendarModal";
import GroupsGen from "../../UI/GroupsGen/GroupsGen";
import { DateTime } from "luxon";
import { updateRankingTrend, updateTimeTrend } from "../Stats/StatTools";
import FriendsViewer from "../../UI/FriendsViewer/FriendsViewer";
import ChallengeBtn from "../../UI/ChallengeBtn/ChallengeBtn";
import DmBtn from "../../UI/DmBtn/DmBtn";
import FriendRequestBtn from "../../UI/FriendRequestBtn/FriendRequestBtn";
import GroupPwModal from "../../UI/GroupPwModal/GroupPwModal";
import ApexChart from 'apexcharts';
import Chart from 'react-apexcharts';
import { secondConverter } from "../../../utils/Tool";

const serverOrigin = process.env.REACT_APP_ORIGIN;

const lineChartOption = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    }
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
  scales: {
    y: {
      grid: {
        drawBorder: false,
        display: true,
        drawOnChartArea: true,
        drawTicks: false,
        borderDash: [5, 5]
      },
      ticks: {
        display: true,
        padding: 10,
        color: '#9ca2b7',
        stepSize: 1
      }
    },
    x: {
      grid: {
        drawBorder: false,
        display: true,
        drawOnChartArea: true,
        drawTicks: true,
        borderDash: [5, 5]
      },
      ticks: {
        display: true,
        color: '#9ca2b7',
        padding: 10
      }
    },
  },
};

const rankingLinchartOpt = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    }
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
  scales: {
    y: {
      grid: {
        drawBorder: false,
        display: true,
        drawOnChartArea: true,
        drawTicks: false,
        borderDash: [5, 5]
      },
      ticks: {
        display: true,
        padding: 10,
        color: '#9ca2b7',
        stepSize: 1
      },
      reverse: true
    },
    x: {
      grid: {
        drawBorder: false,
        display: true,
        drawOnChartArea: true,
        drawTicks: true,
        borderDash: [5, 5]
      },
      ticks: {
        display: true,
        color: '#9ca2b7',
        padding: 10
      }
    },
  },
};

function User({ isSidebarOpen, isSidebarHovered, groups, setResponse, setOtherGroups, setMyGroups, myGroups, myInfo }) {
  const [userInfo, setUserInfo] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [userSubjects, setUserSubjects] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [statsViewer, setStatsViewer] = useState('Daily');
  const [viewDate, setViewDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [userGroups, setUserGroups] = useState([]);
  const [userFriends, setUserFriends] = useState([]);
  const [clickedUser, setClickedUser] = useState(null);

  const [datumDateTime, setDateTimeDatum] = useState(DateTime.now());

  //time trend
  const [timeTrend, setTimeTrend] = useState({
    labels: [],
    datasets: []
  });

  //ranking trend
  const [rankingTrend, setRankingTrend] = useState({
    labels: [],
    datasets: []
  })

  const [isGroupPwModal, setIsGroupPwModal] = useState(false);
  const [joinTarget, setJoinTarget] = useState(null);

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
    const pathName = window.location.pathname.split('/');
    const selectedUserId = pathName[pathName.length - 1];

    fetch(`${serverOrigin}/account/profile/${selectedUserId}`, { method: 'get' })
      .then((response) => response.json())
      .then((data) => {

        if (data.success) {
          const { userInfo, subjectsInfo, friendsInfo } = data;
          const { datum_point } = userInfo;
          setUserInfo(userInfo);
          const sortedSubject = timelineSort(subjectsInfo);
          setUserSubjects(sortedSubject);
          const groupsArr = userInfo.groups.split(',');
          const userGroups = groups.filter(group => {
            return groupsArr.includes(group.group_id);
          });
          setUserFriends(friendsInfo)
          setUserGroups(userGroups);
          setDateTimeDatum(DateTime.fromSeconds(parseInt(datum_point)));
        };
      })
      .catch((error) => console.error(error));
  }, [groups, clickedUser]);

  const updateViewer = async (item) => {
    setStatsViewer(item);
  };

  const updateViewDate = (date) => {
    setViewDate(date);
  };


  useEffect(() => {
    if (!userInfo) return; // wait for userInfo to be defined
    const { user_id } = userInfo;
    const viewDateTime = DateTime.fromJSDate(viewDate).toUTC().toISODate().toString();
    fetch(`${serverOrigin}/ranking/user?userId=${user_id}&mode=${statsViewer.toLowerCase()}&date=${viewDateTime}`, {
      method: 'get'
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          //setRankings(data.rankings);
          const [labels, datasets] = updateRankingTrend(data.rankings, viewDate);
          setRankingTrend({
            labels, datasets
          });
        }
      })
      .catch((error) => console.error(error));
  }, [userInfo, statsViewer, viewDate]);

  useEffect(() => {
    if (!userSubjects.length || !statsViewer) return;
    console.log(userSubjects, statsViewer);
    
    /* Throws Error
    const [labels, datasets] = updateTimeTrend(userSubjects, statsViewer.toLowerCase());
    setTimeTrend({
      labels, datasets
    });
    */
  }, [userSubjects, statsViewer]);

  return (
    <div className={styles.UserContainer}>
      <CalendarModal isCalendarOpen={isCalendarOpen} setIsCalendarOpen={setIsCalendarOpen} updateViewDate={updateViewDate} viewDate={viewDate} />
      <StuckModal />
      <GroupPwModal
        setMyGroups={setMyGroups}
        setOtherGroups={setOtherGroups}
        setIsGroupPwModal={setIsGroupPwModal}
        isGroupPwModal={isGroupPwModal}
        joinTarget={joinTarget}
        setJoinGroupResponse={setResponse}
      />
      <div className={`Main ${isSidebarOpen || isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.profileContainer}>
          <div className={styles.row}>
            <div className={styles.divided}>
              <div id={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/${userInfo ? userInfo.user_id : ''}.jpeg")`, backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}
              ></div>
            </div>
            <div className={styles.divided} id={styles.profileInfo}>
              <p>{userInfo ? userInfo.name : ''}</p>
            </div>
          </div>
          <div className={styles.row} id={styles.buttons}>
            <div className={styles.divided}>
              <ChallengeBtn userInfo={userInfo} setResponse={setResponse} />
            </div>
            <div className={styles.divided}>
              <DmBtn userInfo={userInfo} setResponse={setResponse} />
            </div>
            <div className={styles.divided}>
              <FriendRequestBtn
                userInfo={userInfo}
                setResponse={setResponse}
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.divided} id={styles.description}>
              <p>Joined at {`${datumDateTime.toLocaleString(DateTime.DATE_FULL)}`}</p>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.infoContainer}>
              <div className={styles.iconWrapper}>
                <FontAwesomeIcon icon={faEarthAmericas} />
                {/* {userInfo ? <CountryViewer timezone={userInfo.timezone} /> : ''} */}
              </div>
              <div className={styles.info}>
                <p className={styles.infoTitle}>Timezone</p>
                <p>{userInfo ? userInfo.timezone : ''}</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.statsContainer}>
          <div className={styles.box}>
            <div className={styles.rowTitle}>
              {/* <DateSelectorBtn className={styles.title} viewDate={viewDate} isCalendarOpen={isCalendarOpen} setIsCalendarOpen={setIsCalendarOpen}></DateSelectorBtn> */}
              <div id={styles.viewerSelector}>
                <RadioBtn items={[{ view: 'Daily', value: 'Daily' }, { view: 'Weekly', value: 'Weekly' }, { view: 'Monthly', value: 'Monthly' }]} changeEvent={updateViewer} defaultViewer={0} />
              </div>
            </div>
            <div className={styles.rowTitle}>
              <h1>
                {statsViewer} Study Time Trend
              </h1>
            </div>
            <div className={styles.row}>
              <div className={styles.chartContainer}>
                <Chart
                  type="line"
                  series={[{
                    name: "Study Time",
                    data: timeTrend.datasets
                  }]}
                  options={{
                    chart: {
                      height: 350,
                      type: 'line',
                      zoom: {
                        enabled: false
                      }
                    },
                    dataLabels: {
                      enabled: false
                    },
                    stroke: {
                      curve: 'straight'
                    },
                    /* title: {
                      text: 'Product Trends by Month',
                      align: 'left'
                    }, */
                    grid: {
                      row: {
                        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                        opacity: 0.5
                      },
                    },
                    xaxis: {
                      categories: timeTrend.labels,
                      range: 7
                    },
                    yaxis: {
                      labels: {
                        formatter: function (sec) {
                          const {value, type} = secondConverter(sec);
                          return `${value} ${type}`;
                        }
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div className={styles.rowTitle}>
              <h1>
                {statsViewer} Ranking Trend
              </h1>
            </div>
            <div className={styles.row}>
              <div className={styles.chartContainer}>
              <Chart
                  type="line"
                  series={[{
                    name: "Ranking",
                    data: rankingTrend.datasets
                  }]}
                  options={{
                    chart: {
                      height: 350,
                      type: 'line',
                      zoom: {
                        enabled: false
                      }
                    },
                    dataLabels: {
                      enabled: false
                    },
                    stroke: {
                      curve: 'straight'
                    },
                    /* title: {
                      text: 'Product Trends by Month',
                      align: 'left'
                    }, */
                    grid: {
                      row: {
                        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                        opacity: 0.5
                      },
                    },
                    xaxis: {
                      categories: rankingTrend.labels,
                      range: 7
                    },
                    yaxis: {
                      reversed: true,
                      labels: {
                        formatter: function (val) {
                          return `#${val}`;
                        }
                      },
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className={`${styles.box} customScroll`}>
            <div className={styles.rowTitle}>
              <h1>{userInfo ? userInfo.name : ''}'s groups</h1>
            </div>
            <div className={`${styles.row} customScroll`} id={styles.groupsContainer}>
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
              {/* <GroupsGen setJoinGroupResponse={setResponse} groups={userGroups} setIsGroupPwModal={setIsGroupPwModal} searchQuery={""} userInfo={userInfo} queryTags={[]} setJoinTarget={setJoinTarget} /> */}
              {/* 
                            <GroupsGen
              myGroups={userGroups}
              groups={userGroups}
              
                setMyGroups={setMyGroups}
                setOtherGroups={setOtherGroups}
                setJoinGroupResponse={setResponse}
                setIsGroupPwModal={setIsGroupPwModal}
                setJoinTarget={setJoinTarget}
                userInfo={userInfo}
              />
              */}
            </div>
          </div>
          <div className={styles.box}>
            <div className={styles.rowTitle}>
              <h1>{userInfo ? userInfo.name : ''}'s friends</h1>
            </div>
            <div className={`${styles.row} customScroll`} id={styles.groupsContainer}>
              <FriendsViewer friends={userFriends} setClickedUser={setClickedUser} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default User;