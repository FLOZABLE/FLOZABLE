import ProfileImage from "../ProfileImage/ProfileImage";
import styles from "./ShareUserBox.module.css";

export default function ShareUserBox({ userInfo, onClick, text }) {
  return (
    <div className={styles.ShareUserBox} onClick={onClick}>
      <ProfileImage userId={userInfo.user_id} />
      <div className={`HoverText ${styles.hoverText}`}>{text}</div>
    </div>
  );
}
