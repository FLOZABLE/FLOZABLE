import config from "@/app/utils/config";
import styles from "./NotificationContainer.module.css";
import ProfileImage from "@/app/components/Users/ProfileImage/ProfileImage";
import NotificationBtn from "../NotificationBtn/NotificationBtn";

function NotificationContainer({ fromProfile, zIndex, children, buttons }) {
  return (
    <div className={styles.NotificationContainer} style={{ zIndex }}>
      {fromProfile ? (
        <div>
          <ProfileImage userId={fromProfile} height="3rem" width="3rem" />
        </div>
      ) : null}
      <div className={styles.content}>{children}</div>
      {buttons ? (
        <div className={styles.buttons}>
          {buttons.map((button, i) => {
            const { onClick, content, hoverText } = button;
            return (
              <NotificationBtn onClick={onClick} hoverText={hoverText} key={i}>
                {content}
              </NotificationBtn>
            );
          })}
          {/* <div className={`${styles.btnWrapper} ${styles.decline}`}>
          <button
            onClick={() => {
              friendRequestReply(fromId, false, notification.i);
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
          <div className={styles.hoverDisp}>Decline</div>
        </div>
        <div className={`${styles.btnWrapper} ${styles.accept}`}>
          <button
            onClick={() => {
              friendRequestReply(fromId, true, notification.i);
            }}
          >
            <FontAwesomeIcon icon={faCheck} />
          </button>
          <div className={styles.hoverDisp}>Accept</div>
        </div> */}
        </div>
      ) : null}
    </div>
  );
}

export default NotificationContainer;
