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

function SentFriendRequestContainer({
  friendRequest,
  friendRequestDelete,
  style,
}) {
  const router = useRouter();

  return (
    <div className={styles.FriendRequestContainer} style={style}>
      <UserContainer
        userInfo={friendRequest.userinfo}
        onClick={() => {
          router.push(`/dashboard/user/${friendRequest.userinfo.user_id}`);
        }}
      />
      <div className={styles.buttons}>
        <div
          className={styles.button}
          onClick={() => {
            friendRequestDelete(request.notification_id);
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
          <div className={`HoverText ${styles.hoverText}`}>Abort</div>
        </div>
      </div>
    </div>
  );
}

function ReceivedFriendRequestContainer({
  friendRequest,
  friendRequestReply,
  style,
}) {
  const router = useRouter();

  return (
    <div className={styles.FriendRequestContainer} style={style}>
      <UserContainer
        userInfo={friendRequest.userinfo}
        onClick={() => {
          router.push(`/dashboard/user/${friendRequest.userinfo.user_id}`);
        }}
      />
      <div className={styles.buttons}>
        <div
          className={styles.button}
          onClick={() => {
            friendRequestReply(request.notification_id, false);
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
          <div className={`HoverText ${styles.hoverText}`}>Decline</div>
        </div>
        <div
          className={styles.button}
          onClick={() => {
            friendRequestReply(request.notification_id, true);
          }}
        >
          <FontAwesomeIcon icon={faCheck} />
          <div className={`HoverText ${styles.hoverText}`}>Accept</div>
        </div>
      </div>
    </div>
  );
}

export { SentFriendRequestContainer, ReceivedFriendRequestContainer };

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
                <SentFriendRequestContainer
                  friendRequest={request}
                  key={i}
                  style={{ zIndex: friendRequests.length - i }}
                  friendRequestDelete={friendRequestDelete}
                />
              );
            })
          : friendRequests.map((request, i) => {
              return (
                <ReceivedFriendRequestContainer
                  friendRequest={request}
                  key={i}
                  style={{ zIndex: friendRequests.length - i }}
                  friendRequestReply={friendRequestReply}
                />
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
