import { useState } from "react";
import styles from "./FrinedRequestsViewer.module.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function FrinedRequestsViewer({ setResponse }) {
  const [isIncoming, setIsIncoming] = useState(true);

  const friendRequestReply = (targetId, accepted, notificationId) => {
    fetch(`${serverOrigin}/api/account/friend-request-reply`, {
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

  return (
    <div className={styles.FrinedRequestsViewer}>
      <div className={styles.title}>
        Friend Requests
      </div>
      <div className={styles.optionsWrapper}>
        <div className={styles.buttonsContainer}>
          <button onClick={() => { setIsIncoming(true) }}>
            <p>Incoming</p>
            <div className={styles.count}>
              5
            </div>
          </button>
          <button onClick={() => { setIsIncoming(false) }}>
            <p>Outgoing</p>
            <div className={styles.count}>
              5
            </div>
          </button>
        </div>
        <div className={`${styles.lineContainer} ${isIncoming ? styles.incoming : ''}`}>
          <div className={styles.line}></div>
        </div>
      </div>
      <ul className={styles.frinedRequests}>
        <li className={styles.frinedRequest}>
          <Link to={`/dashboard/user/{fromId}`} className={styles.profileImg}
            style={{
              backgroundImage: `url("${serverOrigin}/profile-images/d.jpeg")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}>
          </Link>
          <div className={styles.content}>
            <p>{/* {fromName} */}Jason Lee</p>
          </div>
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
        </li>
      </ul>
    </div>
  )
};

export default FrinedRequestsViewer;