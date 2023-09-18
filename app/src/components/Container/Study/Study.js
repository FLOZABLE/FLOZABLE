import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faHeart, faPeopleGroup, faPlus, faStopwatch } from '@fortawesome/free-solid-svg-icons';
import TopNotification from '../../UI/TopNotification/TopNotification';
import styles from "./Study.module.css";
import { setGroupMembers, getMyGroups } from './StudyTool';
import MyGroupsViewer from '../../UI/MyGroupsViewer/MyGroupsViewer';
import YouTubePlayer from '../../UI/YouTubePlayer/YouTubePlayer';
import StudyHeader from '../../UI/StudyHeader/StudyHeader';
import PlanTimelineBar from '../../UI/PlanTimelineBar/PlanTimelineBar';
import AddSubjectModal from '../../UI/AddSubjectModal/AddSubjectModal';
import { sortSubjects } from '../../Container/Stats/StatTools';
const serverOrigin = process.env.REACT_APP_ORIGIN;

function Study(props) {

  const { isStudy, setIsStudy, subjects, setSubjects } = props;

  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [membersInfo, setMembersInfo] = useState([]);
  const [videoId, setVideoId] = useState('MYPVQccHhAQ');
  const [volume, setVolume] = useState(0);
  const [groupsBtn, setGroupsBtn] = useState(true);
  const [subject, setSubject] = useState(null);
  const [isAddSubjectModal, setIsAddSubjectModal] = useState(false);
  const [addSubjectResponse, setAddSubjectResponse] = useState(null);

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
    if (addSubjectResponse && addSubjectResponse.success) {
      setSubjects((prevSubjects) => sortSubjects([...prevSubjects]));
    }
  }, [addSubjectResponse]);

  useEffect(() => {
    console.log(myGroups)
    if (myGroups.length) {
      myGroups.map((group) => {
        props.socket.emit('joinRoom', group.group_id, props.userInfo.user_id);
        //props.socket.emit('onlineMembers');
      })
    };
  }, [myGroups]);

  /* useEffect(() => {
    props.socket.on('onlineMembers', (onlineMembers) => {
      console.log(onlineMembers)
    })
  }, []); */

  return (
    <div className={styles.StudyContainer}>
      <StudyHeader subjects={subjects} subject={subject} setSubject={setSubject} isStudy={isStudy} setIsStudy={setIsStudy} setVideoId={setVideoId} setVolume={setVolume} volume={volume} setGroupsBtn={setGroupsBtn} groupsBtn={groupsBtn} setIsAddSubjectModal={setIsAddSubjectModal} isAddSubjectModal={isAddSubjectModal} />
      <TopNotification duration={3000} response={addSubjectResponse} />
      <AddSubjectModal setIsAddSubjectModal={setIsAddSubjectModal} isAddSubjectModal={isAddSubjectModal} setAddSubjectResponse={setAddSubjectResponse} subjects={subjects} setSubjects={setSubjects} setSubject={setSubject} />
      <div className={`Main ${styles.Main} ${props.isSidebarOpen || props.isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={`${styles.myGroupsViewerWrapper} ${groupsBtn ? styles.open : ''}`}>
          <MyGroupsViewer myGroups={myGroups} mode={'study'} />
        </div>
        <div className={styles.PlanTimelineBarWrapper}>
          <PlanTimelineBar />
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