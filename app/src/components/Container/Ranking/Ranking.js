import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faUser } from '@fortawesome/free-solid-svg-icons';
import {DateTime} from "luxon";
import StatsCalendar from '../../UI/StatsCalendar/StatsCalendar';
import StuckModal from '../../UI/StuckModal/StuckModal';
import RadioBtn from '../../UI/RadioBtn/RadioBtn';
import styles from './Ranking.module.css';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Ranking(props) {

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [viewer, setViewer] = useState('Daily');
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
    let startTime = DateTime.fromISO(JSON.stringify(viewDate).replaceAll("\"",""));
    /*
    FIXME: viewer defaults to current time if the user does not click any day on the calendar.
    Change it to the beginning of the day as default
    */
    console.log("start time:",startTime);

    let startUnix = Math.floor(startTime.ts / 1000); // in seconds
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
      //if (data.success){
        console.log('ranking', data);
        //alert("First place: " + data[0].id + " with " + data[0].total + " seconds studied\nSecond place: " + data[1].id + " with " + data[1].total + " seconds studied");
      //}
    })
    .catch((error) => console.error(error));
  }, [viewDate, viewer]);

  return (
    <div className={styles.RankingContainer}>
      <div className={`${styles.CalendarModal} ${isCalendarOpen ? styles.isOpen : ''}`}>
      <StatsCalendar onToggleCalendar={toggleCalendar} isCalendarOpen={isCalendarOpen} setViewDate={updateViewDate} viewDate={viewDate} />
      </div>
      <StuckModal />
      <div className={`Main ${props.isSidebarOpen || props.isSidebarHovered ? 'sidebarOpen' : ''}`}>
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
                <li>
                  <div className={styles.circle}>
                    ,
                    <p>1</p>
                  </div>
                  <div className={styles.userInfo}>
                    <div className={styles.profileImg}>
                      <FontAwesomeIcon icon={faUser}/>
                    </div>
                    <p className={styles.name}>KimTaehumMossol</p>
                    <div className={styles.ranking}>
                      <p>16h</p>
                      <div className={styles.dash}></div>
                      <p>12h</p>
                      <div className={styles.dash}></div>
                      <p>500h</p>
                    </div>
                  </div>
                </li>
                {/* <div className={styles.divider}></div> */}
                <li>
                  <div className={styles.circle}>
                    <p>1</p>
                  </div>
                  <div className={styles.userInfo}>
                    <div className={styles.profileImg}>
                      <FontAwesomeIcon icon={faUser}/>
                    </div>
                    <p className={styles.name}>KimTaehumMossol</p>
                    <div className={styles.ranking}>
                      <p>16h</p>
                      <div className={styles.dash}></div>
                      <p>12h</p>
                      <div className={styles.dash}></div>
                      <p>500h</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ranking;