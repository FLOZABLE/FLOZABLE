import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./NotificationModal.module.css";
import { faBell, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function NotificationModal({ notifications, setNotifications, setIsNotificationModal, isNotificationModal, allMembers, setResponse }) {
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
    fetch(`${serverOrigin}/api/account/challenge-request-reply`, {
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
    fetch(`${serverOrigin}/api/account/challenge-notif`, {
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
      const from = notification.f;
      if (type === 0) {
        const sender = allMembers.find(member => {return member.user_id === from});
        const {name} = sender;
        return (
          <div className={styles.notification} key={i}>
          <Link to={`/dashboard/user/${from}`} className={styles.profileImg}
            style={{
              backgroundImage: `url("${serverOrigin}/profile-images/${from}.jpeg")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}>
          </Link>
          <div className={styles.content}>
            <p>{name} wants to be friends with you!</p>
          </div>
          <div className={styles.buttons}>
            <div className={`${styles.btnWrapper} ${styles.decline}`}>
              <button onClick={() => {friendRequestReply(from, false, notification.i)}}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
              <div className={styles.hoverDisp}>
                Decline
              </div>
            </div>
            <div className={`${styles.btnWrapper} ${styles.accept}`}>
            <button onClick={() => {friendRequestReply(from, true, notification.i)}}>
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
        const sender = allMembers.find(member => {return member.user_id === from});
        const {name} = sender;
        return (
          <div className={styles.notification} key={i}>
          <Link to={`/dashboard/user/${from}`} className={styles.profileImg}
            style={{
              backgroundImage: `url("${serverOrigin}/profile-images/${from}.jpeg")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}>
          </Link>
          <div className={styles.content}>
            <p>{name} and you are now friends!</p>
          </div>
          <div className={styles.buttons}>
            <div className={`${styles.btnWrapper} ${styles.accept}`}>
            <button onClick={() => {deleteFriendNotif(from, notification.i)}}>
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
        const sender = allMembers.find(member => {return member.user_id === from});
        const {name} = sender;
        return (
          <div className={styles.notification} key={i}>
          <Link to={`/dashboard/user/${from}`} className={styles.profileImg}
            style={{
              backgroundImage: `url("${serverOrigin}/profile-images/${from}.jpeg")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}>
          </Link>
          <div className={styles.content}>
            <p>{name} challenges you to a study face-off!</p>
          </div>
          <div className={styles.buttons}>
            <div className={`${styles.btnWrapper} ${styles.decline}`}>
              <button onClick={() => {challengeRequestReply(from, false, notification.i)}}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
              <div className={styles.hoverDisp}>
                Decline
              </div>
            </div>
            <div className={`${styles.btnWrapper} ${styles.accept}`}>
            <button onClick={() => {challengeRequestReply(from, true, notification.i)}}>
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
        const sender = allMembers.find(member => {return member.user_id === from});
        const {name} = sender;
        return (
          <div className={styles.notification} key={i}>
          <Link to={`/dashboard/user/${from}`} className={styles.profileImg}
            style={{
              backgroundImage: `url("${serverOrigin}/profile-images/${from}.jpeg")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}>
          </Link>
          <div className={styles.content}>
            <p>{name} accepted your challenge!</p>
          </div>
          <div className={styles.buttons}>
            <div className={`${styles.btnWrapper} ${styles.accept}`}>
            <button onClick={() => {deleteChallengeNotif(from, notification.i)}}>
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
        const sender = allMembers.find(member => {return member.user_id === from});
        const {name} = sender;
        return (
          <div className={styles.notification} key={i}>
          <Link to={`/dashboard/user/${from}`} className={styles.profileImg}
            style={{
              backgroundImage: `url("${serverOrigin}/profile-images/${from}.jpeg")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}>
          </Link>
          <div className={styles.content}>
            <p>{name} wants to chat with you!</p>
          </div>
          <div className={styles.buttons}>
            <div className={`${styles.btnWrapper} ${styles.decline}`}>
              <button onClick={() => {chatRequestReply(from, false, notification.i)}}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
              <div className={styles.hoverDisp}>
                Decline
              </div>
            </div>
            <div className={`${styles.btnWrapper} ${styles.accept}`}>
            <button onClick={() => {chatRequestReply(from, true, notification.i)}}>
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