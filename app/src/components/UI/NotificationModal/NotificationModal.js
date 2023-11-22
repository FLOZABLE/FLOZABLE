import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./NotificationModal.module.css";
import { faBell, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function NotificationModal({ notifications, setNotifications, setIsNotificationModal, isNotificationModal, allMembers }) {
  const [notificationsEl, setNotificationsEl] = useState([]);

  const friendRequestReply = (targetId, accepted) => {
    fetch(`${serverOrigin}/api/account/friend-request-reply`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId, accepted }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    console.log('gd', notifications)
    setNotificationsEl(notifications.map((notification, i) => {
      const type = notification.t;
      const from = notification.f;
      console.log(notification, type, from)
      if (type === 0) {
        const sender = allMembers.find(member => {return member.user_id === from});
        const {name} = sender;
        return (
          <div className={styles.notification} key={i}>
          <div className={styles.profileImg}
            style={{
              backgroundImage: `url("${serverOrigin}/profile-images/${from}.jpeg")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}>
          </div>
          <div className={styles.content}>
            <p>{name} wants to be friends with you!</p>
          </div>
          <div className={styles.buttons}>
            <div className={styles.btnWrapper}>
              <button onClick={() => {friendRequestReply(from, false)}}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
              <div className={styles.hoverDisp}>
                Decline
              </div>
            </div>
            <div className={styles.btnWrapper}>
            <button onClick={() => {friendRequestReply(from, true)}}>
                <FontAwesomeIcon icon={faCheck} />
              </button>
              <div className={styles.hoverDisp}>
                Accept
              </div>
            </div>
          </div>
        </div>
        )
      }
    }))
  }, [notifications]);
  
  return (
    <div className={`${styles.NotificationModal} ${isNotificationModal ? styles.open : ''}`}>
      <button className={styles.toggleBtn} onClick={() => { setIsNotificationModal(!isNotificationModal) }}>
        <FontAwesomeIcon icon={faBell} />
      </button>

      <div className={styles.notifications}>
        {notificationsEl}
      </div>
    </div>
  );
};

export default NotificationModal;