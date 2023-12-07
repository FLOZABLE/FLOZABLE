import React, { useEffect, useState, useRef } from "react";
import styles from "./MemberTimer.module.css";
import worker from "./TimeWorker";
import {socket} from "../../../socket.js";

function MemberTimer({ initialSec = 0, userInfo, initialStatus = false, reset = false }) {
  const [sec, setSec] = useState(0);
  const [min, setMin] = useState(0);
  const [hr, setHr] = useState(0);
  const [total, setTotal] = useState(0);
  const [run, setRun] = useState(false);

  useEffect(() => {
    setRun(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    if (!userInfo) return;
    const {user_id} = userInfo;
    const onStudying = () => {
      setRun(true);
    };

    const onStopStudying = () => {
      setRun(false);
      if (reset) {
        setTotal(0);
      };
    };

    socket.on(`studying:${user_id}`, onStudying);
    socket.on(`stopStudying:${user_id}`, onStopStudying);

    return () => {
      socket.off(`studying:${user_id}`, onStudying);
      socket.off(`stopStudying:${user_id}`, onStopStudying);
    };
  }, [userInfo]);

  useEffect(() => {
    const onMessage = (e) => {
      if (run && e.data.command === "update-timer") {
        setTotal((prev) => prev + 1);
      }
    };
    worker.addEventListener("message", onMessage);

    return () => {
      worker.removeEventListener("message", onMessage);
    };
  }, [run]);

  useEffect(() => {
    setTotal(initialSec);
  }, [initialSec]);

  useEffect(() => {
    setSec(total % 60);
    setMin(Math.floor(total / 60) % 60);
    setHr(Math.floor(total / (60 * 60)));
  }, [total]);

  return (
    <div className={styles.MemberTimer}>
      <p className={styles.hour}>{hr}</p>:
      <p className={styles.minute}>{min.toString().padStart(2, "0")}</p>:
      <p className={styles.second}>{sec.toString().padStart(2, "0")}</p>
    </div>
  );
}

export default MemberTimer;