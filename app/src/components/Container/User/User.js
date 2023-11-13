import styles from "./User.module.css";
import React, { useState, useEffect, useRef } from 'react';
import StuckModal from '../../UI/StuckModal/StuckModal';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function User({ isSidebarOpen, isSidebarHovered }) {

  useEffect(() => {
    const pathName = window.location.pathname.split('/');
    const selectedUserId = pathName[pathName.length - 1];
    fetch(`${serverOrigin}/api/account/porfile/${selectedUserId}`, { method: 'post' })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        setPlans(data.plans.map(plan => { plan.saved = true; plan.start = new Date(plan.start * 1000 * 60); plan.end = new Date(plan.end * 1000 * 60); return plan }));
      };
    })
    .catch((error) => console.error(error));
  }, []);
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