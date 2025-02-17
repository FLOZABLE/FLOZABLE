import { CallOptionsContext } from "@/app/utils/Contexts";
import styles from "./VideoCallController.module.css";
import { useContext } from "react";
import {
  IconCameraVideoFill,
  IconCameraVideoOffFill,
  IconHeadphoneFill,
  IconHeadphonesOff,
  IconMicFill,
  IconMicMuteFill,
} from "@/app/utils/Svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from "@fortawesome/free-solid-svg-icons";

export default function VideoCallController({}) {
  const { isMic, setIsMic, isCam, setIsCam, isHeadphone, setIsHeadphone } =
    useContext(CallOptionsContext);

  return (
    <div className={styles.VideoCallController}>
      <div className={styles.header}>
        <i>
          <FontAwesomeIcon icon={faPhone} />
        </i>
        Call Options
      </div>
      <div className={styles.controller}>
        <p>Camera</p>
        <i onClick={() => setIsCam((prev) => !prev)}>
          {isCam ? <IconCameraVideoFill /> : <IconCameraVideoOffFill />}
        </i>
      </div>
      <div className={styles.controller}>
        <p>Mic</p>
        <i onClick={() => setIsMic((prev) => !prev)}>
          {isMic ? <IconMicFill /> : <IconMicMuteFill />}
        </i>
      </div>
      <div className={styles.controller}>
        <p>Headphone</p>
        <i onClick={() => setIsHeadphone((prev) => !prev)}>
          {isHeadphone ? <IconHeadphoneFill /> : <IconHeadphonesOff />}
        </i>
      </div>
    </div>
  );
}
