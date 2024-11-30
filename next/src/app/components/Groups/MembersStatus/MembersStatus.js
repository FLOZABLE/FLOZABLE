import { useEffect, useState } from "react";
import styles from "./MembersStatus.module.css";

export default function MembersStatus({ members }) {
  const [studyingMembers, setStudyingMembers] = useState([]);
  const [restMembers, setRestingMembers] = useState([]);

  useEffect(() => {
    if (!members) return;
    console.log("members", members);

    const studyingMembers = [];
    const restMembers = [];
    members.map((member) => {
      if (!member.activeSubject) return;
      if (member.activeSubject.subject_id === "0") {
        restMembers.push(member.user_id);
      } else {
        studyingMembers.push(member.user_id);
      }
    });

    setStudyingMembers(studyingMembers);
    setRestingMembers(restMembers);
  }, [members]);

  return (
    <div className={styles.MembersStatus}>
      <div className={styles.statusContainer} id={styles.studying}>
        <div className={styles.color}></div>
        <p>{studyingMembers.length} Members studying</p>
      </div>
      <div className={styles.statusContainer} id={styles.resting}>
        <div className={styles.color}></div>
        <p>{restMembers.length} Members resting</p>
      </div>
      <div className={styles.statusContainer} id={styles.offline}>
        <div className={styles.color}></div>
        <p>
          {
            members.filter(
              (member) =>
                !studyingMembers.includes(member.user_id) &&
                !restMembers.includes(member.user_id)
            ).length
          }{" "}
          Members offline
        </p>
      </div>
    </div>
  );
}
