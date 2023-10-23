import React, { useEffect, useState } from "react";
import styles from "./MemberEl.module.css";
import { useSearchParams } from "react-router-dom";
import { StudyPerson, RestPerson } from "../../../utils/svgs";
import MemberTimer from "../MemberTimer/MemberTimer";
import UserCamDisp from "../UserCamDisp/UserCamDisp";

function MemberEl(props) {
  const { memberInfo, toggleTimer, me, myTimerTotal, socket } = props;
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

  return (
    <div className={styles.member} key={props.k}>
      <UserCamDisp socket={socket} memberInfo={memberInfo} />
      <div className={styles.inner}>
        <div className={styles.userName}>{memberInfo.name}</div>
        <div className={styles.icon}>{studyIcon}</div>
        <div className={styles.timer}>
          <MemberTimer run={run} total={sec} me={me} myTimerTotal={myTimerTotal} />
        </div>
      </div>
    </div>
  );
}

export default MemberEl;