import React, { useEffect, useState } from "react";
import styles from "./EventModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faBook, faClock, faFileLines, faXmark } from "@fortawesome/free-solid-svg-icons";
import styled from "@emotion/styled";
import TextEditor from "../TextEditor/TextEditor";
import DateSelector from "../DateSelector/DateSelector";
import DropDownButton from "../DropDownButton/DropDownButton";
import CuteToggleButton from "../CuteToggleButton/CuteToggleButton";
import BlobBtn from "../BlobBtn/BlobBtn";

function EventModal(props) {
  /* useEffect(() => {
    console.log('updated', props.viewDate)
  }, [props.viewDate]); */
  return (
    <div className={`${styles.EventModal} ${props.isModal ? styles.open : ''}`}>
      <div className={styles.header}>
        <i onClick={() => {props.setIsModal(false)}}>
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <div className={styles.container}>
        <div className={`${styles.wrapper} ${styles.title}`}>
          <div className={styles.iconWrapper}>
          </div>
          <div className={styles.contentWrapper}>
            <input type="text" placeholder="Enter title" value={props.title} onChange={(e) => {props.setTitle(e.target.value)}}/>
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
            <DateSelector start={props.start} setStart={props.setStart} end={props.end} setEnd={props.setEnd}/>
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faFileLines} />
            <div className={styles.hoverEl}>
              <p>Add Information</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <TextEditor 
            setDescription={props.setDescription}
            description={props.description}
            />
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
              <DropDownButton options={props.subjects} defaultIndex={0} setValue={props.setSubject} />
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
              <DropDownButton options={[{name:'no notification', value: -1}, {name: '5 minutes before', value: 5}, {name: '10 minutes before', value: 10}, {name: '30 minutes before', value: 30}, {name: '1 hour before', value: 60}]} defaultIndex={0} setValue={props.setNotification} />
            </div>

          </div>
        </div>
        <div className={styles.submit}>
          <BlobBtn name={'SUBMIT'} setClicked={props.setSubmit} />
        </div>
      </div>
    </div>
  );
}

export default EventModal;