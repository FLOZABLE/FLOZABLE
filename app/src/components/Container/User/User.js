import styles from "./User.module.css";
import React, { useState, useEffect, useRef } from 'react';
import StuckModal from '../../UI/StuckModal/StuckModal';
import BlobBtn from "../../UI/BlobBtn/BlobBtn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faComments, faEarthAmericas, faUser } from "@fortawesome/free-solid-svg-icons";
import { Punch } from "../../../utils/svgs";
import LineChart from "../../UI/LineChart";
import { timelineSort } from "../../../utils/timelineSorting";
import RadioBtn from "../../UI/RadioBtn/RadioBtn";
import CalendarModal from "../../UI/CalendarModal/CalendarModal";
import DateSelectorBtn from "../../UI/DateSelectorBtn/DateSelectorBtn";
import GroupsGen from "../../UI/GroupsGen/GroupsGen";
import { DateTime } from "luxon";
import { updateRankingTrend, updateTimeTrend } from "../Stats/StatTools";
import FriendsViewer from "../../UI/FriendsViewer/FriendsViewer";

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
  ...lineChartOption
};

rankingLinchartOpt.scales.y.reverse = true;

function User({ isSidebarOpen, isSidebarHovered, groups, setResponse }) {
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
    datasets:
      [
        {
          backgroundColor: "#fd7f6f",
          borderColor: "#fd7f6f",
          data: [],
        },
      ]
  });

  //ranking trend
  const [rankingTrend, setRankingTrend] = useState({
    labels: [],
    datasets:
      [
        {
          backgroundColor: "#fd7f6f",
          borderColor: "#fd7f6f",
          data: [],
        },
      ]
  })

  const [setOpenGroupPwModal, isSetOpenGroupPwModal] = useState(false);

  useEffect(() => {
    if (!groups) return;
    const pathName = window.location.pathname.split('/');
    const selectedUserId = pathName[pathName.length - 1];

    fetch(`${serverOrigin}/api/account/profile/${selectedUserId}`, { method: 'get' })
      .then((response) => response.json())
      .then((data) => {

        if (data.success) {
          const { userInfo, subjectsInfo, friendsInfo } = data;
          const { datum_point, friends } = userInfo;
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

  const requestFriend = () => {
    fetch(`${serverOrigin}/api/account/friend-request`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetId: userInfo.user_id }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {

        }
      })
      .catch((error) => console.error(error));
  }

  const requestChallenge = () => {
    fetch(`${serverOrigin}/api/challenges/challenge-request`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetId: userInfo.user_id }), //userInfo = user of the page you're viewing
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {

        }
      })
      .catch((error) => console.error(error));
  }

  const requestChat = () => {
    fetch(`${serverOrigin}/api/chat/chat-request`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetId: userInfo.user_id }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('gddd', data)
        setResponse(data);
        if (data.success) {

        }
      })
      .catch((error) => console.error(error));
  }

  const updateViewer = async (item) => {
    setStatsViewer(item);
  };

  const updateViewDate = (date) => {
    setViewDate(date);
  };


  useEffect(() => {
    if (!!!userInfo) return; // wait for userInfo to be defined
    const { user_id } = userInfo;
    const viewDateTime = DateTime.fromJSDate(viewDate).toUTC().toISODate().toString();
    fetch(`${serverOrigin}/api/ranking/user?userId=${user_id}&mode=${statsViewer.toLowerCase()}&date=${viewDateTime}`, {
      method: 'get'
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          //setRankings(data.rankings);
          const rankingTrend = updateRankingTrend(data.rankings, viewDate);
          setRankingTrend({
            labels: rankingTrend[0],
            datasets:
              [
                {
                  backgroundColor: "#fd7f6f",
                  borderColor: "#fd7f6f",
                  data: rankingTrend[1],
                },
              ]
          });
        }
      })
      .catch((error) => console.error(error));
  }, [userInfo, statsViewer, viewDate]);



  useEffect(() => {
    const timeTrend = updateTimeTrend(userSubjects, statsViewer);
    setTimeTrend({
      labels: timeTrend[0],
      datasets:
        [
          {
            backgroundColor: "#fd7f6f",
            borderColor: "#fd7f6f",
            data: timeTrend[1],
          },
        ]
    });
  }, [userSubjects, statsViewer]);

  return (
    <div className={styles.UserContainer}>
      <CalendarModal isCalendarOpen={isCalendarOpen} setIsCalendarOpen={setIsCalendarOpen} updateViewDate={updateViewDate} viewDate={viewDate} />
      <StuckModal />
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
              <div className={styles.blobWrapper}>
                <BlobBtn delay={-1} name={<Punch width={'18px'} height={'18px'} fill={'red'} />} setClicked={() => { requestChallenge() }} color1={'#fff'} color2={"var(--pink)"} opt={2} />
              </div>

              <div className={styles.hoverEl}>
                <p>Compete with {userInfo ? userInfo.name : ''}!</p>
              </div>
            </div>
            <div className={styles.divided}>
              <div className={styles.blobWrapper}>
                <BlobBtn delay={-1} name={<FontAwesomeIcon icon={faComments} />} setClicked={() => { requestChat() }} opt={2} />
              </div>
              <div className={styles.hoverEl}>
                <p>Chat with {userInfo ? userInfo.name : ''}!</p>
              </div>
            </div>
            <div className={styles.divided}>
              <div className={styles.blobWrapper}>
                <BlobBtn delay={-1} name={<>+<FontAwesomeIcon icon={faUser} /></>} setClicked={() => { requestFriend() }} color1={'#fff'} color2={"var(--purple)"} opt={2} />
              </div>

              <div className={styles.hoverEl}>
                <p>Become a friend with {userInfo ? userInfo.name : ''}!</p>
              </div>
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
                <LineChart
                  labels={timeTrend.labels}

                  datasets={timeTrend.datasets}

                  options={lineChartOption}
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
                <LineChart
                  labels={rankingTrend.labels}

                  datasets={rankingTrend.datasets}

                  options={rankingLinchartOpt}
                />
              </div>
            </div>
          </div>
          <div className={styles.box}>
            <div className={styles.rowTitle}>
              <h1>{userInfo ? userInfo.name : ''}'s groups</h1>
            </div>
            <div className={`${styles.row} customScroll`} id={styles.groupsContainer}>
              <GroupsGen setJoinGroupResponse={setResponse} groups={userGroups} setOpenGroupPwModal={setOpenGroupPwModal} searchQuery={""} userInfo={userInfo} queryTags={[]} />
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