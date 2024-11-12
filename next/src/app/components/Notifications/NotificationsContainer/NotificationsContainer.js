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
import { deleteNotification } from "@/Api/notificationsApi";

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

    filterNotification(notificationId);

    if (!response.success) return;

    friendsStatusRefetch();
    friendsTrendRefetch();
  }, []);

  const onDeleteNotification = useCallback((notificationId) => {
    filterNotification(notificationId);

    deleteNotification(notificationId);
  }, []);

  const chatRequestReply = useCallback(async (notificationId, accepted) => {

    filterNotification(notificationId);

    postChatRequestReply({
      accepted,
      notificationId,
    });
  }, []);

  const planShareRespond = useCallback((notificationId, accepted) => {
    filterNotification(notificationId);

    postPlanShareRespond(notificationId, accepted);
  }, []);

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
                userInfo={notification.userinfo}
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
          } else if (notification.type === "friend_request_accepted") {
            return (
              <NotificationContainer
                key={i}
                message={notification.message}
                userInfo={notification.userinfo}
              >
                <NotificationBtn
                  hoverText={"Got It"}
                  onClick={() => {
                    onDeleteNotification(notification.notification_id);
                  }}
                >
                  <FontAwesomeIcon icon={faCheck} />
                </NotificationBtn>
              </NotificationContainer>
            );
          } else if (notification.type === "plan_share") {
            return (
              <NotificationContainer
                key={i}
                message={notification.message}
                userInfo={notification.userinfo}
              >
                <NotificationBtn
                  hoverText={"Accept"}
                  onClick={() => {
                    planShareRespond(notification.notification_id, true);
                  }}
                >
                  <FontAwesomeIcon icon={faCheck} />
                </NotificationBtn>
                <NotificationBtn
                  hoverText={"Decline"}
                  onClick={() => {
                    planShareRespond(notification.notification_id, false);
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </NotificationBtn>
              </NotificationContainer>
            );
          } else if (notification.type === "plan_shared") {
            return (
              <NotificationContainer
                key={i}
                message={notification.message}
                userInfo={notification.userinfo}
              >
                <NotificationBtn
                  hoverText={"Got It"}
                  onClick={() => {
                    onDeleteNotification(notification.notification_id);
                  }}
                >
                  <FontAwesomeIcon icon={faCheck} />
                </NotificationBtn>
              </NotificationContainer>
            );
          } else if (notification.type === "chat_request") {
            return (
              <NotificationContainer
                key={i}
                message={notification.message}
                userInfo={notification.userinfo}
              >
                <NotificationBtn
                  hoverText={"Accept"}
                  onClick={() => {
                    chatRequestReply(notification.notification_id, true);
                  }}
                >
                  <FontAwesomeIcon icon={faCheck} />
                </NotificationBtn>
                <NotificationBtn
                  hoverText={"Decline"}
                  onClick={() => {
                    chatRequestReply(notification.notification_id, false);
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
