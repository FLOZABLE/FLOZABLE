import React, { useEffect, useState } from "react";
import styles from "./MemberEl.module.css";
import { useSearchParams } from "react-router-dom";
import { StudyPerson, RestPerson } from "../../../utils/svgs";
import MemberTimer from "../MemberTimer/MemberTimer";

function MemberEl(props) {

  const { memberInfo } = [props];
  const [run, setRun] = useEffect(0);
  const [sec, setSec] = useSearchParams(0);
  const [studyIcon, setStudyIcon] = useState(<RestPerson width={'40px'} height={'40px'} opt1={'#000'} />)

  useEffect(() => {
    const studyInfo = memberInfo.study;
    if (studyInfo.study) {
      setRun(1);
      setSec(studyInfo.total);
      setStudyIcon(<StudyPerson opt1={'#000'} width={'40px'} height={'40px'} />);
    };
    console.log('memberInfo')
  }, [memberInfo]);

  return (
    <div className={styles.member} key={props.k}>
      <div className={styles.userName}>{memberInfo.name}</div>
      <div className={styles.icon}>
        {studyIcon}
      </div>
      <div className={styles.timer}>
        <MemberTimer run={run} sec={sec} />
      </div>
    </div>
  );
};

export default MemberEl;