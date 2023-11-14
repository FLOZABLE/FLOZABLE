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
      console.log(data)
      if (data.success) {
        
      };
    })
    .catch((error) => console.error(error));
  }, []);
  return (
    <div className={styles.UserContainer}>
      <StuckModal />
      <div className={`Main ${isSidebarOpen || isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.profileContainer}>
          <div className={styles.row}>
            <div className={styles.divided}>

            </div>
            <div className={styles.divided}>
              
              </div>
            <img src="" alt="" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default User;