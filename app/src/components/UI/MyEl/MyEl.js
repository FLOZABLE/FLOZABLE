import React, { useEffect, useState } from "react";
import styles from "./MyEl.module.css";
import { StudyPerson, RestPerson } from "../../../utils/svgs";
import MyCamDisp from "../MyCamDisp/MyCamDisp";
import MyTimer from "../MyTimer/MyTimer";
import { DateTime } from "luxon";

function MyEl({ memberInfo, stream, socket, setStudyingMembers }) {
  const [run, setRun] = useState(0);
  const [total, setTotal] = useState(0);
  const [studyIcon, setStudyIcon] = useState(
    <RestPerson width={"40px"} height={"40px"} opt1={"#fff"} />,
  );

  useEffect(() => {
    if (!memberInfo || !socket) return;
    const { totalTime, activeSubject, user_id } = memberInfo;
     if (activeSubject.time) {
      setRun(true);
      const now = DateTime.now().set({millisecond: 0}).toSeconds();
      const actualTime = totalTime + now - activeSubject.time;
      setTotal(actualTime);
     } else {
      setTotal(totalTime);
     };
    const onStudying = () => {
      setRun(true);
      console.log('start')
      setStudyIcon(
        <StudyPerson
          opt1={"#fff"}
          opt2={"#fff"}
          width={"40px"}
          height={"40px"}
        />
      );
      setStudyingMembers(prev => [...prev, memberInfo]);
    };

    const onStopStudying = () => {
      setRun(false);
      console.log('gd')
      setStudyIcon(
        <RestPerson width={"40px"} height={"40px"} opt1={"#fff"} />
      );
      setStudyingMembers(prevMembers => {
        return prevMembers.filter(member => {
          return member.user_id !== user_id;
        });
      });
    };

    socket.on(`studying:${user_id}`, onStudying);
    socket.on(`stopStudying:${user_id}`, onStopStudying);

    return () => {
      socket.off(`studying:${user_id}`, onStudying);
      socket.off(`stopStudying:${user_id}`, onStopStudying);
    };
  }, [socket, memberInfo]);

  return (
    <div className={styles.member}>
      <MyCamDisp stream={stream} />
      <div className={styles.inner}>
        <div className={styles.userName}>{memberInfo.name}</div>
        <div className={styles.icon}>{studyIcon}</div>
        <div className={styles.timer}>
          <MyTimer
            run={run}
            initialSec={total}
          />
        </div>
      </div>
    </div>
  );
}

export default MyEl;