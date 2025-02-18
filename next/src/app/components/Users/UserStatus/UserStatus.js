import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./UserStatus.module.css";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

export default function UserStatus({ userId }) {
  return (
    <div className={styles.UserStatus}>
      <i>
        <FontAwesomeIcon icon={faCircle} />
      </i>
    </div>
  );
}
