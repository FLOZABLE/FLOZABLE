import React, { useEffect, useState } from "react";
import styles from "./MyTimer.module.css";
import dynamic from "next/dynamic";
//import worker from "./TimeWorker";
const WorkerInstance = dynamic(
  () => import('./TimeWorker'),
  { ssr: false }
);



function MyTimer({ run, initialSec }) {
  const [sec, setSec] = useState(0);
  const [min, setMin] = useState(0);
  const [hr, setHr] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const onMessage = (e) => {
      if (run && e.data.command === "updateSubjectTimer") {
        setTotal(prev => prev + 1);
      };
    };
    /* console.log('gdddd', worker)
    worker.addEventListener("message", onMessage);

    return () => {
      worker.removeEventListener("message", onMessage);
    }; */
    const worker = WorkerInstance();
    if (worker) {
      worker.addEventListener('message', onMessage);
      return () => {
        worker.removeEventListener('message', onMessage);
      };
    }
  }, [run]);

  useEffect(() => {
    if (initialSec) {
      setTotal(initialSec);
    }
  }, [initialSec]);

  useEffect(() => {
    setSec(total % 60);
    setMin(Math.floor(total / 60) % 60);
    setHr(Math.floor(total / (60 * 60)));
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