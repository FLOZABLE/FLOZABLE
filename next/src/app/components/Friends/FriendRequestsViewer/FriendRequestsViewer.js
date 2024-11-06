import React, { useCallback, useContext, useEffect, useState } from "react";
import styles from "./FriendRequestsViewer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { NotificationsContext } from "@/app/utils/Contexts";
import config from "@/app/utils/config";
import SlidingOptBtn from "@/app/components/Buttons/SlidingOptBtn/SlidingOptBtn";
import UserContainer from "../../Users/UserContainer/UserContainer";
import { useRouter } from "next/navigation";
import { postFriendsRequestReply } from "@/Api/friendsApi";
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
  const { setNotifications } = useContext(NotificationsContext);
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

  const friendRequestReply = useCallback(
    async (targetId, accepted, notificationId) => {
      try {
        const response = await postFriendsRequestReply({
          targetId,
          accepted,
          notificationId,
        });

        filterNotification(notificationId);

        if (!response.success) return;

        friendsStatusRefetch();
        friendsTrendRefetch();
      } catch (err) {
        console.log(err);
      }
    },
    [notifications]
  );

  const sentRequestClear = (targetId, notificationId) => {
    fetch(`${config.server}/friends/request`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId }),
      credentials: "include",
    })
      .then((response) => response.json())
      .catch((error) => console.error(error));

    filterNotification(notificationId);
  };

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
                        sentRequestClear(request.notification_id);
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
