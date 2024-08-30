import React, { useCallback, useContext, useEffect, useState } from "react";
import styles from "./FriendRequestsViewer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { NotificationsContext, ResponseContext } from "@/app/utils/Contexts";
import config from "@/app/utils/config";
import SlidingOptBtn from "@/app/components/Buttons/SlidingOptBtn/SlidingOptBtn";
import UserContainer from "../../Users/UserContainer/UserContainer";
import { useRouter } from "next/navigation";
import { postFriendsRequestReply } from "@/Api/friendsApi";
import { useFriendsStatus, useFriendsTrends } from "@/Hooks/friendsHooks";

function FriendRequestContainer({ friendRequest, children, style }) {
  const router = useRouter();

  return (
    <div className={styles.FriendRequestContainer} style={style}>
      <UserContainer
        userInfo={friendRequest.f}
        onClick={() => {
          router.push(`/dashboard/user/${friendRequest.f.user_id}`);
        }}
      />
      {children}
    </div>
  );
}

function FriendRequestsViewer() {
  const { notifications, setNotifications } = useContext(NotificationsContext);
  const { setResponse } = useContext(ResponseContext);
  const { friendsStatusRefetch } = useFriendsStatus();
  const { friendsTrendRefetch } = useFriendsTrends();

  const [viewer, setViewer] = useState(0);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  useEffect(() => {
    if (!notifications) return;
    const friendRequests = [];
    const sentRequests = [];

    notifications.map((notification) => {
      const type = notification.t;
      if (type === 0) {
        friendRequests.push(notification);
        return;
      } else if (type === -2) {
        sentRequests.push(notification);
        return;
      }
      return;
    });

    setFriendRequests(friendRequests);
    setSentRequests(sentRequests);
  }, [notifications]);

  const friendRequestReply = useCallback(
    (targetId, accepted, notificationId) => {
      (async () => {
        const data = await postFriendsRequestReply({
          targetId,
          accepted,
          notificationId,
        });

        setResponse(data);
        if (data.success) {
          friendsStatusRefetch();
          friendsTrendRefetch();
        }
      })();

      setNotifications(
        notifications.filter((notif) => notif.i !== notificationId)
      );
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

    setNotifications(
      notifications.filter((notif) => notif.i !== notificationId)
    );
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
                        sentRequestClear(request.f.user_id, request.i);
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
                        friendRequestReply(request.f.user_id, false, request.i);
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
                        friendRequestReply(request.f.user_id, true, request.i);
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
