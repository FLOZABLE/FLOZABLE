import styles from "./UserSubjectViewer.module.css";
import { socket } from "../../../socket";
import MemberTimer from "../MemberTimer/MemberTimer";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";

function UserSubjectViewer({userInfo}) {
  const [initialStatus,setInitialStatus] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectTotal, setSubjectTotal] = useState(0);

  useEffect(() => {
    if (!userInfo) return;
    console.log(userInfo);
    const {user_id, activeSubject} = userInfo;
    const {name, icon, color, total, id, time} = activeSubject;
    if (id) {
      const liveTotal = DateTime.now().toSeconds().toFixed() - time;
      setSubjectName(name);
      setInitialStatus(true);
      setSubjectTotal(liveTotal);
    };

    const onStudying = (subjectInfo) => {
      console.log(subjectInfo);
      const {name} = subjectInfo;
      setSubjectName(name);
      setSubjectTotal(0);
    };
    const onStopStudying = () => {
      setSubjectName('taking break');
      setSubjectTotal(0);
    };

    socket.on(`studying:${user_id}`, onStudying);
    socket.on(`stopStudying:${user_id}`, onStopStudying);

    return () => {
      socket.off(`studying:${user_id}`, onStudying);
      socket.off(`stopStudying:${user_id}`, onStopStudying);
    }
  }, [userInfo]);


  return (
    <div className={styles.UserSubjectViewer}>
      <p>{subjectName}</p>
      <p>&nbsp;</p>
      <MemberTimer initialStatus={initialStatus} initialSec={subjectTotal} userInfo={userInfo} />
    </div>
  );
};

export default UserSubjectViewer;