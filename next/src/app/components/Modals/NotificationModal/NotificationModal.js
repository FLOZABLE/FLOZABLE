"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./NotificationModal.module.css";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import React, { useContext, useRef } from "react";
import Draggable from "react-draggable";
import {
  ModalsContext,
  NotificationsContext,
  PlansContext,
  ResponseContext,
} from "@/app/utils/Contexts";
import NotificationContainer from "@/app/components/Notifications/NotificationContainer/NotificationContainer";
import config from "@/app/utils/config";
import { postPlanShareRespond } from "@/Api/planApi";

function NotificationModal({}) {
  const { isNotificationModal, setIsNotificationModal } =
    useContext(ModalsContext);
  const { notifications, setNotifications } = useContext(NotificationsContext);
  const { setResponse } = useContext(ResponseContext);
  const { plans } = useContext(PlansContext);

  const moveRef = useRef(null);

  const friendRequestReply = (targetId, accepted, notificationId) => {
    fetch(`${config.server}/friend/request/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId, accepted }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
      })
      .catch((error) => console.error(error));

    setNotifications(
      notifications.filter((notif) => notif.i !== notificationId)
    );
  };

  const deleteNotification = (notificationId) => {
    fetch(`${config.server}/notifications/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notificationId }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
      })
      .catch((error) => console.error(error));

    setNotifications(
      notifications.filter((notif) => notif.i !== notificationId)
    );
  };
  /* 
  const challengeRequestReply = (targetId, accepted, notificationId) => {
    fetch(`${config.server}/challenges/challenge-request-reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId, accepted }),
      credentials: "include"
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
      })
      .catch((error) => console.error(error));

    setNotifications(
      notifications.filter((notif) => notif.i !== notificationId),
    );
  }; */

  const chatRequestReply = (targetId, accepted, notificationId) => {
    fetch(`${config.server}/chat/chat-request-reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId, accepted }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
      })
      .catch((error) => console.error(error));

    setNotifications(
      notifications.filter((notif) => notif.i !== notificationId)
    );
  };

  return (
    <Draggable nodeRef={moveRef}>
      <div
        className={`${styles.NotificationModal} ${
          isNotificationModal ? styles.opened : ""
        }`}
        ref={moveRef}
      >
        <div className={styles.header}>
          <i
            onClick={() => {
              setIsNotificationModal(false);
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </i>
        </div>
        {notifications.length ? (
          <div className={`${styles.notifications} customScroll`}>
            {notifications.map((notification, i) => {
              const type = notification.t;
              const sender = notification.f;
              const fromId = sender ? sender.user_id : "";
              const fromName = sender ? sender.name : "";

              if (type === 0) {
                return (
                  <NotificationContainer
                    fromProfile={fromId}
                    zIndex={notifications.length - i}
                    buttons={[
                      {
                        onClick: () => {
                          friendRequestReply(fromId, true, notification.i);
                        },
                        content: (
                          <FontAwesomeIcon
                            icon={faCheck}
                            color={"green"}
                            fontSize="2rem"
                          />
                        ),
                        hoverText: "Accept",
                      },
                      {
                        onClick: () => {
                          friendRequestReply(fromId, false, notification.i);
                        },
                        content: (
                          <FontAwesomeIcon
                            icon={faXmark}
                            color={"red"}
                            fontSize="2rem"
                          />
                        ),
                        hoverText: "Decline",
                      },
                    ]}
                    key={i}
                  >
                    <p>{fromName} wants to be friends with you!</p>
                  </NotificationContainer>
                );
              } else if (type === 1) {
                return (
                  <NotificationContainer
                    fromProfile={fromId}
                    zIndex={notifications.length - i}
                    buttons={[
                      {
                        onClick: () => {
                          deleteNotification(notification.i);
                        },
                        content: (
                          <FontAwesomeIcon
                            icon={faCheck}
                            color={"green"}
                            fontSize="2rem"
                          />
                        ),
                        hoverText: "Got it!",
                      },
                    ]}
                    key={i}
                  >
                    <p>{fromName} and you are now friends!</p>
                  </NotificationContainer>
                );
              } /* else if (type === 2) {
                return (
                  <NotificationContainer fromProfile={fromId} zIndex={notifications.length - i} buttons={[{
                    onClick: () => { friendRequestReply(fromId, false, notification.i) },
                    content: <FontAwesomeIcon icon={faXmark} />,
                    hoverText: 'Decline'
                  },
                  {
                    onClick: () => { friendRequestReply(fromId, false, notification.i) },
                    content: <FontAwesomeIcon icon={faXmark} />,
                    hoverText: 'Decline'
                  }
                  ]}
                    key={i}
                  >
                    <p>{fromName} wants to be friends with you!</p>
                  </NotificationContainer>
                )
              } else if (type === 3) {
                return (
                  <NotificationContainer fromProfile={fromId} zIndex={notifications.length - i} buttons={[{
                    onClick: () => { friendRequestReply(fromId, false, notification.i) },
                    content: <FontAwesomeIcon icon={faXmark} />,
                    hoverText: 'Decline'
                  },
                  {
                    onClick: () => { friendRequestReply(fromId, false, notification.i) },
                    content: <FontAwesomeIcon icon={faXmark} />,
                    hoverText: 'Decline'
                  }
                  ]}
                    key={i}
                  >
                    <p>{fromName} wants to be friends with you!</p>
                  </NotificationContainer>
                )
              }  */ else if (type === 4) {
                return (
                  <NotificationContainer
                    fromProfile={fromId}
                    zIndex={notifications.length - i}
                    buttons={[
                      {
                        onClick: () => {
                          chatRequestReply(fromId, false, notification.i);
                        },
                        content: (
                          <FontAwesomeIcon
                            icon={faCheck}
                            color={"green"}
                            fontSize="2rem"
                          />
                        ),
                        hoverText: "Accept",
                      },
                      {
                        onClick: () => {
                          chatRequestReply(fromId, false, notification.i);
                        },
                        content: (
                          <FontAwesomeIcon
                            icon={faXmark}
                            color={"red"}
                            fontSize="2rem"
                          />
                        ),
                        hoverText: "Decline",
                      },
                    ]}
                    key={i}
                  >
                    <p>{fromName} wants to chat with you!</p>
                  </NotificationContainer>
                );
              } else if (type === 7) {
                return (
                  <NotificationContainer
                    fromProfile={fromId}
                    zIndex={notifications.length - i}
                    buttons={[
                      {
                        onClick: () => {
                          postPlanShareRespond(notification.pi, true);
                          setNotifications(
                            notifications.filter(
                              (notif) => notif.i !== notification.i
                            )
                          );
                        },
                        content: (
                          <FontAwesomeIcon
                            icon={faCheck}
                            color={"green"}
                            fontSize="2rem"
                          />
                        ),
                        hoverText: "Accept",
                      },
                      {
                        onClick: () => {
                          postPlanShareRespond(notification.pi, false);
                          setNotifications(
                            notifications.filter(
                              (notif) => notif.i !== notification.i
                            )
                          );
                        },
                        content: (
                          <FontAwesomeIcon
                            icon={faXmark}
                            color={"red"}
                            fontSize="2rem"
                          />
                        ),
                        hoverText: "Decline",
                      },
                    ]}
                    key={i}
                  >
                    <p>
                      {fromName} wants to share plan {notification.n}!
                    </p>
                  </NotificationContainer>
                );
              } else if (type === 8) {
                const plan = plans.find((plan) => plan.id === notification.pi);
                return (
                  <NotificationContainer
                    fromProfile={fromId}
                    zIndex={notifications.length - i}
                    buttons={[
                      {
                        onClick: () => {
                          deleteNotification(notification.i);
                        },
                        content: (
                          <FontAwesomeIcon
                            icon={faCheck}
                            color={"green"}
                            fontSize="2rem"
                          />
                        ),
                        hoverText: "Got it!",
                      },
                    ]}
                    key={i}
                  >
                    <p>
                      {fromName} can now view plan &quot;
                      {plan ? plan.title : notification.n}&quot; !
                    </p>
                  </NotificationContainer>
                );
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
