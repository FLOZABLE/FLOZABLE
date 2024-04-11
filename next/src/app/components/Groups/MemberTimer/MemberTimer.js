import React, { useContext, useEffect, useState } from "react";
import styles from "./MemberTimer.module.css";
import { WorkersContext } from "@/app/utils/Contexts";

function MemberTimer({ initialSec = 0, run }) {
  const { membersTimerWorkerRef } = useContext(WorkersContext);

  const [sec, setSec] = useState(0);
  const [min, setMin] = useState(0);
  const [hr, setHr] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const onMessage = (e) => {
      if (run && e.data.command === "update-timer") {
        setTotal((prev) => prev + 1);
      }
    };
    membersTimerWorkerRef.current.addEventListener("message", onMessage);

    return () => {
      membersTimerWorkerRef.current.removeEventListener("message", onMessage);
    };
  }, [run]);

  useEffect(() => {
    setTotal(Math.floor(initialSec));
    console.log('initial sec', initialSec)
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