import React, { useEffect, useState } from "react";
import styles from "./FriendRequestsViewer.module.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import CountryViewer from "../CountryViewer/CountryViewer";
import SlidingOptBtn from "../SlidingOptBtn/SlidingOptBtn";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function FriendRequestsViewer({ setResponse, notifications, setNotifications }) {
  const [isIncoming, setIsIncoming] = useState(true);
  const [viewer, setViewer] = useState(0);
  const [friendRequestEl, setFriendRequestEl] = useState([]);
  const [sentRequestsEl, setSentRequestsEl] = useState([]);
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
    /* 
    setSentRequestsEl(sentRequests.map((sentRequest, index) => {
      const { f, i } = sentRequest;
      const { name, timezone, user_id } = f;
      return (
        <div className={styles.friendRequest} style={{zIndex: sentRequests.length - index + 1}} key={i}>
          <Link to={`/dashboard/user/${user_id}`} >
            <div className={styles.content}>
              <div className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/${user_id}.jpeg")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}>
              </div>
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
    }));

    setFriendRequestEl(friendRequests.map((friendRequest) => {
      const { f, i } = friendRequest;
      const { name, timezone, user_id } = f;
      return (
        <div className={styles.friendRequest} key={i}>
          <Link to={`/dashboard/user/{fromId}`} >
            <div className={styles.content}>
              <div className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/${user_id}.jpeg")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}>
              </div>
              <p className={`${styles.name} overflowDot`}>{name}</p>
              <CountryViewer timezone={timezone} />
            </div>
          </Link>
          <div className={styles.buttons}>
            <div className={`${styles.btnWrapper} ${styles.decline}`}>
              <button onClick={() => {friendRequestReply(user_id, false, i) }}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
              <div className={styles.hoverDisp}>
                Decline
              </div>
            </div>
            <div className={`${styles.btnWrapper} ${styles.accept}`}>
              <button onClick={() => {friendRequestReply(user_id, true, i) }}>
                <FontAwesomeIcon icon={faCheck} />
              </button>
              <div className={styles.hoverDisp}>
                Accept
              </div>
            </div>
          </div>
        </div>
      )
    })) */
  }, [notifications]);

  const friendRequestReply = (targetId, accepted, notificationId) => {
    fetch(`${serverOrigin}/friend/request-reply`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId, accepted }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
      })
      .catch((error) => console.error(error));

    setNotifications(notifications.filter(notif => notif.i !== notificationId));
  };

  const sentRequestClear = (targetId, notificationId) => {
    fetch(`${serverOrigin}/friend/request-cancel`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId }),
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
            <Link to={`/dashboard/user/${user_id}`} >
              <div className={styles.content}>
                <div className={styles.profileImg}
                  style={{
                    backgroundImage: `url("${serverOrigin}/profile-images/${user_id}.jpeg")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                  }}>
                </div>
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
              <Link to={`/dashboard/user/{fromId}`} >
                <div className={styles.content}>
                  <div className={styles.profileImg}
                    style={{
                      backgroundImage: `url("${serverOrigin}/profile-images/${user_id}.jpeg")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center center',
                      backgroundRepeat: 'no-repeat',
                    }}>
                  </div>
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