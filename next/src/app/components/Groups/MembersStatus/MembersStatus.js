import { useEffect, useState } from "react";
import styles from "./MembersStatus.module.css";
import { socket } from "@/app/utils/socket";

export default function MembersStatus({ groupId, members }) {
  const [studyingMembers, setStudyingMembers] = useState([]);
  const [restMembers, setRestingMembers] = useState([]);

  useEffect(() => {
    if (!groupId || !members) return;

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

    const onStudying = ({ userId, subject }) => {
      if (!members.find((member) => member.user_id === userId)) return;

      if (subject.subject_id === "0") {
        setStudyingMembers((prev) =>
          prev.filter((memberId) => memberId !== userId)
        );
        setRestingMembers((prev) => [...new Set([...prev, userId])]);
      } else {
        setStudyingMembers((prev) => [...new Set([...prev, userId])]);
        setRestingMembers((prev) =>
          prev.filter((memberId) => memberId !== userId)
        );
      }
    };

    const onStopStudying = ({ userId, status }) => {
      console.log(status, "status");
      setStudyingMembers((prev) =>
        prev.filter((memberId) => memberId !== userId)
      );
      if (status === "disconnect") {
        setRestingMembers((prev) =>
          prev.filter((memberId) => memberId !== userId)
        );
      } else {
        setRestingMembers((prev) => [...new Set([...prev, userId])]);
      }
    };

    socket.on("studying", onStudying);
    socket.on("stopStudying", onStopStudying);
    return () => {
      socket.off("studying", onStudying);
      socket.off("stopStudying", onStopStudying);
    };
  }, [groupId, members]);

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
