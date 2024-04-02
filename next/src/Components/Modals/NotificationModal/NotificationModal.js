import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./NotificationModal.module.css";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Draggable from "react-draggable";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function NotificationModal({
  notifications,
  setNotifications,
  isNotificationModal,
  setResponse,
}) {
  const [notificationsEl, setNotificationsEl] = useState([]);
  const [moveRef, setMoveRef] = useState(null);

  const friendRequestReply = (targetId, accepted, notificationId) => {
    fetch(`${serverOrigin}/friend/request-reply`, {
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

    setNotifications(
      notifications.filter((notif) => notif.i !== notificationId),
    );
  };

  const deleteFriendNotif = (targetId, notificationId) => {
    fetch(`${serverOrigin}/friend/checked`, {
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

    setNotifications(
      notifications.filter((notif) => notif.i !== notificationId),
    );
  };

  const challengeRequestReply = (targetId, accepted, notificationId) => {
    fetch(`${serverOrigin}/challenges/challenge-request-reply`, {
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

    setNotifications(
      notifications.filter((notif) => notif.i !== notificationId),
    );
  };

  const deleteChallengeNotif = (targetId, notificationId) => {
    fetch(`${serverOrigin}/challenges/challenge-notif`, {
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

    setNotifications(
      notifications.filter((notif) => notif.i !== notificationId),
    );
  };

  const chatRequestReply = (targetId, accepted, notificationId) => {
    fetch(`${serverOrigin}/chat/chat-request-reply`, {
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

    setNotifications(
      notifications.filter((notif) => notif.i !== notificationId),
    );
  };

  useEffect(() => {
    setNotificationsEl(
      notifications.map((notification, i) => {
        const type = notification.t;
        const sender = notification.f;
        const fromId = sender ? sender.user_id : "";
        const fromName = sender ? sender.name : "";
        if (type === 0) {
          return (
            <div
              className={styles.notification}
              key={i}
              style={{ zIndex: 100 - i }}
            >
              <Link
                to={`/dashboard/user/${fromId}`}
                className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/${fromId}.jpeg")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                  backgroundRepeat: "no-repeat",
                }}
              ></Link>
              <div className={styles.content}>
                <p>{fromName} wants to be friends with you!</p>
              </div>
              <div className={styles.buttons}>
                <div className={`${styles.btnWrapper} ${styles.decline}`}>
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
                </div>
              </div>
            </div>
          );
        } else if (type === 1) {
          return (
            <div
              className={styles.notification}
              key={i}
              style={{ zIndex: 100 - i }}
            >
              <Link
                to={`/dashboard/user/${fromId}`}
                className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/${fromId}.jpeg")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                  backgroundRepeat: "no-repeat",
                }}
              ></Link>
              <div className={styles.content}>
                <p>{fromName} and you are now friends!</p>
              </div>
              <div className={styles.buttons}>
                <div className={`${styles.btnWrapper} ${styles.accept}`}>
                  <button
                    onClick={() => {
                      deleteFriendNotif(fromId, notification.i);
                    }}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                  <div className={styles.hoverDisp}>Got it!</div>
                </div>
              </div>
            </div>
          );
        } else if (type === 2) {
          return (
            <div
              className={styles.notification}
              key={i}
              style={{ zIndex: 100 - i }}
            >
              <Link
                to={`/dashboard/user/${fromId}`}
                className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/${fromId}.jpeg")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                  backgroundRepeat: "no-repeat",
                }}
              ></Link>
              <div className={styles.content}>
                <p>{fromName} challenges you to a study face-off!</p>
              </div>
              <div className={styles.buttons}>
                <div className={`${styles.btnWrapper} ${styles.decline}`}>
                  <button
                    onClick={() => {
                      challengeRequestReply(fromId, false, notification.i);
                    }}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                  <div className={styles.hoverDisp}>Decline</div>
                </div>
                <div className={`${styles.btnWrapper} ${styles.accept}`}>
                  <button
                    onClick={() => {
                      challengeRequestReply(fromId, true, notification.i);
                    }}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                  <div className={styles.hoverDisp}>Accept</div>
                </div>
              </div>
            </div>
          );
        } else if (type === 3) {
          return (
            <div
              className={styles.notification}
              key={i}
              style={{ zIndex: 100 - i }}
            >
              <Link
                to={`/dashboard/user/${fromId}`}
                className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/${fromId}.jpeg")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                  backgroundRepeat: "no-repeat",
                }}
              ></Link>
              <div className={styles.content}>
                <p>{fromName} accepted your challenge!</p>
                <a href={`/dashboard/challenge/${notification.c}`}>[View]</a>
              </div>
              <div className={styles.buttons}>
                <div className={`${styles.btnWrapper} ${styles.accept}`}>
                  <button
                    onClick={() => {
                      deleteChallengeNotif(fromId, notification.i);
                    }}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                  <div className={styles.hoverDisp}>Got it!</div>
                </div>
              </div>
            </div>
          );
        } else if (type === 4) {
          return (
            <div
              className={styles.notification}
              key={i}
              style={{ zIndex: 100 - i }}
            >
              <Link
                to={`/dashboard/user/${fromId}`}
                className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/${fromId}.jpeg")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                  backgroundRepeat: "no-repeat",
                }}
              ></Link>
              <div className={styles.content}>
                <p>{fromName} wants to chat with you!</p>
              </div>
              <div className={styles.buttons}>
                <div className={`${styles.btnWrapper} ${styles.decline}`}>
                  <button
                    onClick={() => {
                      chatRequestReply(fromId, false, notification.i);
                    }}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                  <div className={styles.hoverDisp}>Decline</div>
                </div>
                <div className={`${styles.btnWrapper} ${styles.accept}`}>
                  <button
                    onClick={() => {
                      chatRequestReply(fromId, true, notification.i);
                    }}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                  <div className={styles.hoverDisp}>Accept</div>
                </div>
              </div>
            </div>
          );
        }
      }),
    );
  }, [notifications]);

  return (
    <Draggable nodeRef={moveRef}>
    <div
      className={`${styles.NotificationModal} ${
        isNotificationModal ? styles.opened : ""
      }`}
      ref={moveRef}
    >
      {notificationsEl.length ? (
        <div className={`${styles.notifications} customScroll`}>
          {notificationsEl}
        </div>
      ) : (
        <div className={styles.noNotifications}>
          You don't have any notifications
        </div>
      )}
    </div>
    </Draggable>
  );
}

export default NotificationModal;