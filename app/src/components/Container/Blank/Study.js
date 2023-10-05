import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faHeart, faPeopleGroup, faPlus, faStopwatch } from '@fortawesome/free-solid-svg-icons';
import StuckModal from '../../UI/StuckModal/StuckModal';
import TopNotification from '../../UI/TopNotification/TopNotification';
import styles from "./Study.module.css";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Study(props) {

  return (
    <div className={styles.GroupsContainer}>
      <TopNotification duration={2500} />
      <StuckModal />
      <div className={`Main ${props.isSidebarOpen || props.isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.boxes}>
          <div className={styles.box} id="daily">
            <div className={`${styles.container} ${styles.myGroups}`}>
            </div>
            <div className={`${styles.container} ${styles.allGroups}`}>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Study;