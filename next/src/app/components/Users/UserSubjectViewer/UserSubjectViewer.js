import styles from "./UserSubjectViewer.module.css";
import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";
import MemberTimer from "@/app/components/Groups/MemberTimer/MemberTimer";
import { socket } from "@/app/utils/socket";

function UserSubjectViewer({ userInfo }) {
  const [isStudying, setIsStudying] = useState(false);
  const [subjectName, setSubjectName] = useState("Offline");
  const [subjectTotal, setSubjectTotal] = useState(0);
  const [subjectStart, setSubjectStart] = useState("");

  useEffect(() => {
    if (!userInfo) return;
    const { activeSubject } = userInfo;

    if (activeSubject) {
      const { name, subject_id, time } = activeSubject;
      if (subject_id !== "0") {
        setSubjectName(`Studying ${name}`);
      } else {
        setSubjectName(`Taking break`);
      }
      const liveTotal = DateTime.now().toSeconds().toFixed() - time;
      setIsStudying(true);
      setSubjectTotal(liveTotal);
    }

    const onStudying = (userId, subject) => {
      if (userId !== userInfo.user_id) return;

      const { name, subject_id } = subject;
      if (subject_id !== "0") {
        setSubjectName(`Studying ${name}`);
      } else {
        setSubjectName(`Taking break`);
      }
      setSubjectTotal(Math.random());
      setIsStudying(true);
      setSubjectStart(DateTime.now().toFormat(DateTime.TIME_SIMPLE));
    };

    const onStopStudying = (userId, { status }) => {
      if (userId !== userInfo.user_id) return;

      if (status === "disconnect") {
        setIsStudying(false);
        setSubjectName("Offline");
        setSubjectStart("");
        return;
      }

      //rest
      setSubjectTotal(Math.random());
      setSubjectName(`Taking break`);
      setSubjectStart(DateTime.now().toFormat(DateTime.TIME_SIMPLE));
    };

    socket.on(`studying`, onStudying);
    socket.on(`stopStudying`, onStopStudying);

    return () => {
      socket.off(`studying`, onStudying);
      socket.off(`stopStudying`, onStopStudying);
    };
  }, [userInfo]);

  return (
    <div className={styles.UserSubjectViewer}>
      <p>{subjectName}</p>
      {subjectStart}
      {isStudying ? (
        <MemberTimer initialSec={subjectTotal} run={isStudying} />
      ) : null}
    </div>
  );
}

export default UserSubjectViewer;
