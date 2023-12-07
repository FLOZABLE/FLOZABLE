import styles from "./UserSubjectViewer.module.css";
import { socket } from "../../../socket";
import MemberTimer from "../MemberTimer/MemberTimer";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";

function UserSubjectViewer({userInfo}) {
  const [initialStatus,setInitialStatus] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectTotal, setSubjectTotal] = useState(0);

  useEffect(() => {
    if (!userInfo) return;
    const {user_id, activeSubject} = userInfo;
    const {name, icon, color, total, id, time} = activeSubject;
    if (id) {
      const liveTotal = DateTime.now().toSeconds().toFixed() - time;
      setSubjectName(`Studying ${name}`);
      setIsStudying(true);
      setInitialStatus(true);
      setSubjectTotal(liveTotal);
    };

    const onStudying = (subjectInfo) => {
      const {name} = subjectInfo;
      setSubjectName(`Studying ${name}`);
      setIsStudying(true);
    };
    const onStopStudying = () => {
      setSubjectName('taking break');
      setIsStudying(false);
    };

    socket.on(`studying:${user_id}`, onStudying);
    socket.on(`stopStudying:${user_id}`, onStopStudying);

    return () => {
      socket.off(`studying:${user_id}`, onStudying);
      socket.off(`stopStudying:${user_id}`, onStopStudying);
    }
  }, [userInfo]);

  return (
    <div className={`${styles.UserSubjectViewer} ${isStudying ? styles.open : ''}`}>
      <p>{subjectName}</p>
      <p>&nbsp;</p>
      <MemberTimer initialStatus={initialStatus} initialSec={subjectTotal} userInfo={userInfo} reset={true} />
    </div>
  );
};

export default UserSubjectViewer;