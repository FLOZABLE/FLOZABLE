import { useEffect, useState } from "react";
import styles from "./FriendRequestsViewer.module.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import CountryViewer from "../CountryViewer/CountryViewer";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function FriendRequestsViewer({ setResponse, notifications, setNotifications }) {
  const [isIncoming, setIsIncoming] = useState(true);
  const [friendRequests, setFriendRequests] = useState([]);
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
    console.log('gd', friendRequests, sentRequests)
    setSentRequestsEl(sentRequests.map((sentRequest) => {
      console.log(sentRequest)
      const {f, i} = sentRequest;
      const {name, timezone, user_id} = f;
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
          <CountryViewer timezone={timezone}/>
        </div>
        </Link>
        <div className={styles.buttons}>
          <div className={`${styles.btnWrapper} ${styles.decline}`}>
            <button onClick={() => {sentRequestClear(user_id, i)}}>
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

    //setFriendRequestEl(friendRequests)
  }, [notifications]);

  const friendRequestReply = (targetId, accepted, notificationId) => {
    fetch(`${serverOrigin}/api/friend/request-reply`, {
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

    //setNotifications(notifications.filter(notif => notif.i !== notificationId));
  };

  const sentRequestClear = (targetId, notificationId) => {
    fetch(`${serverOrigin}/api/friend/request-cancel`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
      })
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
      <div className={styles.friendRequests}>
        {friendRequests.map((friendRequest, i) => {
          return (
            <div className={styles.friendRequest} key={i}>
            <Link to={`/dashboard/user/{fromId}`} >
            <div className={styles.content}>
            <div className={styles.profileImg}
              style={{
                backgroundImage: `url("${serverOrigin}/profile-images/d.jpeg")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
              }}>
            </div>
              <p>{/* {fromName} */}Jason Lee</p>
              <CountryViewer timezone={'s'}/>
            </div>
            </Link>
            <div className={styles.buttons}>
              <div className={`${styles.btnWrapper} ${styles.decline}`}>
                <button onClick={() => {/* friendRequestReply(fromId, false, notification.i) */ }}>
                  <FontAwesomeIcon icon={faXmark} />
                </button>
                <div className={styles.hoverDisp}>
                  Decline
                </div>
              </div>
              <div className={`${styles.btnWrapper} ${styles.accept}`}>
                <button onClick={() => {/* friendRequestReply(fromId, true, notification.i) */ }}>
                  <FontAwesomeIcon icon={faCheck} />
                </button>
                <div className={styles.hoverDisp}>
                  Accept
                </div>
              </div>
            </div>
          </div>
          )
        })}
      </div>
      <div className={styles.friendRequests} id={styles.ongoing}>
        {sentRequestsEl}
      </div>
    </div>
  )
};

export default FriendRequestsViewer;