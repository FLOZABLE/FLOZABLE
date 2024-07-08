import React, { useContext, useEffect, useState } from "react";
import styles from "./FriendRequestsViewer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { NotificationsContext } from "@/app/utils/Contexts";
import Link from "next/link";
import config from "@/app/utils/config";
import SlidingOptBtn from "@/app/components/Buttons/SlidingOptBtn/SlidingOptBtn";
import CountryViewer from "@/app/components/Others/CountryViewer/CountryViewer";
import ProfileImage from "@/app/components/Users/ProfileImage/ProfileImage";

function FriendRequestsViewer() {
  const { notifications, setNotifications } = useContext(NotificationsContext);

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
      };
      return;
    });

    setFriendRequests(friendRequests);
    setSentRequests(sentRequests);
  }, [notifications]);

  const friendRequestReply = (targetId, accepted, notificationId) => {
    fetch(`${config.server}/friend/request/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId, accepted, notificationId }),
      credentials:"include"
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
      })
      .catch((error) => console.error(error));

    setNotifications(notifications.filter(notif => notif.i !== notificationId));
  };

  const sentRequestClear = (targetId, notificationId) => {
    fetch(`${config.server}/friend/request`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId }),
      credentials:"include"
    })
      .then((response) => response.json())
      .catch((error) => console.error(error));

    setNotifications(notifications.filter(notif => notif.i !== notificationId));
  };

  return (
    <div className={styles.FriendRequestsViewer}>
      <SlidingOptBtn
        options={
          {
            0: `Incoming (${friendRequests.length})`,
            1: `Outgoing (${sentRequests.length})`
          }
        }
        value={viewer}
        setValue={setViewer}
      />
      {parseInt(viewer) ? sentRequests.map((request, index) => {
        const { f, i } = request;
        const { name, timezone, user_id } = f;
        return (
          <div className={styles.friendRequest} style={{ zIndex: sentRequests.length - index + 1 }} key={i}>
            <Link href={`/dashboard/user/${user_id}`} >
              <div className={styles.content}>
                <ProfileImage
                  userId={user_id}
                />
                <p className={`${styles.name} overflowDot`}>{name}</p>
                <CountryViewer timezone={timezone} />
              </div>
            </Link>
            <div className={styles.buttons}>
              <div className={`${styles.btnWrapper} ${styles.decline}`}>
                <button onClick={() => { sentRequestClear(user_id, i) }}>
                  <FontAwesomeIcon icon={faXmark} />
                </button>
                <div className={styles.hoverDisp}>
                  Abort
                </div>
              </div>
            </div>
          </div>
        )
      }) :
        friendRequests.map((request, index) => {
          const { f, i } = request;
          const { name, timezone, user_id } = f;
          return (
            <div className={styles.friendRequest} style={{ zIndex: friendRequests.length - index + 1 }} key={i}>
              <Link href={`/dashboard/user/${user_id}`} >
                <div className={styles.content}>
                  <ProfileImage
                    userId={user_id}
                  />
                  <p className={`${styles.name} overflowDot`}>{name}</p>
                  <CountryViewer timezone={timezone} />
                </div>
              </Link>
              <div className={styles.buttons}>
                <div className={`${styles.btnWrapper} ${styles.decline}`}>
                  <button onClick={() => { friendRequestReply(user_id, false, i) }}>
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                  <div className={styles.hoverDisp}>
                    Decline
                  </div>
                </div>
                <div className={`${styles.btnWrapper} ${styles.accept}`}>
                  <button onClick={() => { friendRequestReply(user_id, true, i) }}>
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                  <div className={styles.hoverDisp}>
                    Accept
                  </div>
                </div>
              </div>
            </div>
          )
        })
      }
      {parseInt(viewer) === 1 && !sentRequests.length ? (
        <div className={styles.dispMsg}>
          No outgoing requests
        </div>
      ) : (
        parseInt(viewer) === 0 && !friendRequests.length ? (
          <div className={styles.dispMsg}>
            No incoming requests
          </div>
        ) : null
      )}

    </div>
  )
};

export default FriendRequestsViewer;