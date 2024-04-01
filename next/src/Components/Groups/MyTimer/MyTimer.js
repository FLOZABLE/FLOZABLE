import React, { useEffect, useState } from "react";
import styles from "./MyTimer.module.css";

function MyTimer({ run, initialSec }) {
  const [sec, setSec] = useState(0);
  const [min, setMin] = useState(0);
  const [hr, setHr] = useState(0);
  const [total, setTotal] = useState(0);

  const workerRef = useRef();

  useEffect(() => {
    workerRef.current = new Worker(new URL('./TimeWorker.js', import.meta.url))
    return () => {
      workerRef.current?.terminate()
    };
}, [])

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
    workerRef.current.addEventListener('message', onMessage);
    return () => {
      workerRef.current.removeEventListener('message', onMessage);
    };
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