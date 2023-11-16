import React, { useEffect, useState } from "react";
import styles from "./MemberEl.module.css";
import { useSearchParams } from "react-router-dom";
import { StudyPerson, RestPerson } from "../../../utils/svgs";
import MemberTimer from "../MemberTimer/MemberTimer";
import MemberCamDisp from "../MemberCamDisp.js/MemberCamDisp";

function MemberEl(props) {
  const { memberInfo, toggleTimer, me, socket, usersTracks } = props;
  const [run, setRun] = useState(0);
  const [sec, setSec] = useState(0);
  const [track, setTrack] = useState(null);
  const [studyIcon, setStudyIcon] = useState(
    <RestPerson width={'40px'} height={'40px'} opt1={'#fff'} />
  );

  useEffect(() => {
    const {timerInfo, activeSubject} = memberInfo;
    if (timerInfo && timerInfo.total) {
      const total = memberInfo.timerInfo.total;
      setSec(total);
      
      if (activeSubject && activeSubject.id) {
        setRun(1);
        const now = Math.floor(new Date() / 1000);
        
        setSec(now - activeSubject.time + total);
        setStudyIcon(
          <StudyPerson opt1={'#fff'} opt2={'#fff'} width={'40px'} height={'40px'} />
        );
      };
    }
  }, [memberInfo]);

  useEffect(() => {
    //logic for stream data of user
    /* if (stream) {
      setStudyIcon(null);
      return;
    }; */
    if (toggleTimer.id === memberInfo.user_id) {
      setRun(toggleTimer.status);
      if (toggleTimer.status) {
        setStudyIcon(
          <StudyPerson opt1={'#fff'} opt2={'#fff'} width={'40px'} height={'40px'} />
        );
      } else {
        setStudyIcon(
          <RestPerson width={'40px'} height={'40px'} opt1={'#fff'} />
        );
      };
    };
  }, [toggleTimer]);

  useEffect(() => {
    usersTracks.map(userTracksData => {
      if (userTracksData.userId === memberInfo.user_id) {
        setTrack(userTracksData.track);
      }
    })
  }, [usersTracks, memberInfo]);

  return (
    <div className={styles.member} key={props.k}>
      <MemberCamDisp socket={socket} memberInfo={memberInfo} track={track} />
      <div className={styles.inner}>
        <div className={styles.userName}>{memberInfo.name}</div>
        <div className={styles.icon}>{studyIcon}</div>
        <div className={styles.timer}>
          <MemberTimer run={run} total={sec} me={me} />
        </div>
      </div>
    </div>
  );
}

export default MemberEl;