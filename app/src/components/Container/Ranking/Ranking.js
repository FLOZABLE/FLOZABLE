import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faUser } from '@fortawesome/free-solid-svg-icons';
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
    console.log(viewDate);
    let startDate = new Date(viewDate).getTime(); //fix to local time later
    if (!['Daily', 'Weekly', 'Monthly'].includes(viewer)) return;
    fetch(`${serverOrigin}/api/ranking/${viewer}`, { 
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date: Math.floor(startDate / 1000) })
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