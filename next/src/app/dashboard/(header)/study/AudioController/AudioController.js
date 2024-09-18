import { faHeadphones } from "@fortawesome/free-solid-svg-icons";
import styles from "./AudioController.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function AudioController() {
  return (
    <div className={styles.AudioController}>
      <div className={styles.title}>
        <i>
          <FontAwesomeIcon icon={faHeadphones} />
        </i>
        Audio Options
      </div>
      <div className={styles.controller}>
        <p>Camera</p>
        {/* <i onClick={() => setIsCam((prev) => !prev)}>
          {isCam ? <IconCameraVideoFill /> : <IconCameraVideoOffFill />}
        </i> */}
      </div>
    </div>
  );
}
