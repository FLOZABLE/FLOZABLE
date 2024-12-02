import styles from "./UserSubjectViewer.module.css";
import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";
import MemberTimer from "@/app/components/Groups/MemberTimer/MemberTimer";
import { socket } from "@/app/utils/socket";

function UserSubjectViewer({ userInfo }) {
  const [subjectName, setSubjectName] = useState("Offline");
  const [run, setRun] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const { study_time, activeSubject } = userInfo;
    if (!activeSubject) {
      setSubjectName("Offline");
    } else if (activeSubject.subject_id === "0") {
      setSubjectName(`Taking break`);
    } else {
      setSubjectName(`Studying ${activeSubject.name}`);
    }
    if (activeSubject) {
      setRun(true);
      const liveTotal = DateTime.now().toSeconds() - activeSubject.time;
      setTotal(liveTotal);
    } else {
      setTotal(0);
      setRun(false);
    }
  }, [userInfo]);

  return (
    <div className={styles.UserSubjectViewer}>
      <p>{subjectName}</p>
      {run ? <MemberTimer initialSec={total} run={run} /> : null}
    </div>
  );
}

export default UserSubjectViewer;
