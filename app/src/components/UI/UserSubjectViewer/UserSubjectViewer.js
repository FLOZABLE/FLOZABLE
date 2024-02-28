import styles from "./UserSubjectViewer.module.css";
import { socket } from "../../../socket";
import MemberTimer from "../MemberTimer/MemberTimer";
import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";

function UserSubjectViewer({ userInfo }) {
  const [isStudying, setIsStudying] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [subjectTotal, setSubjectTotal] = useState(0);
  const [subjectStart, setSubjectStart] = useState("");

  useEffect(() => {
    if (!userInfo) return;
    const { user_id, activeSubject } = userInfo;
    console.log('friend gd', activeSubject, userInfo);

    if (activeSubject) {
      const { name, id, time } = activeSubject;
      if (id !== '0') {
        setSubjectName(`Studying ${name}`);
      } else {
        setSubjectName(`Taking break`);
      }
      const liveTotal = DateTime.now().toSeconds().toFixed() - time;
      setIsStudying(true);
      setSubjectTotal(liveTotal);
    }

    const onStudying = (subjectInfo) => {
      const { name } = subjectInfo;
      console.log('subject', subjectInfo);
      setSubjectName(`Studying ${name}`);
      setSubjectTotal(Math.random());
      setIsStudying(true);
      setSubjectStart(DateTime.now().toFormat(DateTime.TIME_SIMPLE));
    };

    const onStopStudying = (status) => {
      if (status === 'disconnect') {
        setIsStudying(false);
        setSubjectStart("");
        return;
      };
      
      //rest
      setSubjectTotal(Math.random());
      setSubjectName(`Taking break`);
      setSubjectStart(DateTime.now().toFormat(DateTime.TIME_SIMPLE));
      //setSubjectName("taking break");
    };

    socket.on(`studying:${user_id}`, onStudying);
    socket.on(`stopStudying:${user_id}`, onStopStudying);

    return () => {
      socket.off(`studying:${user_id}`, onStudying);
      socket.off(`stopStudying:${user_id}`, onStopStudying);
    };
  }, [userInfo]);

  return (
    <div
      className={`${styles.UserSubjectViewer} ${isStudying ? styles.open : ""}`}
    >
      <p>{subjectName}</p>
      {subjectStart}
      <MemberTimer
        initialSec={subjectTotal}
        run={isStudying}
      />
    </div>
  );
}

export default UserSubjectViewer;
