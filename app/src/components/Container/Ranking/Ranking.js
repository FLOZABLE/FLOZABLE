import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faUser } from '@fortawesome/free-solid-svg-icons';
import StatsCalendar from '../../UI/StatsCalendar/StatsCalendar';
import StuckModal from '../../UI/StuckModal/StuckModal';
import RadioBtn from '../../UI/RadioBtn/RadioBtn';
import styles from './Ranking.module.css';

function Ranking(props) {

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  return (
    <div className={styles.RankingContainer}>
      <div className={`${styles.CalendarModal} ${isCalendarOpen ? styles.isOpen : ''}`}>
        <StatsCalendar onToggleCalendar={toggleCalendar} isCalendarOpen={isCalendarOpen} />
      </div>
      <StuckModal />
      <div className={`${styles.Main} ${props.isSidebarOpen || props.isSidebarHovered ? styles.sidebarOpen : ''}`}>
        <div className={styles.boxes}>
          <div className={styles.box} id="daily">
            <div className={styles.buttonArea}>
              <button className={styles.title}
                onClick={toggleCalendar}
              >Today <FontAwesomeIcon icon={faCaretDown} style={{ color: "#545B77", }} className={styles.caret} /></button>
              <RadioBtn items={['Daily', 'Weekly', 'Monthly']} />
            </div>
            <div className={`${styles.container} ${styles.rankingContainer}`}>
              <div className={styles.header}>
                <p>Day</p>
                <p>Week</p>
                <p>Month</p>
              </div>
              <ul>
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
                <div className={styles.divider}></div>
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