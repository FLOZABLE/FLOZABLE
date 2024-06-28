import Link from "next/link";
import ProfileImage from "../ProfileImage/ProfileImage";
import styles from "./UserContainer.module.css";
import CountryViewer from "../../Others/CountryViewer/CountryViewer";

export default function UserContainer({ userInfo, children, style = {} }) {
  return (
    <div className={styles.UserContainer} style={style}>
      <Link
        href={`/dashboard/user/${userInfo.user_id}`}
        className={styles.userInfo}
      >
        <ProfileImage />
        <div className={`overflowDot ${styles.name}`}>{userInfo.name}</div>
        <i className={styles.flag}>
        <CountryViewer timezone={userInfo.timezone} />
        </i>
      </Link>
      <div className={styles.buttons}>
      {children}
      </div>
    </div>
  );
};