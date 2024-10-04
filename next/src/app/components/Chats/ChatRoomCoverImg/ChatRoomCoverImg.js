import ProfileImage from "../../Users/ProfileImage/ProfileImage";
import styles from "./ChatRoomCoverImg.module.css";

export default function ChatRoomCoverImg({ members }) {
  return (
    <div className={styles.ChatRoomCoverImg}>
      {members.slice(0, 2).map((member, i) => {
        if (i === 0) {
          return (
            <div className={`${styles.profileImg}`} key={i}>
              <ProfileImage userId={member} key={i} width={30} height={30} />
            </div>
          );
        }
        return (
          <div
            className={`${styles.profileImg}`}
            style={{ right: "0rem", bottom: "0rem" }}
            key={i}
          >
            <ProfileImage userId={member} key={i} width={25} height={25} />
          </div>
        );
      })}
    </div>
  );
}
