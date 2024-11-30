import React, { useEffect, useState } from "react";
import styles from "./MyEl.module.css";
import { DateTime } from "luxon";
import { RestPerson, StudyPerson } from "@/app/utils/Svg";
import MyCamDisp from "../MyCamDisp/MyCamDisp";
import MyTimer from "../MyTimer/MyTimer";

function MyEl({ videoStream, userInfo }) {
  const [run, setRun] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!userInfo) return;

    const { study_time, activeSubject } = userInfo;

    if (activeSubject && activeSubject.subject_id !== "0") {
      setRun(true);
      const liveTotal =
        parseInt(study_time) +
        parseInt(DateTime.now().toSeconds()) -
        parseInt(activeSubject.time);
      setTotal(liveTotal);
    } else {
      setTotal(parseInt(study_time));
    }
  }, [userInfo]);

  return (
    <div className={styles.Member}>
      <MyCamDisp videoStream={videoStream} />
      <div className={styles.inner}>
        <div className={styles.userName}>{userInfo.name}</div>
        <i className={styles.icon}>{run ? <StudyPerson /> : <RestPerson />}</i>
        <div className={styles.timer}>
          <MyTimer run={run} initialSec={total} />
        </div>
      </div>
    </div>
  );
}

export default MyEl;
