import styles from "./User.module.css";
import React, { useState, useEffect, useRef } from 'react';
import StuckModal from '../../UI/StuckModal/StuckModal';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function User({ isSidebarOpen, isSidebarHovered }) {
  const [userInfo, setUserInfo] = useState(null);
  const [userSubject, setUserSubject] = useState(null);

  useEffect(() => {
    const pathName = window.location.pathname.split('/');
    const selectedUserId = pathName[pathName.length - 1];
    fetch(`${serverOrigin}/api/account/porfile/${selectedUserId}`, { method: 'post' })
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      if (data.success) {
        setUserSubject(data.userInfo);
        setUserSubject(data.subjectInfo);
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
            <div className={styles.divided} id={styles.profileImg}>
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