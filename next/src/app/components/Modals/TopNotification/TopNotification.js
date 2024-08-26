"use client";

import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./TopNotification.module.css";
import {
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { ResponseContext } from "@/app/utils/Contexts";
import { useRouter, useSearchParams } from "next/navigation";

function TopNotification() {
  const { response, setResponse } = useContext(ResponseContext);

  const [notification, setNotification] = useState(null);
  const [notify, setNotify] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const success = searchParams.get("success");
  const msg = searchParams.get("msg");
  const reason = searchParams.get("reason");

  useEffect(() => {
    if ((success && msg) || (success && reason)) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("success");
      newSearchParams.delete("msg");
      newSearchParams.delete("reason");
      setResponse({ success: success === "true", msg, reason });

      router.replace(`/dashboard?${newSearchParams.toString()}`, {
        scroll: false,
      });
    }
  }, [success, msg, router, searchParams]);

  useEffect(() => {
    if (!response) return;

    if (response.success) {
      setNotification(
        <div className={`${styles.success} ${styles.notification}`}>
          <i>
            <FontAwesomeIcon icon={faCircleCheck} />
          </i>
          <p className={styles.msg}>{response.msg}</p>
        </div>
      );
    } else {
      setNotification(
        <div className={`${styles.fail} ${styles.notification}`}>
          <i>
            <FontAwesomeIcon icon={faCircleXmark} />
          </i>
          <p className={styles.msg}>{response.reason}</p>
        </div>
      );
    }
    setNotify(false);
    setTimeout(() => {
      setNotify(true);
    }, 100);
  }, [response]);

  console.log(response);

  return (
    <div className={`${styles.TopNotification} ${notify ? styles.notify : ""}`}>
      {notification}
    </div>
  );
}

export default TopNotification;
