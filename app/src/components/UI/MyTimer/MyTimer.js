import React, { useEffect, useState, useRef } from "react";
import styles from "./MyTimer.module.css";
import worker from "./TimeWorker";

function MyTimer(props) {
  const { total, myTimerTotal } = props;
  const [sec, setSec] = useState(0);
  const [min, setMin] = useState(0);
  const [hr, setHr] = useState(0);

  useEffect(() => {
    setSec(total % 60);
    setMin(Math.floor(total / 60) % 60);
    setHr(Math.floor(total / (60 * 60)));
  }, []);

  useEffect(() => {
    if (myTimerTotal) {
      setSec(myTimerTotal % 60);
      setMin(Math.floor(myTimerTotal / 60) % 60);
      setHr(Math.floor(myTimerTotal / (60 * 60)));
    };
  }, [myTimerTotal]);

  return (
    <div className={styles.MyTimer}>
      <p className={styles.hour}>{hr}</p>
      :
      <p className={styles.minute}>{min.toString().padStart(2, '0')}</p>
      :
      <p className={styles.second}>{sec.toString().padStart(2, '0')}</p>
    </div>
  );
};

export default MyTimer;