import React, { useEffect, useState } from "react";
import styles from "./MemberEl.module.css";
import { Link } from "react-router-dom";
import { StudyPerson, RestPerson } from "../../../utils/svgs";
import MemberTimer from "../MemberTimer/MemberTimer";
import MemberCamDisp from "../MemberCamDisp.js/MemberCamDisp";
import { DateTime } from "luxon";
import { socket } from "../../../socket";

function MemberEl({ memberInfo, setStudyingMembers, device, isFocus, recvTransport, isHeadphone }) {
  const [run, setRun] = useState(false);
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
      setStudyIcon(
        <StudyPerson
          opt1={"#fff"}
          opt2={"#fff"}
          width={"2.5rem"}
          height={"2.5rem"}
        />
      );
      setStudyingMembers(prev => [...prev, memberInfo]);
      setRun(true);
    };

    const onStopStudying = () => {
      setStudyIcon(
        <RestPerson width={"2.5rem"} height={"2.5rem"} opt1={"#fff"} />
      );
      setStudyingMembers(prevMembers => {
        return prevMembers.filter(member => {
          return member.user_id !== user_id;
        });
      });
      setRun(false);
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
      <MemberCamDisp memberInfo={memberInfo} device={device} isFocus={isFocus} recvTransport={recvTransport} isHeadphone={isHeadphone} />
      <div className={styles.inner}>
        <Link to={`/dashboard/user/${memberInfo.user_id}`}>
          <div className={styles.userName}>{memberInfo.name}</div>
        </Link>
        <div className={styles.icon}>{studyIcon}</div>
        <div className={styles.timer}>
          <MemberTimer
            initialSec={total}
            run={run}
          />
        </div>
      </div>
    </div>
  );
}

export default MemberEl;