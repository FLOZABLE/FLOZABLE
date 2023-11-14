import styles from "./User.module.css";
import React, { useState, useEffect, useRef } from 'react';
import StuckModal from '../../UI/StuckModal/StuckModal';
import BlobBtn from "../../UI/BlobBtn/BlobBtn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faUser } from "@fortawesome/free-solid-svg-icons";
import { Punch } from "../../../utils/svgs";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function User({ isSidebarOpen, isSidebarHovered }) {
  const [userInfo, setUserInfo] = useState(null);
  const [userSubject, setUserSubject] = useState(null);

  const [isAddFriendBtn, setIsAddFriendBtn] = useState(false);
  const [isMsgBtn, setIsMsgBtn] = useState(false);
  const [isCompareBtn, setIsCompareBtn] = useState(false);

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
            <div className={styles.divided}>
              <div id={styles.profileImg}></div>
            </div>
            <div className={styles.divided}>
              <p>Jason</p>
            </div>
            <img src="" alt="" />
          </div>
          <div className={styles.row} id={styles.buttons}>
            <div className={styles.divided}>
              <div className={styles.blobWrapper}>
              <BlobBtn name={<Punch width={'18px'} height={'18px'} fill={'red'}/>} setClicked={() => {}} color1={'#fff'} color2={"var(--pink)"} opt={2}/>
              </div>
            
            <div className={styles.hoverEl}>
              <p>Compete with Jason!</p>
            </div>
            </div>
            <div className={styles.divided}>
              <div className={styles.blobWrapper}>
              <BlobBtn name={<FontAwesomeIcon icon={faComments} />} setClicked={() => {}} color1={'#fff'} color2={"var(--pink)"} opt={2} />
              </div>
            <div className={styles.hoverEl}>
              <p>Become a friend with Jason!</p>
            </div>
            </div>
            <div className={styles.divided}>
              <div className={styles.blobWrapper}>
              <BlobBtn name={<>+<FontAwesomeIcon icon={faUser} /></>} setClicked={() => {}} color1={'#fff'} color2={"var(--purple)"} opt={2} />
              </div>
            
            <div className={styles.hoverEl}>
              <p>Become a friend with Jason!</p>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default User;