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

function NotificationContainer({ children, userInfo, message }) {
  const router = useRouter();

  return (
    <div className={styles.NotificationContainer}>
      {message.contents.map((content, i) => {
        if (content === "##profileCard") {
          return (
            <div className={styles.profile} key={i}>
              <UserContainer
                userInfo={userInfo}
                style={{ fontSize: "0.8rem" }}
                maxNameWidht="7rem"
                onClick={() => {
                  router.push(`/dashboard/user/${userInfo.user_id}`);
                }}
              />
            </div>
          );
        }
        return <div className={styles.message}>{content}</div>;
      })}
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

  const friendRequestReply = useCallback(async (notificationId, accepted) => {
    const response = await postFriendsRequestReply({
      notificationId,
      accepted,
    });

    //filterNotification(notificationId);

    if (!response.success) return;

    friendsStatusRefetch();
    friendsTrendRefetch();
  }, []);

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
                message={notification.message}
                userInfo={notification.userInfo}
              >
                <NotificationBtn
                  hoverText={"Accept"}
                  onClick={() => {
                    friendRequestReply(notification.notification_id, true);
                  }}
                >
                  <FontAwesomeIcon icon={faCheck} />
                </NotificationBtn>
                <NotificationBtn
                  hoverText={"Decline"}
                  onClick={() => {
                    friendRequestReply(notification.notification_id, false);
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
