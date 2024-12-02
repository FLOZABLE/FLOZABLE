import React, { useEffect, useState, useContext } from "react";
import styles from "./MyTimer.module.css";
import { WorkersContext } from "@/app/utils/Contexts";
import { toTimer } from "@/app/utils/Tool";

function MyTimer({ run, initialSec = 0 }) {
  const { subjectsTimerWorkerRef } = useContext(WorkersContext);

  const [timer, setTimer] = useState({
    value: 0,
    disp: "",
  });

  useEffect(() => {
    const disp = toTimer(initialSec);
    setTimer({ value: initialSec, disp });

    const onMessage = (e) => {
      if (run && e.data.command === "updateSubjectTimer") {
        setTimer((prev) => {
          const value = prev.value + 1;
          //incase when event listener trigger first before initialization, it initialize it.
          if (value < initialSec) {
            const disp = toTimer(initialSec);
            return { value: initialSec, disp };
          }
          const disp = toTimer(value);
          return { value, disp };
        });
      }
    };

    subjectsTimerWorkerRef?.current?.addEventListener("message", onMessage);
    return () => {
      subjectsTimerWorkerRef?.current?.removeEventListener(
        "message",
        onMessage
      );
    };
  }, [run, subjectsTimerWorkerRef, initialSec]);

  return (
    <div className={styles.MyTimer}>
      <p className={styles.hour}>{timer.disp}</p>
    </div>
  );
}

export default MyTimer;
