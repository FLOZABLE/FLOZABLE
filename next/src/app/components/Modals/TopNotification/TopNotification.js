"use client";

import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./TopNotification.module.css";
import {
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { ResponseContext } from "@/app/utils/Contexts";

function TopNotification() {
  const {response} = useContext(ResponseContext);

  const [notification, setNotification] = useState(null);
  const [notify, setNotify] = useState(false);

  useEffect(() => {
    if (!response) return;

    if (response.success) {
      setNotification(
        <div className={`${styles.success} ${styles.notification}`}>
          <i>
            <FontAwesomeIcon icon={faCircleCheck} />
          </i>
          <p className={styles.msg}>{response.msg}</p>
        </div>,
      );
    } else {
      setNotification(
        <div className={`${styles.fail} ${styles.notification}`}>
          <i>
            <FontAwesomeIcon icon={faCircleXmark} />
          </i>
          <p className={styles.msg}>{response.reason}</p>
        </div>,
      );
    }
    setNotify(false);
    setTimeout(() => {
      setNotify(true);
    }, 100);
  }, [response]);

  console.log(response)

  return (
    <div className={`${styles.TopNotification} ${notify ? styles.notify : ""}`}>
      {notification}
    </div>
  );
}

export default TopNotification;