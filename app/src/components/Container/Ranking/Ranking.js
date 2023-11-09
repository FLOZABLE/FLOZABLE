import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faUser, faXmark } from '@fortawesome/free-solid-svg-icons';
import {DateTime} from "luxon";
import StatsCalendar from '../../UI/StatsCalendar/StatsCalendar';
import StuckModal from '../../UI/StuckModal/StuckModal';
import RadioBtn from '../../UI/RadioBtn/RadioBtn';
import styles from './Ranking.module.css';
import SmallCalendar from '../../UI/SmallCalendar/SmallCalendar';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Ranking({isSidebarOpen, isSidebarHovered}) {
  const [SmallCalendarApi, setSmallCalendarApi] = useState(null);
  const SmallCalendarRef = useRef(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [viewer, setViewer] = useState('Daily');
  const [rankingEl, setRankingEl] = useState([]);
  const [ranking, setRanking] = useState([]);

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

  useEffect(() => {
    let startTime =    DateTime.fromJSDate(viewDate);
    /*
    FIXME: viewer defaults to current time if the user does not click any day on the calendar.
    Change it to the beginning of the day as default
    */
    console.log("start time:",startTime);

    let startUnix = startTime.toSeconds();
    let endUnix = 0; //monthly only
    if (viewer == "Daily"){
      //Do nothing
    }
    else if (viewer == "Weekly"){
      console.log("Weekday is " + startTime.weekday + ", subtracting " + (86400 * (startTime.weekday - 1)) + " seconds to find the start of the week.");
      startUnix -= 84600 * (startTime.weekday - 1); //monday = 1, tuesday = 2, wednesday = 3...
    }
    else if (viewer == "Monthly"){
      console.log("Month-day is " + startTime.day + ", subtracting " + (86400 * (startTime.day - 1)) + " seconds to find the start of the month.");
      startUnix -= 84600 * (startTime.day - 1); //1 = 1, 2 = 2, (month-date)
      endUnix = startTime.endOf('month').ts + 1; //end of month in unix (add 1 ms for next month);
      endUnix = Math.floor(endUnix/1000);
      console.log("end of month is", endUnix);
    }
    else{
      return;
    }
    fetch(`${serverOrigin}/api/ranking/${viewer}`, { 
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date: startUnix, monthEnd: endUnix })
     })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log('ranking', data.data);
        setRanking(data.data);
      }
      //if (data.success){
        console.log('ranking', data);
        //alert("First place: " + data[0].id + " with " + data[0].total + " seconds studied\nSecond place: " + data[1].id + " with " + data[1].total + " seconds studied");
      //}
    })
    .catch((error) => console.error(error));
  }, [viewDate, viewer]);

  useEffect(() => {
    setRankingEl(ranking.map((user, i) => {
      return (
        <li key={i}>
        <div className={styles.circle}>
          <p>{i + 1}</p>
        </div>
        <div className={styles.userInfo}>
          <div className={styles.profileImg}>
            <FontAwesomeIcon icon={faUser}/>
          </div>
          <p className={styles.name}>{user.name}</p>
          <div className={styles.ranking}>
            <p>16h</p>
            <div className={styles.dash}></div>
            <p>12h</p>
            <div className={styles.dash}></div>
            <p>500h</p>
          </div>
        </div>
      </li>
      )
    }))
  }, [ranking]);

  return (
    <div className={styles.RankingContainer}>
      <div className={`${styles.CalendarModal} ${isCalendarOpen ? styles.isOpen : ''}`}>
        <div className={styles.modalHeader}>
          <i onClick={() => {setIsCalendarOpen(false)}}>
            <FontAwesomeIcon icon={faXmark} />
          </i>
        </div>
      <SmallCalendar width={"400px"} setViewDate={updateViewDate} viewDate={viewDate} SmallCalendarRef={SmallCalendarRef} SmallCalendarApi={SmallCalendarApi} setIsCalendarOpen={setIsCalendarOpen} />
      </div>
      <StuckModal />
      <div className={`Main ${isSidebarOpen || isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.boxes}>
          <div className={styles.box} id="daily">
            <div className={styles.buttonArea}>
              <button className={styles.title}
                onClick={toggleCalendar}
              >Today <FontAwesomeIcon icon={faCaretDown} style={{ color: "#545B77", }} className={styles.caret} /></button>
              <RadioBtn items={[{view: 'Daily', value: 'Daily'}, {view: 'Weekly', value: 'Weekly'}, {view: 'Monthly', value: 'Monthly'}]} changeEvent={updateViewer} defaultViewer={0} />
            </div>
            <div className={`${styles.container} ${styles.rankingContainer}`}>
              <div className={styles.header}>
                <p>Ranking</p>
                <p>Time</p>
                <p>Month</p>
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