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

function User({ isSidebarOpen, isSidebarHovered, groups }) {
  const [userInfo, setUserInfo] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [userSubject, setUserSubject] = useState(null);
  const [statsViewer, setStatsViewer] = useState('Daily');
  const [viewDate, setViewDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [calendarLabel, setCalendarLabel] = useState('Today');
  const [userGroups, setUserGroups] = useState([]);

  const [joinGroupResponse, setJoinGroupResponse] = useState(null);

  const [timeTrend, setTimeTrend] = useState({ datasets: [], labels: [] });
  const [setOpenGroupPwModal, isSetOpenGroupPwModal] = useState(false);

  useEffect(() => {
    const pathName = window.location.pathname.split('/');
    const selectedUserId = pathName[pathName.length - 1];
    
    fetch(`${serverOrigin}/api/account/profile/${selectedUserId}`, { method: 'get' })
      .then((response) => response.json())
      .then((data) => {
        
        if (data.success) {
          setUserInfo(data.userInfo);
          const sortedSubject = timelineSort(data.subjectInfo);
          setUserSubject(sortedSubject);
          const groupsArr = data.userInfo.groups.split(',');
          const userGroups = groupsArr.filter(userGroup => {
            return groups.find((group) => {return userGroup === group.id})
          });
          
        };
      })
      .catch((error) => console.error(error));
  }, []);

  const updateViewer = async (item) => {
    setStatsViewer(item);
  };


  const updateViewDate = (date) => {
    setViewDate(date);
  };


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
              <p>Jason</p>
            </div>
          </div>
          <div className={styles.row} id={styles.buttons}>
            <div className={styles.divided}>
              <div className={styles.blobWrapper}>
                <BlobBtn name={<Punch width={'18px'} height={'18px'} fill={'red'} />} setClicked={() => { }} color1={'#fff'} color2={"var(--pink)"} opt={2} />
              </div>

              <div className={styles.hoverEl}>
                <p>Compete with Jason!</p>
              </div>
            </div>
            <div className={styles.divided}>
              <div className={styles.blobWrapper}>
                <BlobBtn name={<FontAwesomeIcon icon={faComments} />} setClicked={() => { }} opt={2} />
              </div>
              <div className={styles.hoverEl}>
                <p>Become a friend with Jason!</p>
              </div>
            </div>
            <div className={styles.divided}>
              <div className={styles.blobWrapper}>
                <BlobBtn name={<>+<FontAwesomeIcon icon={faUser} /></>} setClicked={() => { }} color1={'#fff'} color2={"var(--purple)"} opt={2} />
              </div>

              <div className={styles.hoverEl}>
                <p>Become a friend with Jason!</p>
              </div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.divided} id={styles.description}>
              <p>I am a programer</p>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.infoContainer}>
              <div className={styles.iconWrapper}>
                <FontAwesomeIcon icon={faEarthAmericas} />
              </div>
              <div className={styles.info}>
                <p className={styles.infoTitle}>Timezone</p>
                <p>dfsdfd</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.statsContainer}>
          <div className={styles.box}>
            <div className={styles.rowTitle}>
              <DateSelectorBtn viewDate={viewDate} isCalendarOpen={isCalendarOpen} setIsCalendarOpen={setIsCalendarOpen} />
              <div id={styles.viewerSelector}>
                <RadioBtn items={[{ view: 'Daily', value: 'Daily' }, { view: 'Weekly', value: 'Weekly' }, { view: 'Monthly', value: 'Monthly' }]} changeEvent={updateViewer} defaultViewer={0} />
              </div>
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
          </div>
          <div className={styles.box}>
            <div className={styles.rowTitle}>
              <p>Jason's groups</p>
            </div>
            <div className={styles.row}>
            <GroupsGen setJoinGroupResponse={setJoinGroupResponse} groups={groups} setOpenGroupPwModal={setOpenGroupPwModal} searchQuery={""} userInfo={userInfo} queryTags={[]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default User;