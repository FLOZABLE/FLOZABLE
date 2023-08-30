import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./TopNotification.module.css";
import { faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";

function TopNotification(props) {

  const [notification, setNotification] = useState(null);
  const [notify, setNotify] = useState(false);

  useEffect(() => {
    const response  = props.response;
    console.log(response)
    if (response.success) {
      setNotification(
        <div className={styles.success}>
          <FontAwesomeIcon icon={faCircleCheck} />
          <p className={styles.msg}>{props.successMsg}</p>
        </div>
      );
    } else {
      setNotification(
        <div className={styles.fail}>
          <FontAwesomeIcon icon={faCircleXmark} />
          <p className={styles.msg}>{props.successMsg}</p>
        </div>
      );
    };
    setNotify(true);
    setTimeout(() => {
      setNotify(false);
    }, props.duration);
  }, [props.response]);

  return (
    <div className={`${styles.TopNotification} ${notify ? styles.notify : ''}`}>
      {notification}
    </div>
  );
};

export default TopNotification;