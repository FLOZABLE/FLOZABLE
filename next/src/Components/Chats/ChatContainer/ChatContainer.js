import Link from "next/link";
import styles from "./ChatContainer.module.css";
import ProfileImage from "@/Components/Users/ProfileImage/ProfileImage";
import config from "@/utils/config";

function ChatContainer({ userInfo, time, m }) {
  return (
    <li className={styles.ChatContainer}>
      <Link
        href={`${config.server}/dashboard/user/${userInfo?.user_id}`}
      >
        <div className={styles.profileImg}>
          <ProfileImage userId={userInfo?.user_id} />
        </div>
      </Link>
      <p className={styles.name}>{userInfo?.name}</p>
      <p className={styles.time}>{time}</p>
      <p>{m}</p>
    </li>
  );
};

export default ChatContainer;