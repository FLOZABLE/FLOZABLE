"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./NotificationModal.module.css";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import React, { useContext, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { ModalsContext, NotificationsContext, ResponseContext } from "@/utils/Contexts";
import NotificationContainer from "@/Components/Notifications/NotificationContainer/NotificationContainer";
import config from "@/utils/config";

function NotificationModal({
}) {
  const { isNotificationModal } = useContext(ModalsContext);
  const { notifications, setNotifications } = useContext(NotificationsContext);
  const { setResponse } = useContext(ResponseContext);

  const [notificationsEl, setNotificationsEl] = useState([]);
  const moveRef = useRef(null);

  const friendRequestReply = (targetId, accepted, notificationId) => {
    fetch(`${config.server}/friend/request-reply`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId, accepted }),
      credentials:"include"
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
    fetch(`${config.server}/friend/checked`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId }),
      credentials:"include"
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
    fetch(`${config.server}/challenges/challenge-request-reply`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId, accepted }),
      credentials:"include"
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
    fetch(`${config.server}/challenges/challenge-notif`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId }),
      credentials:"include"
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
    fetch(`${config.server}/chat/chat-request-reply`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId, accepted }),
      credentials:"include"
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
  /* 
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
                    backgroundImage: `url("${config.server}/profile-images/${fromId}.jpeg")`,
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
                    backgroundImage: `url("${config.server}/profile-images/${fromId}.jpeg")`,
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
                    backgroundImage: `url("${config.server}/profile-images/${fromId}.jpeg")`,
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
                    backgroundImage: `url("${config.server}/profile-images/${fromId}.jpeg")`,
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
                    backgroundImage: `url("${config.server}/profile-images/${fromId}.jpeg")`,
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
    }, [notifications]); */

  return (
    <Draggable nodeRef={moveRef}>
      <div
        className={`${styles.NotificationModal} ${isNotificationModal ? styles.opened : ""
          }`}
        ref={moveRef}
      >
        {notifications.length ? (
          <div className={`${styles.notifications} customScroll`}>
            {notifications.map((notification, i) => {
              const type = notification.t;
              const sender = notification.f;
              const fromId = sender ? sender.user_id : "";
              const fromName = sender ? sender.name : "";

              if (type === 0) {
                return (
                  <NotificationContainer fromProfile={fromId} zIndex={notifications.length - i} buttons={[{
                    onClick: () => {friendRequestReply(fromId, true, notification.i)},
                    content: <FontAwesomeIcon icon={faCheck} color={"green"} fontSize="2rem"/>,
                    hoverText: 'Accept'
                  },
                  {
                    onClick: () => {friendRequestReply(fromId, false, notification.i)},
                    content: <FontAwesomeIcon icon={faXmark} color={"red"} fontSize="2rem"/>,
                    hoverText: 'Decline'
                  }
                  ]}
                  key={i}
                  >
                    <p>{fromName} wants to be friends with you!</p>
                  </NotificationContainer>
                )
              } else if (type === 1) {
                return (
                  <NotificationContainer fromProfile={fromId} zIndex={notifications.length - i} buttons={[{
                    onClick: () => {friendRequestReply(fromId, false, notification.i)},
                    content: <FontAwesomeIcon icon={faXmark} />,
                    hoverText: 'Decline'
                  },
                  {
                    onClick: () => {friendRequestReply(fromId, false, notification.i)},
                    content: <FontAwesomeIcon icon={faXmark} />,
                    hoverText: 'Decline'
                  }
                  ]}
                  key={i}
                  >
                    <p>{fromName} wants to be friends with you!</p>
                  </NotificationContainer>
                )
              }else if (type === 2) {
                return (
                  <NotificationContainer fromProfile={fromId} zIndex={notifications.length - i} buttons={[{
                    onClick: () => {friendRequestReply(fromId, false, notification.i)},
                    content: <FontAwesomeIcon icon={faXmark} />,
                    hoverText: 'Decline'
                  },
                  {
                    onClick: () => {friendRequestReply(fromId, false, notification.i)},
                    content: <FontAwesomeIcon icon={faXmark} />,
                    hoverText: 'Decline'
                  }
                  ]}
                  key={i}
                  >
                    <p>{fromName} wants to be friends with you!</p>
                  </NotificationContainer>
                )
              }else if (type === 3) {
                return (
                  <NotificationContainer fromProfile={fromId} zIndex={notifications.length - i} buttons={[{
                    onClick: () => {friendRequestReply(fromId, false, notification.i)},
                    content: <FontAwesomeIcon icon={faXmark} />,
                    hoverText: 'Decline'
                  },
                  {
                    onClick: () => {friendRequestReply(fromId, false, notification.i)},
                    content: <FontAwesomeIcon icon={faXmark} />,
                    hoverText: 'Decline'
                  }
                  ]}
                  key={i}
                  >
                    <p>{fromName} wants to be friends with you!</p>
                  </NotificationContainer>
                )
              }else if (type === 4) {
                return (
                  <NotificationContainer fromProfile={fromId} zIndex={notifications.length - i} buttons={[{
                    onClick: () => {friendRequestReply(fromId, false, notification.i)},
                    content: <FontAwesomeIcon icon={faXmark} />,
                    hoverText: 'Decline'
                  },
                  {
                    onClick: () => {friendRequestReply(fromId, false, notification.i)},
                    content: <FontAwesomeIcon icon={faXmark} />,
                    hoverText: 'Decline'
                  }
                  ]}
                  key={i}
                  >
                    <p>{fromName} wants to be friends with you!</p>
                  </NotificationContainer>
                )
              }

            })}
          </div>
        ) : (
          <div className={styles.noNotifications}>
            You don&apos;t have any notifications
          </div>
        )}
      </div>
    </Draggable>
  );
}

export default NotificationModal;