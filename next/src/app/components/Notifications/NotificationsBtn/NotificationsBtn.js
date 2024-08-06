import { useCallback, useContext, useEffect, useState } from "react";
import styles from "./NotificationsBtn.module.css";
import { NotificationsContext, ResponseContext } from "@/app/utils/Contexts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import UserContainer from "../../Users/UserContainer/UserContainer";
import { useRouter } from "next/navigation";
import { postFriendsRequestReply } from "@/Api/friendsApi";
import { postNotificationsRead } from "@/Api/notificationsApi";
import { postChatRequestReply } from "@/Api/chatApi";
import { postPlanShareRespond } from "@/Api/plansApi";

function NotificationContainer({ children, userInfo, title }) {
  const router = useRouter();

  return (
    <div className={styles.NotificationContainer}>
      {userInfo ? (
        <div className={styles.profile}>
          <UserContainer
            userInfo={userInfo}
            style={{ fontSize: "0.8rem" }}
            maxNameWidht="7rem"
            onClick={() => {
              router.push(`/dashboard/user/${userInfo.user_id}`);
            }}
          />
        </div>
      ) : null}
      <div className={styles.title}>{title}</div>
      <div className={styles.buttons}>{children}</div>
    </div>
  );
}

function NotificationBtn({ children, hoverText, onClick }) {
  return (
    <div className={styles.NotificationBtn} onClick={onClick}>
      <i>{children}</i>
      {hoverText ? (
        <div className={`HoverText ${styles.hoverText}`}>{hoverText}</div>
      ) : null}
    </div>
  );
}
export default function NotificationsBtn() {
  const { notifications, setNotifications } = useContext(NotificationsContext);
  const { setResponse } = useContext(ResponseContext);

  const [filteredNotifications, setFilteredNotifications] = useState([]);

  useEffect(() => {
    if (!notifications) return;

    setFilteredNotifications(
      notifications.filter((notification) => notification.t >= 0)
    );
  }, [notifications]);

  const friendRequestReply = useCallback(
    (notification, accepted) => {
      const targetId = notification?.f?.user_id;
      const notificationId = notification?.i;

      (async () => {
        const data = await postFriendsRequestReply({
          targetId,
          accepted,
          notificationId,
        });

        setResponse(data);
      })();

      setNotifications(
        notifications.filter((notif) => notif.i !== notificationId)
      );
    },
    [notifications]
  );

  const deleteNotification = useCallback(
    (notification) => {
      const notificationId = notification?.i;

      (async () => {
        const data = await postNotificationsRead(notificationId);
        console.log(data);
      })();

      setNotifications(
        notifications.filter((notif) => notif.i !== notificationId)
      );
    },
    [notifications]
  );

  const chatRequestReply = useCallback(
    (notification, accepted) => {
      const targetId = notification?.f?.user_id;
      const notificationId = notification?.i;

      (async () => {
        const data = await postChatRequestReply({
          targetId,
          accepted,
          notificationId,
        });

        setResponse(data);
      })();

      setNotifications(
        notifications.filter((notif) => notif.i !== notificationId)
      );
    },
    [notifications]
  );

  const planShareRespond = useCallback(
    (notification, accepted) => {
      const notificationId = notification?.i;

      (async () => {
        const data = await postPlanShareRespond(notificationId, accepted);

        setResponse(data);
      })();

      setNotifications(
        notifications.filter((notif) => notif.i !== notificationId)
      );
    },
    [notifications]
  );

  return (
    <div className={styles.NotificationsBtn}>
      <div className={styles.bell}>
        <i>
          <FontAwesomeIcon
            icon={faBell}
            bounce={!!filteredNotifications.length}
          />
        </i>
        <div id={styles.count}>{filteredNotifications.length}</div>
      </div>
      <div className={`customScroll ${styles.notifications}`}>
        {notifications.map((notification, i) => {
          if (notification.t === 0) {
            const title = `wants to be friend!`;
            return (
              <NotificationContainer
                key={i}
                title={title}
                userInfo={notification?.f}
              >
                <NotificationBtn
                  hoverText={"Accept"}
                  onClick={() => {
                    friendRequestReply(notification, true);
                  }}
                >
                  <FontAwesomeIcon icon={faCheck} />
                </NotificationBtn>
                <NotificationBtn
                  hoverText={"Decline"}
                  onClick={() => {
                    friendRequestReply(notification, false);
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </NotificationBtn>
              </NotificationContainer>
            );
          } else if (notification.t === 1) {
            const title = `is now your friend`;
            return (
              <NotificationContainer
                key={i}
                title={title}
                userInfo={notification?.f}
              >
                <NotificationBtn
                  hoverText={"Got it"}
                  onClick={() => {
                    deleteNotification(notification);
                  }}
                >
                  <FontAwesomeIcon icon={faCheck} />
                </NotificationBtn>
              </NotificationContainer>
            );
          } else if (notification.t === 4) {
            const title = `wants to chat!`;
            return (
              <NotificationContainer
                key={i}
                title={title}
                userInfo={notification?.f}
              >
                <NotificationBtn
                  hoverText={"Accept"}
                  onClick={() => {
                    chatRequestReply(notification, true);
                  }}
                >
                  <FontAwesomeIcon icon={faCheck} />
                </NotificationBtn>
                <NotificationBtn
                  hoverText={"Decline"}
                  onClick={() => {
                    chatRequestReply(notification, false);
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </NotificationBtn>
              </NotificationContainer>
            );
          } else if (notification.t === 7) {
            const title = `wants to share a plan`;
            return (
              <NotificationContainer
                key={i}
                title={title}
                userInfo={notification?.f}
              >
                <NotificationBtn
                  hoverText={"Accept"}
                  onClick={() => {
                    planShareRespond(notification, true);
                  }}
                >
                  <FontAwesomeIcon icon={faCheck} />
                </NotificationBtn>
                <NotificationBtn
                  hoverText={"Decline"}
                  onClick={() => {
                    planShareRespond(notification, false);
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </NotificationBtn>
              </NotificationContainer>
            );
          }
        })}
      </div>
    </div>
  );
}
