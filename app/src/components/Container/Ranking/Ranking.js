import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faUser, faXmark } from '@fortawesome/free-solid-svg-icons';
import { DateTime } from "luxon";
import StatsCalendar from '../../UI/StatsCalendar/StatsCalendar';
import StuckModal from '../../UI/StuckModal/StuckModal';
import RadioBtn from '../../UI/RadioBtn/RadioBtn';
import styles from './Ranking.module.css';
import SmallCalendar from '../../UI/SmallCalendar/SmallCalendar';
import Search from '../../UI/Search/Search';
import CalendarModal from '../../UI/CalendarModal/CalendarModal';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Ranking({ isSidebarOpen, isSidebarHovered }) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [viewer, setViewer] = useState('Daily');
  const [rankingEl, setRankingEl] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [rankingSearch, setRankingSearch] = useState("");

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  const updateViewer = (data) => {
    setViewer(data);
  }

  const updateViewDate = (date) => {
    setViewDate(date);
    console.log(date, 'dd')
  };

  //fetch new ranking
  useEffect(() => {
    const viewTime = DateTime.fromJSDate(viewDate);

    let startTime;
    let stopTime;
    if (viewer == "Daily") {
      startTime = viewTime.startOf('day').toSeconds();
      stopTime = viewTime.endOf('day').toSeconds();
    }
    else if (viewer == "Weekly") {
      startTime = viewTime.startOf('week').toSeconds();
      stopTime = viewTime.endOf('week').toSeconds();
    }
    else if (viewer == "Monthly") {
      startTime = viewTime.startOf('month').toSeconds();
      stopTime = viewTime.endOf('month').toSeconds();
    }
    else {
      return;
    };
    console.log("start, stop",startTime,stopTime);
    fetch(`${serverOrigin}/api/ranking/sort`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ startTime, stopTime })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log('ranking', data.data);
          setRanking(data.data);
        }
      })
      .catch((error) => console.error(error));
  }, [viewDate, viewer]);

  useEffect(() => {
    setRankingEl(ranking.map(({ total, name, user_id }, i) => {
      if (!name.includes(rankingSearch)) return;
      return (
        <li key={i}>
          <div className={styles.circle}>
            <p>{i + 1}</p>
          </div>
          <div className={styles.userInfo}>
            <div className={styles.profileImg}
              style={{
                backgroundImage: `url("${serverOrigin}/profile-images/${user_id}.jpeg")`, backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* <FontAwesomeIcon icon={faUser} /> */}
            </div>
            <p className={styles.name}>{name}</p>
            <div className={styles.ranking}>
              <p>{(total / (60 * 60)).toFixed(2)}hr</p>
            </div>
          </div>
        </li>
      )
    }))
  }, [ranking, rankingSearch]);

  return (
    <div className={styles.RankingContainer}>
      <CalendarModal isCalendarOpen={isCalendarOpen} setIsCalendarOpen={setIsCalendarOpen} updateViewDate={updateViewDate} viewDate={viewDate}/>
      <StuckModal />
      <div className={`Main ${isSidebarOpen || isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.boxes}>
          <div className={styles.box} id="daily">
            <div className={styles.buttonArea}>
              <button className={styles.title}
                onClick={toggleCalendar}
              >{new Date(viewDate).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0) ? 'Today' : `${viewDate.getMonth() + 1}/${viewDate.getDate()}`} <FontAwesomeIcon icon={faCaretDown} style={{ color: "#545B77", }} className={styles.caret} /></button>
              <RadioBtn items={[{ view: 'Daily', value: 'Daily' }, { view: 'Weekly', value: 'Weekly' }, { view: 'Monthly', value: 'Monthly' }]} changeEvent={updateViewer} defaultViewer={0} />
            </div>
            <div className={`${styles.container} ${styles.rankingContainer}`}>
            <Search className={styles.Search} searchQuery = {rankingSearch} setSearchQuery = {setRankingSearch}></Search>
              <div className={styles.header}>
                <p>Hours</p>
              </div>
              <ul>
                {rankingEl}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ranking;