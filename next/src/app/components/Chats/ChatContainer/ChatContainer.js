import Link from "next/link";
import styles from "./ChatContainer.module.css";
import ProfileImage from "@/app/components/Users/ProfileImage/ProfileImage";

function ChatContainer({ userInfo, time, message }) {
  return (
    <li className={styles.ChatContainer}>
      <Link href={`/dashboard/user/${userInfo?.user_id}`}>
        <div className={styles.profileImg}>
          <ProfileImage userId={userInfo?.user_id} />
        </div>
      </Link>
      <p>{message}</p>
      <div className={styles.info}>
        <Link
          href={`/dashboard/user/${userInfo?.user_id}`}
          className={`overflowDot ${styles.name}`}
        >
          {userInfo?.name}
        </Link>
        <p className={styles.time}>{time}</p>
      </div>
    </li>
  );
}

export default ChatContainer;
