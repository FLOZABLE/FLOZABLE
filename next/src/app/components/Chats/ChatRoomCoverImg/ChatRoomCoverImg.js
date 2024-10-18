import ProfileImage from "../../Users/ProfileImage/ProfileImage";
import styles from "./ChatRoomCoverImg.module.css";

export default function ChatRoomCoverImg({ members }) {
  return (
    <div className={styles.ChatRoomCoverImg}>
      {members.slice(0, 2).map((member, i) => {
        if (i === 0) {
          return (
            <div className={`${styles.profileImg}`} key={i}>
              <ProfileImage
                userId={member}
                key={i}
                width="2.5rem"
                height="2.5rem"
              />
            </div>
          );
        }
        return (
          <div
            className={`${styles.profileImg}`}
            style={{
              right: "0rem",
              bottom: "0rem",
            }}
            key={i}
          >
            <ProfileImage userId={member} key={i} />
          </div>
        );
      })}
    </div>
  );
}
