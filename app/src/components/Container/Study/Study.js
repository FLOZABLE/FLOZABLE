import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faHeart, faPeopleGroup, faPlus, faStopwatch } from '@fortawesome/free-solid-svg-icons';
import TopNotification from '../../UI/TopNotification/TopNotification';
import styles from "./Study.module.css";
import { setGroupMembers, getMyGroups } from './StudyTool';
import MyGroupsViewer from '../../UI/MyGroupsViewer/MyGroupsViewer';
import YouTubePlayer from '../../UI/YouTubePlayer/YouTubePlayer';
import StudyHeader from '../../UI/StudyHeader/StudyHeader';
import PlanTimelineBar from '../../UI/PlanTimelineBar/PlanTimelineBar';
import AddSubjectModal from '../../UI/AddSubjectModal/AddSubjectModal';
import EventModal from '../../UI/EventModal/EventModal';
import { sortSubjects } from '../../Container/Stats/StatTools';
import { generateRandomId } from "../../../utils/RandomId";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Study(props) {

  const { isStudy, setIsStudy, subjects, setSubjects, socket, userInfo, events, setEvents, reset } = props;

  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [membersInfo, setMembersInfo] = useState([]);
  const [videoId, setVideoId] = useState('MYPVQccHhAQ');
  const [volume, setVolume] = useState(0);
  const [groupsBtn, setGroupsBtn] = useState(true);
  const [timerSubject, setTimerSubject] = useState(null);
  const [isAddSubjectModal, setIsAddSubjectModal] = useState(false);
  const [isAddPlanModal, setIsAddPlanModal] = useState(false);
  const [addSubjectResponse, setAddSubjectResponse] = useState(null);
  const [myTimerTotal, setMyTimerTotal] = useState(0);
  const [viewDate, setViewDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [addPlanResponse, setAddPlanResponse] = useState(null);


  //events
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectsOpt, setSubjectsOpt] = useState([]);
  const [subject, setSubject] = useState(null);
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [repeat, setRepeat] = useState(0);
  const [priority, setPriority] = useState(50);
  const [notification, setNotification] = useState(-1);
  const [submit, setSubmit] = useState(false);

  useEffect(() => {
    fetch(`${serverOrigin}/api/groups/bring-groups`, { method: 'post' })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          //setMyGroups(getMyGroups(props.userInfo, data.groups, data.membersInfo).myGroups);
          setMembersInfo(data.membersInfo);
          setAllGroups(data.groups);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    if (reset) {
      window.alert(JSON.stringify(subject))
    };
  }, [reset])

  useEffect(() => {
    setMyGroups(getMyGroups(props.userInfo, allGroups, membersInfo).myGroups);
  }, [allGroups, props.userInfo]);

  useEffect(() => {
    if (addSubjectResponse && addSubjectResponse.success) {
      setSubjects((prevSubjects) => sortSubjects([...prevSubjects]));
    }
  }, [addSubjectResponse]);

  useEffect(() => {
    if (subjects.daily && subjects.daily.groupedTotal[subjects.daily.groupedTotal.length - 1]) {
      setMyTimerTotal(subjects.daily.groupedTotal[subjects.daily.groupedTotal.length - 1]);
    };
  }, [subjects]);

  useEffect(() => {
    if (myGroups.length) {
      myGroups.map((group) => {
        //props.socket.emit('joinRoom', group.group_id, props.userInfo.user_id);
        //props.socket.emit('onlineMembers');
      })
    };
  }, [myGroups]);

  useEffect(() => {
    socket.on('onlineMembers', (onlineMembers) => {
      //console.log(onlineMembers)
    })
  }, []);

  //handle submit
  useEffect(() => {
    if (submit) {
      updatePlan(selectedEvent, title, start, end, description, subject, priority);
    };
  }, [submit]);

  function updatePlan(selectedEvent, title, start, end, description, subject, priority) {
    const eventIndex = events.findIndex((event) => event.id == selectedEvent);
    if (eventIndex !== -1) {
      const updatedEvents = [...events];
      updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], title: title, start: start, end: end, description: description, subject: subject, saved: true, priority: priority };
      const planInfo = {
        ...updatedEvents[eventIndex],
        start: Math.floor(start.getTime() / (1000 * 60)),
        end: Math.floor(end.getTime() / (1000 * 60)),
      }

      delete planInfo.saved;
      fetch(`${serverOrigin}/api/plan/update-plan`,
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(planInfo)
        })
        .then((response) => response.json())
        .then((data) => {
          setAddPlanResponse(data);
          if (data.success) {
            setEvents(updatedEvents);
            setIsAddPlanModal(false);
          };
        })
        .catch((error) => console.error(error));
    };
  };

  useEffect(() => {
    if (!isAddPlanModal) {
      const eventIndex = events.findIndex((event) => event.id == selectedEvent);
      setTitle("");
      if (eventIndex !== -1) {
        const updatedEvents = [...events];
        if (!updatedEvents[eventIndex].saved) {
          updatedEvents.splice(eventIndex, 1);
          setEvents(updatedEvents);
        };
      };
      setSelectedEvent(null);
    } else if (!selectedEvent) {
      const id = generateRandomId(10);
      setSelectedEvent(id);
      const newEvent = {
        id: id,
        title: '',
        start: start,
        end: end,
        description: '',
        repeat: repeat,
        subject: subject,
        notification: notification,
        priority: priority,
        saved: false,
        completed: 0
      };
      setStart(start);
      setEnd(end);
      setEvents([...events, newEvent]);
      setIsAddPlanModal(true);
    }
  }, [isAddPlanModal]);

  useEffect(() => {
    setSubjectsOpt([...subjects.map((subject) => {
      return { name: subject.name, value: subject.id };
    }), { name: 'others', value: '0000000000' }]);
  }, [subjects]);

  useEffect(() => {
    setAddPlanResponse(addSubjectResponse);
  }, [addSubjectResponse]);

  useEffect(() => {
    if (selectedEvent) {
      const eventIndex = events.findIndex((event) => event.id == selectedEvent);
      if (eventIndex !== -1) {
        const updatedEvents = [...events];
        updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], title: title, start: start, end: end, subject: subject, priority: priority };
        if (start.getTime() > end.getTime()) {
        } else {
          setEvents(updatedEvents)
        }
      }
    };
  }, [title, start, end, subject]);

  return (
    <div className={styles.StudyContainer}>
      <StudyHeader subjects={subjects} subject={timerSubject} setSubject={setTimerSubject} isStudy={isStudy} setIsStudy={setIsStudy} setVideoId={setVideoId} setVolume={setVolume} volume={volume} setGroupsBtn={setGroupsBtn} groupsBtn={groupsBtn} setIsAddSubjectModal={setIsAddSubjectModal} isAddSubjectModal={isAddSubjectModal} setMyTimerTotal={setMyTimerTotal} events={events} setEvents={setEvents} setIsAddPlanModal={setIsAddPlanModal} mode={"study"} reset={reset} />
      <TopNotification duration={3000} response={addPlanResponse} />
      <EventModal
        isAddPlanModal={isAddPlanModal}
        setIsAddPlanModal={setIsAddPlanModal}
        title={title}
        setTitle={setTitle}
        setStart={setStart}
        start={start}
        setEnd={setEnd}
        end={end}
        description={description}
        setDescription={setDescription}
        setSubject={setSubject}
        subjects={subjectsOpt}
        notification={notification}
        setNotification={setNotification}
        submit={submit}
        setSubmit={setSubmit}
        repeat={repeat}
        setRepeat={setRepeat}
        priority={priority}
        setPriority={setPriority}
        setIsAddSubjectModal={setIsAddSubjectModal}
      />
      <AddSubjectModal setIsAddSubjectModal={setIsAddSubjectModal} isAddSubjectModal={isAddSubjectModal} setAddSubjectResponse={setAddSubjectResponse} subjects={subjects} setSubjects={setSubjects} setSubject={setSubject} />
      <div className={`Main ${styles.Main} ${props.isSidebarOpen || props.isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={`${styles.myGroupsViewerWrapper} ${groupsBtn ? styles.open : ''}`}>
          <MyGroupsViewer myGroups={myGroups} setMyGroups={setMyGroups} mode={'study'} socket={socket} userInfo={userInfo} subjects={subjects} myTimerTotal={myTimerTotal} />
        </div>
        <div className={styles.PlanTimelineBarWrapper}>
          <PlanTimelineBar events={events} subjects={subjects} />
        </div>
      </div>
      <div className={styles.ytBg}>
        <YouTubePlayer
          height={"100vh"}
          width={"100vw"}
          videoId={videoId}
          volume={volume}
        />
      </div>
    </div>
  )
}

export default Study;