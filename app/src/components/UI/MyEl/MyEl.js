import React, { useEffect, useState } from "react";
import styles from "./MyEl.module.css";
import { StudyPerson, RestPerson } from "../../../utils/svgs";
import MyCamDisp from "../MyCamDisp/MyCamDisp";
import MyTimer from "../MyTimer/MyTimer";
import { DateTime } from "luxon";
import { socket } from "../../../socket";

function MyEl({ memberInfo, setStudyingMembers, audioStream, videoStream, isFocus, device }) {
  const [run, setRun] = useState(0);
  const [total, setTotal] = useState(0);
  const [studyIcon, setStudyIcon] = useState(
    <RestPerson width={"2.5rem"} height={"2.5rem"} opt1={"#fff"} />,
  );

  useEffect(() => {
    if (!memberInfo) return;
    const { totalTime, activeSubject, user_id } = memberInfo;

    if (activeSubject) {
      const { id, time } = activeSubject;
      if (id !== '0') {
        setRun(true);
        const liveTotal = parseInt(totalTime) + parseInt(DateTime.now().toSeconds()) - parseInt(time);
        setTotal(liveTotal);
        setStudyIcon(
          <StudyPerson
            opt1={"#fff"}
            opt2={"#fff"}
            width={"2.5rem"}
            height={"2.5rem"}
          />
        )
      } else {
        setTotal(parseInt(totalTime));
      };
    } else {
      setTotal(parseInt(totalTime));
    };

    const onStudying = () => {
      setRun(true);
      setStudyIcon(
        <StudyPerson
          opt1={"#fff"}
          opt2={"#fff"}
          width={"2.5rem"}
          height={"2.5rem"}
        />
      );
      setStudyingMembers(prev => [...prev, memberInfo]);
    };

    const onStopStudying = () => {
      setRun(false);
      setStudyIcon(
        <RestPerson width={"2.5rem"} height={"2.5rem"} opt1={"#fff"} />
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
  }, [memberInfo]);

  return (
    <div className={styles.member}>
      <MyCamDisp audioStream={audioStream} videoStream={videoStream} isFocus={isFocus} device={device} />
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