import React, { useEffect, useState } from "react";
import styles from "./MemberEl.module.css";
import { Link } from "react-router-dom";
import { StudyPerson, RestPerson } from "../../../utils/svgs";
import MemberTimer from "../MemberTimer/MemberTimer";
import MemberCamDisp from "../MemberCamDisp.js/MemberCamDisp";
import { DateTime } from "luxon";
import { socket } from "../../../socket";

function MemberEl({ memberInfo, setStudyingMembers }) {
  const [run, setRun] = useState(0);
  const [track, setTrack] = useState(null);
  const [total, setTotal] = useState(0);
  const [studyIcon, setStudyIcon] = useState(
    <RestPerson width={"40px"} height={"40px"} opt1={"#fff"} />,
  );
  useEffect(() => {
    if (!memberInfo) return;
    const { totalTime, activeSubject, user_id } = memberInfo;

    if (activeSubject.time) {
      setRun(true);
      const now = DateTime.now().set({ millisecond: 0 }).toSeconds();
      const actualTime = totalTime + now - activeSubject.time;
      setTotal(actualTime);
    } else {
      setTotal(totalTime);
    };

    const onStudying = () => {
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
  }, [memberInfo]);

  return (
    <div className={styles.member}>
      <MemberCamDisp memberInfo={memberInfo} track={track} />
      <div className={styles.inner}>
        <Link to={`/dashboard/user/${memberInfo.user_id}`}>
          <div className={styles.userName}>{memberInfo.name}</div>
        </Link>
        <div className={styles.icon}>{studyIcon}</div>
        <div className={styles.timer}>
          <MemberTimer
            initialSec={total}
            initialStatus={run}
            userInfo={memberInfo}
          />
        </div>
      </div>
    </div>
  );
}

export default MemberEl;