import Link from "next/link";
import ProfileImage from "../ProfileImage/ProfileImage";
import styles from "./UserContainer.module.css";
import CountryViewer from "../../Others/CountryViewer/CountryViewer";

export default function UserContainer({
  userInfo,
  children,
  style = {},
  onClick,
}) {
  return (
    <div className={styles.UserContainer} style={style}>
      <div
        href={`/dashboard/user/${userInfo.user_id}`}
        className={styles.userInfo}
        onClick={onClick}
      >
        <ProfileImage userId={userInfo.user_id} />
        <div className={`overflowDot ${styles.name}`}>{userInfo.name}</div>
        <i className={styles.flag}>
          <CountryViewer timezone={userInfo.timezone} />
        </i>
      </div>
      <div className={styles.buttons}>{children}</div>
    </div>
  );
}
