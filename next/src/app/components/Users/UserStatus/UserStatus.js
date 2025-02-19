import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./UserStatus.module.css";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import { socket } from "@/app/utils/socket";
import { useProfileStatus } from "@/Hooks/accountHooks";

export default function UserStatus({ userInfo }) {
  const { profileStatus, updateProfileStatus } = useProfileStatus(
    userInfo?.user_id
  );

  useEffect(() => {
    const onStudying = ({ userId, subject }) => {
      if (userId !== userInfo?.user_id) return;
      console.log("start", userId, subject);

      updateProfileStatus("active_subject", subject);
    };

    const onStopStudying = ({ userId, subject, duration }) => {
      if (userId !== userInfo?.user_id) return;

      updateProfileStatus("active_subject", subject);
    };

    socket.on("studying", onStudying);
    socket.on("stopStudying", onStopStudying);
    return () => {
      socket.off("studying", onStudying);
      socket.off("stopStudying", onStopStudying);
    };
  }, [userInfo]);

  return (
    <div className={styles.UserStatus}>
      <i>
        {profileStatus?.active_subject ? (
          <FontAwesomeIcon icon={faCircle} />
        ) : null}
      </i>
    </div>
  );
}
