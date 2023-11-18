import React, { useEffect, useState } from "react";
import styles from "./EventModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faBook, faClock, faFileLines, faRepeat, faXmark } from "@fortawesome/free-solid-svg-icons";
import styled from "@emotion/styled";
import TextEditor from "../TextEditor/TextEditor";
import DateSelector from "../DateSelector/DateSelector";
import DropDownButton from "../DropDownButton/DropDownButton";
import CuteToggleButton from "../CuteToggleButton/CuteToggleButton";
import { DateTime } from "luxon";
import BlobBtn from "../BlobBtn/BlobBtn";
import SliderAnimation from "../SliderAnimation/SliderAnimation";
import generateRandomId from "../../../utils/RandomId";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function EventModal({isAddPlanModal, setIsAddPlanModal, subjects, setIsAddSubjectModal, setPlanSubmit, events, setEvents, setResponse}) {

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [repeat, setRepeat] = useState(0);
  const [priority, setPriority] = useState(50);
  const [notification, setNotification] = useState(-1);
  const [subject, setSubject] = useState(null);
  const [id, setId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [completed, setCompleted] = useState(false);

  const submit = () => {
    console.log('gd')
  }

  useEffect(() => {
    if (isAddPlanModal && isAddPlanModal.id) {
      const {id, title, start, end, description, repeat, subject, notification, priority, saved, completed} = isAddPlanModal;
      console.log(isAddPlanModal, isAddPlanModal.id, id, title, start, end, description, repeat, subject, notification, priority, saved, completed);
      setId(id);
      setTitle(title);
      setStart(start);
      setEnd(end);
      setDescription(description);
      setRepeat(repeat);
      setSubject(subject);
      setNotification(notification);
      setPriority(priority);
      setSaved(saved);
      setCompleted(completed);
    } else {
      //new event
      const id = generateRandomId(10);
      setId(id);
      console.log('gd', id)
      const newEvents = [...events, { title, start, end, description, repeat, subject, notification, priority, saved, completed, id}];
      setEvents(newEvents);
    }
  }, [isAddPlanModal]);

  useEffect(() => {
    const newEvents = [...events];
    const eventIndex = newEvents.findIndex((event) => event.id == id);
    console.log('new suject', subject)
    if (eventIndex !== -1) {
      newEvents[eventIndex] = { title, start, end, description, repeat, subject, notification, priority, saved, completed, id};
    };
    setEvents(newEvents)
  }, [title, start, end, description, repeat, subject, notification, priority, saved, completed, id]);

  function updatePlan() {
    const eventIndex = events.findIndex((event) => event.id == id);
    console.log('event index', eventIndex)
    if (eventIndex === -1) {
      //new subject
      const id = generateRandomId(10);
      setId(id);
      const start = new Date();
      const end = new Date();
      const newEvent = {
        id,
        title: '',
        start,
        end,
        description: '',
        repeat,
        subject,
        notification,
        priority,
        saved: false,
        completed: 0
      };

      const updatedEvents = [...events, newEvent];
      setStart(start);
      setEnd(end);
      //setEvents(updatedEvents);
      setIsAddPlanModal(newEvent);

      delete newEvent.saved;
      fetch(`${serverOrigin}/api/plan/update-plan`,
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newEvent)
        })
        .then((response) => response.json())
        .then((data) => {
          setResponse(data);
          if (data.success) {
            setEvents(updatedEvents);
            setIsAddPlanModal(false);
          };
        })
        .catch((error) => console.error(error));
    } else {
      const updatedEvents = [...events];
      updatedEvents[eventIndex] = { title, start, end, description, subject, saved, priority };
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
          setResponse(data);
          if (data.success) {
            setEvents(updatedEvents);
            setIsAddPlanModal(false);
          };
        })
        .catch((error) => console.error(error));
    }
  };


  
  return (
    <div className={`${styles.EventModal} modal ${isAddPlanModal ? 'open' : ''}`}>
      <div className={styles.header}>
        <i onClick={() => {setIsAddPlanModal(false)}}>
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <div className={styles.container}>
        <div className={`${styles.wrapper} ${styles.title}`}>
          <div className={styles.iconWrapper}>
          </div>
          <div className={styles.contentWrapper}>
            <input type="text" placeholder="Enter title" value={title} onChange={(e) => {setTitle(e.target.value)}}/>
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faClock} />
            <div className={styles.hoverEl}>
              <p>Select Time</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <DateSelector start={start} setStart={setStart} end={end} setEnd={setEnd}/>
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faFileLines} />
            <div className={styles.hoverEl}>
              <p>Add Description</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <TextEditor 
            setDescription={setDescription}
            description={description}
            />
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faRepeat} />
            <div className={styles.hoverEl}>
              <p>Repeat</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
          <DropDownButton options={[{name:'Does not repeat', value: 0}, {name: 'Daily', value: 1}, {name: 'Weekly', value: 2}, {name: `Monthly`, value: 3}]} defaultIndex={0} setValue={setRepeat} />
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faBook} />
            <div className={styles.hoverEl}>
              <p>Select Subject</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <div className={styles.subjectWrapper}>
              <DropDownButton options={subjects.map(subject => {
                const {name, id} = subject;
                return {name, value: subject.id}
              })} defaultIndex={0} setValue={setSubject} />
            </div>
            <p>OR</p>
            <div className={styles.addSubjectWrapper}>
              <BlobBtn name={'Add Subject'} setClicked={setIsAddSubjectModal} delay={-1} />
            </div>
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faBell} />
            <div className={styles.hoverEl}>
              <p>Select Notification</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <div className={styles.notificationWrapper}>
              <DropDownButton options={[{name:'no notification', value: -1}, {name: '5 minutes before', value: 5}, {name: '10 minutes before', value: 10}, {name: '30 minutes before', value: 30}, {name: '1 hour before', value: 60}]} defaultIndex={0} setValue={setNotification} />
            </div>

          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faBell} />
            <div className={styles.hoverEl}>
              <p>Select Notification</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <div className={styles.notificationWrapper}>
              <SliderAnimation min={0} max={100} step={1} sliderValue={priority} setSliderValue={setPriority} />
            </div>
          </div>
        </div>
        <div className={styles.submit}>
          <BlobBtn name={'SUBMIT'} setClicked={submit} />
        </div>
      </div>
    </div>
  );
}

export default EventModal;