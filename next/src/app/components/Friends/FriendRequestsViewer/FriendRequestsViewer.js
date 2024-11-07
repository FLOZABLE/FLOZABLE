import React, { useCallback, useEffect, useState } from "react";
import styles from "./FriendRequestsViewer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import SlidingOptBtn from "@/app/components/Buttons/SlidingOptBtn/SlidingOptBtn";
import UserContainer from "../../Users/UserContainer/UserContainer";
import { useRouter } from "next/navigation";
import { deleteFriendRequest, postFriendsRequestReply } from "@/Api/friendsApi";
import { useFriendsStatus, useFriendsTrends } from "@/Hooks/friendsHooks";
import { useNotifications } from "@/Hooks/notificationsHooks";

function FriendRequestContainer({ friendRequest, children, style }) {
  const router = useRouter();

  return (
    <div className={styles.FriendRequestContainer} style={style}>
      <UserContainer
        userInfo={friendRequest.userInfo}
        onClick={() => {
          router.push(`/dashboard/user/${friendRequest.userInfo.user_id}`);
        }}
      />
      {children}
    </div>
  );
}

function FriendRequestsViewer() {
  const { friendsStatusRefetch } = useFriendsStatus();
  const { friendsTrendRefetch } = useFriendsTrends();
  const { notifications, filterNotification } = useNotifications();

  const [viewer, setViewer] = useState(0);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  useEffect(() => {
    if (!notifications) return;
    const friendRequests = [];
    const sentRequests = [];

    notifications.map((notification) => {
      if (notification.type === "friend_request") {
        friendRequests.push(notification);
      } else if (notification.type === "friend_request_sent") {
        sentRequests.push(notification);
      }
    });

    setFriendRequests(friendRequests);
    setSentRequests(sentRequests);
  }, [notifications]);

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

  const friendRequestDelete = useCallback(async (notificationId) => {
    await deleteFriendRequest(notificationId);

    filterNotification(notificationId);
  }, []);

  return (
    <div className={`Box ${styles.FriendRequestsViewer}`}>
      <div className={`header ${styles.header}`}>
        <p>Friend Requests</p>
        <SlidingOptBtn
          options={[
            {
              name: `Incoming (${friendRequests.length})`,
              value: 0,
            },
            {
              name: `Outgoing (${sentRequests.length})`,
              value: 1,
            },
          ]}
          value={viewer}
          setValue={setViewer}
          isCheck={true}
        />
      </div>
      <div className={`contents ${styles.friendRequests} customScroll`}>
        {viewer
          ? sentRequests.map((request, i) => {
              return (
                <FriendRequestContainer
                  friendRequest={request}
                  key={i}
                  style={{ zIndex: friendRequests.length - i }}
                >
                  <div className={styles.buttons}>
                    <div
                      className={styles.button}
                      onClick={() => {
                        friendRequestDelete(request.notification_id);
                      }}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                      <div className={`HoverText ${styles.hoverText}`}>
                        Abort
                      </div>
                    </div>
                  </div>
                </FriendRequestContainer>
              );
            })
          : friendRequests.map((request, i) => {
              return (
                <FriendRequestContainer
                  friendRequest={request}
                  key={i}
                  style={{ zIndex: friendRequests.length - i }}
                >
                  <div className={styles.buttons}>
                    <div
                      className={styles.button}
                      onClick={() => {
                        friendRequestReply(request.notification_id, false);
                      }}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                      <div className={`HoverText ${styles.hoverText}`}>
                        Decline
                      </div>
                    </div>
                    <div
                      className={styles.button}
                      onClick={() => {
                        friendRequestReply(request.notification_id, true);
                      }}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                      <div className={`HoverText ${styles.hoverText}`}>
                        Accept
                      </div>
                    </div>
                  </div>
                </FriendRequestContainer>
              );
            })}
      </div>
      {viewer === "1" && !sentRequests.length ? (
        <div className={styles.dispMsg}>No outgoing requests</div>
      ) : viewer === "0" && !friendRequests.length ? (
        <div className={styles.dispMsg}>No incoming requests</div>
      ) : null}
    </div>
  );
}

export default FriendRequestsViewer;
