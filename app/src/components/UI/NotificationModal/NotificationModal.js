import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./NotificationModal.module.css";
import { faBell, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function NotificationModal({ notifications, setNotifications, setIsNotificationModal, isNotificationModal, setResponse }) {
  const [notificationsEl, setNotificationsEl] = useState([]);

  const friendRequestReply = (targetId, accepted, notificationId) => {
    fetch(`${serverOrigin}/api/account/friend-request-reply`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId, accepted }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
      })
      .catch((error) => console.error(error));
 
    setNotifications(notifications.filter(notif => notif.i !== notificationId));
  };

  const deleteFriendNotif = (targetId, notificationId) => {
    fetch(`${serverOrigin}/api/account/friend-notif`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
      })
      .catch((error) => console.error(error));
 
    setNotifications(notifications.filter(notif => notif.i !== notificationId));
  };

  const challengeRequestReply = (targetId, accepted, notificationId) => {
    fetch(`${serverOrigin}/api/challenges/challenge-request-reply`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId, accepted }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
      })
      .catch((error) => console.error(error));
 
    setNotifications(notifications.filter(notif => notif.i !== notificationId));
  }; 

  const deleteChallengeNotif = (targetId, notificationId) => {
    fetch(`${serverOrigin}/api/challenges/challenge-notif`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
      })
      .catch((error) => console.error(error));
 
    setNotifications(notifications.filter(notif => notif.i !== notificationId));
  };

  const chatRequestReply = (targetId, accepted, notificationId) => {
    fetch(`${serverOrigin}/api/chat/chat-request-reply`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId, accepted }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
      })
      .catch((error) => console.error(error));
 
    setNotifications(notifications.filter(notif => notif.i !== notificationId));
  };

  useEffect(() => {
    setNotificationsEl(notifications.map((notification, i) => {
      const type = notification.t;
      const sender = notification.f;
      const fromId = sender ? sender.user_id : '';
      const fromName = sender ? sender.name : '';
      if (type === 0) {
        
        return (
          <div className={styles.notification} key={i}>
          <Link to={`/dashboard/user/${fromId}`} className={styles.profileImg}
            style={{
              backgroundImage: `url("${serverOrigin}/profile-images/${fromId}.jpeg")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}>
          </Link>
          <div className={styles.content}>
            <p>{fromName} wants to be friends with you!</p>
          </div>
          <div className={styles.buttons}>
            <div className={`${styles.btnWrapper} ${styles.decline}`}>
              <button onClick={() => {friendRequestReply(fromId, false, notification.i)}}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
              <div className={styles.hoverDisp}>
                Decline
              </div>
            </div>
            <div className={`${styles.btnWrapper} ${styles.accept}`}>
            <button onClick={() => {friendRequestReply(fromId, true, notification.i)}}>
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
      else if (type === 1) {
        
        return (
          <div className={styles.notification} key={i}>
          <Link to={`/dashboard/user/${fromId}`} className={styles.profileImg}
            style={{
              backgroundImage: `url("${serverOrigin}/profile-images/${fromId}.jpeg")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}>
          </Link>
          <div className={styles.content}>
            <p>{fromName} and you are now friends!</p>
          </div>
          <div className={styles.buttons}>
            <div className={`${styles.btnWrapper} ${styles.accept}`}>
            <button onClick={() => {deleteFriendNotif(fromId, notification.i)}}>
                <FontAwesomeIcon icon={faCheck} />
              </button>
              <div className={styles.hoverDisp}>
                Got it!
              </div>
            </div>
          </div>
        </div>
        )
      }
      else if (type === 2) {
        
        return (
          <div className={styles.notification} key={i}>
          <Link to={`/dashboard/user/${fromId}`} className={styles.profileImg}
            style={{
              backgroundImage: `url("${serverOrigin}/profile-images/${fromId}.jpeg")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}>
          </Link>
          <div className={styles.content}>
            <p>{fromName} challenges you to a study face-off!</p>
          </div>
          <div className={styles.buttons}>
            <div className={`${styles.btnWrapper} ${styles.decline}`}>
              <button onClick={() => {challengeRequestReply(fromId, false, notification.i)}}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
              <div className={styles.hoverDisp}>
                Decline
              </div>
            </div>
            <div className={`${styles.btnWrapper} ${styles.accept}`}>
            <button onClick={() => {challengeRequestReply(fromId, true, notification.i)}}>
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
      else if (type === 3) {
        
        return (
          <div className={styles.notification} key={i}>
          <Link to={`/dashboard/user/${fromId}`} className={styles.profileImg}
            style={{
              backgroundImage: `url("${serverOrigin}/profile-images/${fromId}.jpeg")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}>
          </Link>
          <div className={styles.content}>
            <p>{fromName} accepted your challenge!</p>
            <a href = {`/dashboard/challenge/${notification.c}`}>[View]</a>
          </div>
          <div className={styles.buttons}>
            <div className={`${styles.btnWrapper} ${styles.accept}`}>
            <button onClick={() => {deleteChallengeNotif(fromId, notification.i)}}>
                <FontAwesomeIcon icon={faCheck} />
              </button>
              <div className={styles.hoverDisp}>
                Got it!
              </div>
            </div>
          </div>
        </div>
        )
      } else if (type === 4) {
        
        return (
          <div className={styles.notification} key={i}>
          <Link to={`/dashboard/user/${fromId}`} className={styles.profileImg}
            style={{
              backgroundImage: `url("${serverOrigin}/profile-images/${fromId}.jpeg")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}>
          </Link>
          <div className={styles.content}>
            <p>{fromName} wants to chat with you!</p>
          </div>
          <div className={styles.buttons}>
            <div className={`${styles.btnWrapper} ${styles.decline}`}>
              <button onClick={() => {chatRequestReply(fromId, false, notification.i)}}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
              <div className={styles.hoverDisp}>
                Decline
              </div>
            </div>
            <div className={`${styles.btnWrapper} ${styles.accept}`}>
            <button onClick={() => {chatRequestReply(fromId, true, notification.i)}}>
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