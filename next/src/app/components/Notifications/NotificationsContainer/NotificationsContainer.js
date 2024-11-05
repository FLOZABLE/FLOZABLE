import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./NotificationsContainer.module.css";
import { useNotifications } from "@/Hooks/notificationsHooks";
import { faBell, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useFriendsStatus, useFriendsTrends } from "@/Hooks/friendsHooks";
import { useCallback } from "react";
import { postFriendsRequestReply } from "@/Api/friendsApi";
import { postPlanShareRespond } from "@/Api/plansApi";
import { useRouter } from "next/navigation";
import UserContainer from "../../Users/UserContainer/UserContainer";
import { postChatRequestReply } from "@/Api/chatApi";
import { useQueryClient } from "@tanstack/react-query";

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

export default function NotificationsContainer() {
  const { notifications, filterNotification } = useNotifications();
  const { friendsStatusRefetch } = useFriendsStatus();
  const { friendsTrendRefetch } = useFriendsTrends();

  console.log(notifications, "notifications");

  const friendRequestReply = useCallback(
    async (notification, accepted) => {
      const targetId = notification?.f?.user_id;
      const notificationId = notification.notification_id;
      //filterNotification(notificationId);

      const response = await postFriendsRequestReply({
        targetId,
        accepted,
        notificationId,
      });
      if (!response.success) return;

      setTimeout(() => {
        friendsStatusRefetch();
        friendsTrendRefetch();
      }, 500);
    },
    [notifications]
  );

  const deleteNotification = useCallback(
    (notification) => {
      const notificationId = notification.notification_id;
      filterNotification(notificationId);

      postNotificationsRead(notificationId);
    },
    [notifications]
  );

  const chatRequestReply = useCallback(
    async (notification, accepted) => {
      const targetId = notification?.f?.user_id;
      const notificationId = notification.notification_id;

      filterNotification(notificationId);

      postChatRequestReply({
        targetId,
        accepted,
        notificationId,
      });
    },
    [notifications]
  );

  const planShareRespond = useCallback(
    (notification, accepted) => {
      const notificationId = notification.notification_id;
      filterNotification(notificationId);

      postPlanShareRespond(notificationId, accepted);
    },
    [notifications]
  );

  return (
    <div className={styles.NotificationsContainer}>
      <div className={styles.bell}>
        <i>
          <FontAwesomeIcon
            icon={faBell}
            bounce={
              !!notifications.filter(
                (notification) => notification.type !== "friend_request_sent"
              ).length
            }
          />
        </i>
        <div className={styles.count}>
          {
            notifications.filter(
              (notification) => notification.type !== "friend_request_sent"
            ).length
          }
        </div>
      </div>
      <div className={`customScroll ${styles.notifications}`}>
        {notifications.map((notification, i) => {
          if (notification.type === "friend_request") {
            return (
              <NotificationContainer
                key={i}
                title={notification.message}
                userInfo={notification?.userInfo}
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
