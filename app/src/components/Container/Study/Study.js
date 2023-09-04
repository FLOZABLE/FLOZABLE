import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faHeart, faPeopleGroup, faPlus, faStopwatch } from '@fortawesome/free-solid-svg-icons';
import TopNotification from '../../UI/TopNotification/TopNotification';
import styles from "./Study.module.css";
import { setGroupMembers, getMyGroups } from './StudyTool';
import MyGroupsViewer from '../../UI/MyGroupsViewer/MyGroupsViewer';
import YouTubePlayer from '../../UI/YouTubePlayer/YouTubePlayer';
import StudyHeader from '../../UI/StudyHeader/StudyHeader';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Study(props) {
  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [membersInfo, setMembersInfo] = useState([]);
  const [videoId, setVideoId] = useState('MYPVQccHhAQ');
  const [volume, setVolume] = useState(0);
  const [groupsBtn, setGroupsBtn] = useState(true);

  useEffect(() => {
    fetch(`${serverOrigin}/api/groups/bring-groups`, { method: 'post' })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          //setMyGroups(getMyGroups(props.userInfo, data.groups, data.membersInfo).myGroups);
          setMembersInfo(data.membersInfo);
          setAllGroups(data.groups);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    setMyGroups(getMyGroups(props.userInfo, allGroups, membersInfo).myGroups);
  }, [allGroups, props.userInfo]);

  useEffect(() => {
    console.log(myGroups)
    if (myGroups.length) {
      myGroups.map((group) => {
        props.socket.emit('joinRoom', group.group_id, props.userInfo.user_id);
        //props.socket.emit('onlineMembers');
      })
    };
  }, [myGroups]);

  useEffect(() => {
    props.socket.on('onlineMembers', (onlineMembers) => {
      console.log(onlineMembers)
    })
  }, []);

  return (
    <div className={styles.StudyContainer}>
      <StudyHeader setVideoId={setVideoId} setVolume={setVolume} volume={volume} setGroupsBtn={setGroupsBtn} groupsBtn={groupsBtn} />
      <TopNotification duration={3000} />
      <div className={`Main ${styles.Main} ${props.isSidebarOpen || props.isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={`${styles.myGroupsViewerWrapper} ${groupsBtn ? styles.open : ''}`}>
        <MyGroupsViewer myGroups={myGroups} mode={'study'}/>
        </div>
      </div>
      <div className={styles.ytBg}>
          <YouTubePlayer
            height={"100vh"}
            width={"100vw"}
            videoId={videoId}
            volume={volume}
          />
        </div>
    </div>
  )
}

export default Study;