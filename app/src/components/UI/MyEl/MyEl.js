import React, { useEffect, useState } from "react";
import styles from "./MyEl.module.css";
import { useSearchParams } from "react-router-dom";
import { StudyPerson, RestPerson } from "../../../utils/svgs";
import MyCamDisp from "../MyCamDisp/MyCamDisp";
import MyTimer from "../MyTimer/MyTimer";

function MyEl(props) {
  const { memberInfo, toggleTimer, me, myTimerTotal, stream } = props;
  const [run, setRun] = useState(0);
  const [sec, setSec] = useState(0);
  const [studyIcon, setStudyIcon] = useState(
    <RestPerson width={'40px'} height={'40px'} opt1={'#fff'} />
  );

  useEffect(() => {
    const studyInfo = memberInfo.study;
    setSec(studyInfo.total);
    if (studyInfo.study) {
      setRun(1);
      setStudyIcon(
        <StudyPerson opt1={'#fff'} width={'40px'} height={'40px'} />
      );
    };
  }, [memberInfo]);

  useEffect(() => {
    if (stream) {
      setStudyIcon(null);
      return;
    };
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
  }, [toggleTimer, stream]);

  
  return (
    <div className={styles.member} key={props.k}>
      <MyCamDisp stream={stream} />
      <div className={styles.inner}>
        <div className={styles.userName}>{memberInfo.name}</div>
        <div className={styles.icon}>{studyIcon}</div>
        <div className={styles.timer}>
          <MyTimer run={run} total={sec} me={true} myTimerTotal={myTimerTotal} />
        </div>
      </div>
    </div>
  );
}

export default MyEl;