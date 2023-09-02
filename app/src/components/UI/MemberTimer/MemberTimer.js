import React, {useEffect, useState, useRef} from "react";
import styles from "./MemberTimer.module.css";
import worker from "./TimeWorker";

function MemberTimer(props) {
  const [run, setRun] = useState(props.run);
  const [sec, setSec] = useState(props.sec % 60);
  const [min, setMin] = useState(Math.floor(props.sec / 60) % 60);
  const [hr, setHr] = useState(Math.floor(props.sec / (60 * 60)));

  worker.addEventListener('message', (e) => {
    if (e.data.command === 'update-timer') {
      if (props.run) {
        setSec(sec + 1);
      };
    };
  });

  useEffect(() => {
    if (sec == 60) {
      setSec(0);
      setMin(min + 1);
    };
  }, [sec]);

  useEffect(() => {
    if (min == 60) {
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