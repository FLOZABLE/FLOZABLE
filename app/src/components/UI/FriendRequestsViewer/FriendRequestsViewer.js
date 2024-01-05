import { useEffect, useState } from "react";
import styles from "./FriendRequestsViewer.module.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import CountryViewer from "../CountryViewer/CountryViewer";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function FriendRequestsViewer({ setResponse, notifications, setNotifications }) {
  const [isIncoming, setIsIncoming] = useState(true);
  const [friendRequestEl, setFriendRequestEl] = useState([]);
  const [sentRequestsEl, setSentRequestsEl] = useState([]);

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
    
    setSentRequestsEl(sentRequests.map((sentRequest) => {
      const { f, i } = sentRequest;
      const { name, timezone, user_id } = f;
      return (
        <div className={styles.friendRequest} key={i}>
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
              <p>{/* {fromName} */}{name}</p>
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
              <p>{/* {fromName} */}{name}</p>
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
    }))
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
      <div className={styles.title}>
        Friend Requests
      </div>
      <div className={styles.optionsWrapper}>
        <div className={styles.buttonsContainer}>
          <button onClick={() => { setIsIncoming(true) }}>
            <p>Incoming</p>
            <div className={styles.count}>
              {friendRequestEl.length}
            </div>
          </button>
          <button onClick={() => { setIsIncoming(false) }}>
            <p>Outgoing</p>
            <div className={styles.count}>
              {sentRequestsEl.length}
            </div>
          </button>
        </div>
        <div className={`${styles.lineContainer} ${isIncoming ? styles.incoming : ''}`}>
          <div className={styles.line}></div>
        </div>
      </div>
      <div className={`${styles.friendRequests} ${isIncoming ? styles.open : ''}`}>
      {friendRequestEl.length ? friendRequestEl : <p>No incoming requests</p>}
      </div>
      <div className={`${styles.friendRequests} ${!isIncoming ? styles.open : ''}`} id={styles.outgoing}>
        {sentRequestsEl.length ? sentRequestsEl : <p>No outgoing requests</p>}
      </div>
    </div>
  )
};

export default FriendRequestsViewer;