import React, { useContext, useEffect, useState } from "react";
import styles from "./MyEl.module.css";
import { DateTime } from "luxon";
import { RestPerson, StudyPerson } from "@/app/utils/Svg";
import { socket } from "@/app/utils/socket";
import MyCamDisp from "../MyCamDisp/MyCamDisp";
import MyTimer from "../MyTimer/MyTimer";
import { UserInfoContext } from "@/app/utils/Contexts";

function MyEl({ setStudyingMembers, videoStream }) {
  const {userInfo} = useContext(UserInfoContext);

  const [run, setRun] = useState(0);
  const [total, setTotal] = useState(0);
  const [studyIcon, setStudyIcon] = useState(
    <RestPerson width={"2.5rem"} height={"2.5rem"} opt1={"#fff"} />,
  );

  useEffect(() => {
    if (!userInfo) return;
    const { totalTime, activeSubject, user_id } = userInfo;

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
      setStudyingMembers(prev => [...prev, userInfo]);
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
  }, [userInfo]);

  return (
    <div className={styles.member}>
      <MyCamDisp videoStream={videoStream} />
      <div className={styles.inner}>
        <div className={styles.userName}>{userInfo.name}</div>
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