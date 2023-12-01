import React, { useEffect, useState, useRef } from "react";
import styles from "./MyTimer.module.css";
import worker from "../../../utils/subjectTimerWorker";

function MyTimer({ run, total }) {
  const [sec, setSec] = useState(0);
  const [min, setMin] = useState(0);
  const [hr, setHr] = useState(0);

  worker.addEventListener("message", (e) => {
    if (run && e.data.command === "updateSubjectTimer") {
      setSec(sec + 1);
    }
  });

  useEffect(() => {
    console.log('gdt', total)
    if (total) {
      setSec(total % 60);
      setMin(Math.floor(total / 60) % 60);
      setHr(Math.floor(total / (60 * 60)));
    }
  }, [total]);

  return (
    <div className={styles.MyTimer}>
      <p className={styles.hour}>{hr}</p>:
      <p className={styles.minute}>{min.toString().padStart(2, "0")}</p>:
      <p className={styles.second}>{sec.toString().padStart(2, "0")}</p>
    </div>
  );
}

export default MyTimer;