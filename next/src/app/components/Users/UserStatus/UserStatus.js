import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./UserStatus.module.css";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";

export default function UserStatus({ userInfo, activeSubject }) {
  console.log(activeSubject, "activeSubject")
  return (
    <div className={styles.UserStatus}>
      <i>
        {activeSubject ? <FontAwesomeIcon icon={faCircle} /> : null}
      </i>
    </div>
  );
}
