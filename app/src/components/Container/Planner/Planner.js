import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faHeart, faPeopleGroup, faPlus, faStopwatch } from '@fortawesome/free-solid-svg-icons';
import StuckModal from '../../UI/StuckModal/StuckModal';
import TopNotification from '../../UI/TopNotification/TopNotification';
import RadioBtn from "../../UI/RadioBtn/RadioBtn";
import styles from "./Planner.module.css";
import SmallCalendar from '../../UI/SmallCalendar/SmallCalendar';
import EventPlanner from '../../UI/EventPlanner/EventPlanner';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Planner(props) {
  const [viewMode, setViewMode] = useState('Day');
  const [viewDate, setViewDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [forceUdt, setForceUdt] = useState([]);
  const updateViewer = (item) => {
    setViewMode(item);
  };

  const updateViewDate = (date) => {
    setViewDate(date);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      //setForceUdt([]);
    }, 300);
    return (() => {
      clearInterval(timeoutId);
    })
  }, [props.isSidebarOpen, props.isSidebarHovered]);
  return (
    <div className={styles.GroupsContainer}>
      <TopNotification duration={1000} />
      <StuckModal />
      <div className={`Main ${props.isSidebarOpen || props.isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <div className={styles.title}>
              Planner
            </div>
            <RadioBtn items={['Day', 'Week', 'Month']} changeEvent={updateViewer} defaultViewer={0} />
          </div>
          <div className={styles.container}>
            <div className={styles.planner}>
              <EventPlanner viewDate={viewDate} setViewDate={updateViewDate} subjects={props.subjects} />
            </div>
            <div className={styles.widget}>
            <SmallCalendar viewOpt={viewMode} setViewDate={updateViewDate} viewDate={viewDate} />
            </div>
            {forceUdt}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Planner;