import styles from "./User.module.css";
import React, { useState, useEffect, useRef } from 'react';
import StuckModal from '../../UI/StuckModal/StuckModal';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function User({ isSidebarOpen, isSidebarHovered }) {
  return (
    <div className={styles.RankingContainer}>
      <StuckModal />
      <div className={`Main ${isSidebarOpen || isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.boxes}>
          <div className={styles.box}>
            <p>d</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default User;