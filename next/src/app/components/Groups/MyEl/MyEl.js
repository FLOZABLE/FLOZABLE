import React, { useContext, useEffect, useState } from "react";
import styles from "./MyEl.module.css";
import { DateTime } from "luxon";
import { RestPerson, StudyPerson } from "@/app/utils/Svg";
import { socket } from "@/app/utils/socket";
import MyCamDisp from "../MyCamDisp/MyCamDisp";
import MyTimer from "../MyTimer/MyTimer";

function MyEl({ videoStream, userInfo }) {
  const [run, setRun] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!userInfo) return;
    const { study_time, activeSubject, user_id } = userInfo;

    if (activeSubject) {
      const { id, time } = activeSubject;
      if (id !== "0") {
        setRun(true);
        const liveTotal =
          parseInt(study_time) +
          parseInt(DateTime.now().toSeconds()) -
          parseInt(time);
        setTotal(liveTotal);
      } else {
        setTotal(parseInt(study_time));
      }
    } else {
      setTotal(parseInt(study_time));
    }

    const onStudying = () => {
      setRun(true);
    };

    const onStopStudying = () => {
      setRun(false);
    };

    socket.on(`studying:${user_id}`, onStudying);
    socket.on(`stopStudying:${user_id}`, onStopStudying);

    return () => {
      socket.off(`studying:${user_id}`, onStudying);
      socket.off(`stopStudying:${user_id}`, onStopStudying);
    };
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
