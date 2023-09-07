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

const StyleWrapper = styled.div`
.react-date-picker__inputGroup {
  display: flex;
  background-color: #fff;
  justify-content: center;
}
.react-date-picker__inputGroup input{
  width: 50px !important;
}
`;

function EventModal(props) {
  const [subjects, setSubjects] = useState([]);
  const [notification, setNotification] = useState(false);

  useEffect(() => {
    setSubjects(props.subjects.map((subject) => {
      return subject.name;
    }));
  }, [props.subjects])
  useEffect(() => {
    console.log('updated', props.viewDate)
  }, [props.viewDate]);
  return (
    <div className={`${styles.EventModal} ${props.isOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <i>
        <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <div className={styles.container}>
        <div className={`${styles.wrapper} ${styles.title}`}>
          <div className={styles.iconWrapper}>
          </div>
          <div className={styles.contentWrapper}>
            <input type="text" placeholder="Enter title"/>
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
            <DateSelector viewDate={props.viewDate} />
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
            <TextEditor />
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
              <DropDownButton options={subjects} defaultIndex={0} />
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
              <DropDownButton options={['no notification', '5 minutes before', '10 minutes before', '30 minutes before', '1 hour before']} defaultIndex={0} />
            </div>

          </div>
        </div>
        <div className={styles.submit}>
        <BlobBtn name={'SUBMIT'} setClicked={props.setSavePlan} />
        </div>
      </div>
    </div>
  );
}

export default EventModal;