import React, { useEffect, useState } from "react";
import styles from "./PlannerEventModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faBook, faClock, faFileLines, faRepeat, faXmark } from "@fortawesome/free-solid-svg-icons";
import styled from "@emotion/styled";
import TextEditor from "../TextEditor/TextEditor";
import DateSelector from "../DateSelector/DateSelector";
import DropDownButton from "../DropDownButton/DropDownButton";
import { DateTime } from "luxon";
import BlobBtn from "../BlobBtn/BlobBtn";
import SliderAnimation from "../SliderAnimation/SliderAnimation";

function PlannerEventModal({isAddPlanModal, setIsAddPlanModal, subjects, setIsAddSubjectModal, setNotification, title, setTitle, start, setStart, end, setEnd, repeat, setRepeat, description, setDescription, setSubject, subject, priority, setPriority, setPlanSubmit}) {
  
  return (
    <div className={`${styles.PlannerEventModal} modal ${isAddPlanModal ? 'open' : ''}`}>
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
              <DropDownButton options={subjects} defaultIndex={0} setValue={setSubject} />
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
          <BlobBtn name={'SUBMIT'} setClicked={setPlanSubmit} />
        </div>
      </div>
    </div>
  );
}

export default PlannerEventModal;