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
  const [viewMode, setViewMode] = useState('timeGridWeek');
  const [viewDate, setViewDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const PlannerRef = useRef(null);
  const [PlannerApi, setPlannerApi] = useState(null);
  const SmallCalendarRef = useRef(null);
  const [SmallCalendarApi, setSmallCalendarApi] = useState(null);
  const [forceUdt, setForceUdt] = useState([]);
  const updateViewer = (item) => {
    setViewMode(item);
  };

  const updateViewDate = (date) => {
    setViewDate(date);
  };

  useEffect(() => {
    setPlannerApi(PlannerRef.current.getApi());
  }, [PlannerRef]);

  useEffect(() => {
    setSmallCalendarApi(SmallCalendarRef.current.getApi());
  }, [SmallCalendarRef]);

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
            <RadioBtn items={[{view: 'Day', value: 'timeGridDay'}, {view: 'Week', value: 'timeGridWeek'}, {view: 'Month', value: 'dayGridMonth'}]} changeEvent={updateViewer} defaultViewer={1} />
          </div>
          <div className={styles.container}>
            <div className={styles.planner}>
              <EventPlanner viewDate={viewDate} setViewDate={updateViewDate} viewMode={viewMode} subjects={props.subjects} plans={props.plans} PlannerRef={PlannerRef} PlannerApi={PlannerApi} SmallCalendarRef={SmallCalendarRef} SmallCalendarApi={SmallCalendarApi} />
            </div>
            <div className={styles.widget}>
            <SmallCalendar viewOpt={viewMode} setViewDate={updateViewDate} viewDate={viewDate} PlannerRef={PlannerRef} PlannerApi={PlannerApi} SmallCalendarRef={SmallCalendarRef} SmallCalendarApi={SmallCalendarApi} />
            </div>
            {forceUdt}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Planner;