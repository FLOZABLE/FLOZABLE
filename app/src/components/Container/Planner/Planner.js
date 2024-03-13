import React, { useState, useEffect, useRef } from 'react';
import StuckModal from '../../UI/StuckModal/StuckModal';
import RadioBtn from "../../UI/RadioBtn/RadioBtn";
import styles from "./Planner.module.css";
import SmallCalendar from '../../UI/SmallCalendar/SmallCalendar';
import EventPlanner from '../../UI/EventPlanner/EventPlanner';
import PlanTimeline from '../../UI/PlanTimeline/PlanTimeline';
import { useSearchParams } from 'react-router-dom';
import GoogleLoginBtn from '../../UI/GoogleLoginBtn/GoogleLoginBtn';
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = process.env.REACT_APP_CLIENT_ID;

function Planner(props) {
  const { subjects, setSubjects, events, setEvents, setResponse, setIsAddSubjectModal, planModal, setPlanModal } = props;

  const [viewMode, setViewMode] = useState('timeGridWeek');
  const [viewDate, setViewDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [subject, setSubject] = useState('0000000000');
  const PlannerRef = useRef(null);
  const [PlannerApi, setPlannerApi] = useState(null);
  const SmallCalendarRef = useRef(null);
  const [SmallCalendarApi, setSmallCalendarApi] = useState(null);

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

  return (
    <div>
      {/* <AddSubjectModal setIsAddSubjectModal={setIsAddSubjectModal} isAddSubjectModal={isAddSubjectModal} setAddSubjectResponse={setResponse} subjects={subjects} setSubjects={setSubjects} setSubject={setSubject} /> */}
      <div className={`Main`}>
        <div className="title">
          Planner
        </div>
        <div className={styles.Planner}>
          <div className={styles.header}>
            <div className={styles.modeBtnWrapper}>
              <RadioBtn items={[{ view: 'Day', value: 'timeGridDay' }, { view: 'Week', value: 'timeGridWeek' }, { view: 'Month', value: 'dayGridMonth' }]} changeEvent={updateViewer} defaultViewer={1} />
            </div>
          </div>
          <div className={styles.container}>
            <div className={styles.planner}>
              <EventPlanner setResponse={setResponse} planModal={planModal} setPlanModal={setPlanModal} viewDate={viewDate} setViewDate={updateViewDate} viewMode={viewMode} subjects={subjects} events={events} setEvents={props.setEvents} PlannerRef={PlannerRef} PlannerApi={PlannerApi} SmallCalendarRef={SmallCalendarRef} SmallCalendarApi={SmallCalendarApi} setAddPlanResponse={setResponse} setIsAddSubjectModal={setIsAddSubjectModal} subject={subject} setSubject={setSubject} />
            </div>
            <div className={styles.widget}>
              <GoogleOAuthProvider
                clientId={googleClientId}
              >
                <GoogleLoginBtn />
              </GoogleOAuthProvider>
              <div className={styles.smallCalendarWrapper}>
                <SmallCalendar width={"100%"} setViewDate={updateViewDate} planModal={planModal} viewDate={viewDate} PlannerApi={PlannerApi} SmallCalendarRef={SmallCalendarRef} SmallCalendarApi={SmallCalendarApi} />
              </div>

              {/* <DropDownButton options={[{name:'Does not repeat', value: 0}, {name: 'Daily', value: 1}, {name: 'Weekly', value: 2}, {name: `Monthly`, value: 3}]} defaultIndex={0} setValue={setSubjectsOptions} /> */}
              <div className={`${styles.planTimelineWrapper}`}>
                <PlanTimeline plans={events} viewDate={viewDate} viewMode={viewMode} subjects={subjects} setPlans={props.setEvents} setPlanModal={setPlanModal} mode={"planner"} maxHeight='25rem' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Planner;