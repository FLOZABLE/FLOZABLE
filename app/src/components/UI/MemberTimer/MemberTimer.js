import React, { useEffect, useState, useRef } from "react";
import styles from "./MemberTimer.module.css";
import worker from "./TimeWorker";

function MemberTimer(props) {
  const { run, total, me, myTimerTotal } = props;
  const [sec, setSec] = useState(0);
  const [min, setMin] = useState(0);
  const [hr, setHr] = useState(0);

  useEffect(() => {
    console.log('total', total)
    setSec(total % 60);
    setMin(Math.floor(total / 60) % 60);
    setHr(Math.floor(total / (60 * 60)));
  }, []);

  useEffect(() => {
    if (!me) {
      worker.addEventListener('message', (e) => {
        if (e.data.command === 'update-timer') {
          if (run) {
            setSec(sec + 1);
          };
        };
      });
    };
  }, []);

  useEffect(() => {
    if (me) {
      if (myTimerTotal) {
        setSec(myTimerTotal % 60);
        setMin(Math.floor(myTimerTotal / 60) % 60);
        setHr(Math.floor(myTimerTotal / (60 * 60)));
      };
    }
  }, [myTimerTotal]);

  useEffect(() => {
    if (!me && sec == 60) {
      setSec(0);
      setMin(min + 1);
    };
  }, [sec]);

  useEffect(() => {
    if (!me && min == 60) {
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