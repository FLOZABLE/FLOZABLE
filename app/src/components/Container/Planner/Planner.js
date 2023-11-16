import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faHeart, faPeopleGroup, faPlus, faStopwatch } from '@fortawesome/free-solid-svg-icons';
import StuckModal from '../../UI/StuckModal/StuckModal';
import TopNotification from '../../UI/TopNotification/TopNotification';
import RadioBtn from "../../UI/RadioBtn/RadioBtn";
import styles from "./Planner.module.css";
import SmallCalendar from '../../UI/SmallCalendar/SmallCalendar';
import EventPlanner from '../../UI/EventPlanner/EventPlanner';
import AddSubjectModal from '../../UI/AddSubjectModal/AddSubjectModal';
import PlanTimeline from '../../UI/PlanTimeline/PlanTimeline';
import DropDownButton from '../../UI/DropDownButton/DropDownButton';

function Planner(props) {
  const { subjects, setSubjects, events, setResponse, setIsAddSubjectModal } = props;

  const [viewMode, setViewMode] = useState('timeGridWeek');
  const [viewDate, setViewDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [subject, setSubject] = useState('0000000000');
  const PlannerRef = useRef(null);
  const [PlannerApi, setPlannerApi] = useState(null);
  const SmallCalendarRef = useRef(null);
  const [SmallCalendarApi, setSmallCalendarApi] = useState(null);
  const [addPlanResponse, setAddPlanResponse] = useState(null);
  const [isAddPlanModal, setIsAddPlanModal] = useState(false);
  //const [isAddSubjectModal, setIsAddSubjectModal] = useState(false);
  const [subjectsOptions, setSubjectsOptions] = useState(null);

  const [addSubjectResponse, setAddSubjectResponse] = useState(null);

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

  useEffect(() => {
    setAddPlanResponse(addSubjectResponse);
  }, [addSubjectResponse]);

  return (
    <div className={styles.PlannerContainer}>
      <StuckModal />
      {/* <AddSubjectModal setIsAddSubjectModal={setIsAddSubjectModal} isAddSubjectModal={isAddSubjectModal} setAddSubjectResponse={setResponse} subjects={subjects} setSubjects={setSubjects} setSubject={setSubject} /> */}
      <div className={`Main ${props.isSidebarOpen || props.isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <div className={styles.title}>
              Planner
            </div>
            <RadioBtn items={[{ view: 'Day', value: 'timeGridDay' }, { view: 'Week', value: 'timeGridWeek' }, { view: 'Month', value: 'dayGridMonth' }]} changeEvent={updateViewer} defaultViewer={1} />
          </div>
          <div className={styles.container}>
            <div className={styles.planner}>
              <EventPlanner setResponse={setResponse} isAddPlanModal={isAddPlanModal} setIsAddPlanModal={setIsAddPlanModal} viewDate={viewDate} setViewDate={updateViewDate} viewMode={viewMode} subjects={subjects} events={events} setEvents={props.setEvents} PlannerRef={PlannerRef} PlannerApi={PlannerApi} SmallCalendarRef={SmallCalendarRef} SmallCalendarApi={SmallCalendarApi} addPlanResponse={addPlanResponse} setAddPlanResponse={setResponse} setIsAddSubjectModal={setIsAddSubjectModal} subject={subject} setSubject={setSubject} />
            </div>
            <div className={styles.widget}>
              <div className={styles.smallCalendarWrapper}>
              <SmallCalendar width={"300px"} setViewDate={updateViewDate}  isAddPlanModal={isAddPlanModal} viewDate={viewDate} PlannerApi={PlannerApi} SmallCalendarRef={SmallCalendarRef} SmallCalendarApi={SmallCalendarApi} />
              </div>
              
              {/* <DropDownButton options={[{name:'Does not repeat', value: 0}, {name: 'Daily', value: 1}, {name: 'Weekly', value: 2}, {name: `Monthly`, value: 3}]} defaultIndex={0} setValue={setSubjectsOptions} /> */}
              <div className={`${styles.planTimelineWrapper} customScroll`}>
              <PlanTimeline plans={events} viewDate={viewDate} viewMode={viewMode} subjects={subjects} setPlans={props.setEvents} setIsAddPlanModal={setIsAddPlanModal} mode={"planner"}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Planner;