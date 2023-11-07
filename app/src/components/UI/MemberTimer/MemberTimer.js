import React, { useEffect, useState, useRef } from "react";
import styles from "./MemberTimer.module.css";
import worker from "./TimeWorker";

function MemberTimer({ run, total, me }) {
  const [sec, setSec] = useState(0);
  const [min, setMin] = useState(0);
  const [hr, setHr] = useState(0);

  useEffect(() => {
    setSec(total % 60);
    setMin(Math.floor(total / 60) % 60);
    setHr(Math.floor(total / (60 * 60)));
  }, []);


  useEffect(() => {
    const onMessage = (e) => {
      if (run && e.data.command === 'update-timer') {
        setSec(prevSec => prevSec + 1);
      };
    };
    worker.addEventListener('message', onMessage);

    return () => {
      worker.removeEventListener('message', onMessage);
    }
  }, [run]);

  useEffect(() => {
    if (total) {
      setSec(total % 60);
      setMin(Math.floor(total / 60) % 60);
      setHr(Math.floor(total / (60 * 60)));
    };
  }, [total]);

  useEffect(() => {
    if (sec == 60) {
      setSec(0);
      setMin(min + 1);
    };
  }, [sec]);

  useEffect(() => {
    if ( min == 60) {
      setMin(0);
      setHr(hr + 1);
    };
  }, [min]);

  return (
    <div className={styles.MemberTimer}>
      <p className={styles.hour}>{hr}</p>
      :
      <p className={styles.minute}>{min.toString().padStart(2, '0')}</p>
      :
      <p className={styles.second}>{sec.toString().padStart(2, '0')}</p>
    </div>
  );
};

export default MemberTimer;