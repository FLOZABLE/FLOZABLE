import React, { useContext, useEffect, useState } from "react";
import styles from "./MemberTimer.module.css";
import { WorkersContext } from "@/app/utils/Contexts";
import { toTimer } from "@/app/utils/Tool";
import { DateTime } from "luxon";

function MemberTimer({ initialSec = 0, run }) {
  const { membersTimerWorkerRef } = useContext(WorkersContext);

  const [timer, setTimer] = useState({
    value: 0,
    disp: "",
  });

  useEffect(() => {
    const disp = toTimer(initialSec);
    setTimer({ value: initialSec, disp });

    const onMessage = (e) => {
      if (run && e.data.command === "update-timer") {
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

    membersTimerWorkerRef?.current?.addEventListener("message", onMessage);
    return () => {
      membersTimerWorkerRef?.current?.removeEventListener("message", onMessage);
    };
  }, [run, membersTimerWorkerRef, initialSec]);

  useEffect(() => {
    const disp = toTimer(initialSec);
    setTimer({ value: initialSec, disp });

    if (!membersTimerWorkerRef?.current) return;

    const onMessage = () => {
      if (!run || e.data.command !== "update-timer") return;

      const now = DateTime.now().toSeconds().toFixed();
      /* setTimer((prev) => {
        const value = prev.value + 1;
        //incase when event listener trigger first before initialization, it initialize it.
        if (value < initialSec) {
          const disp = toTimer(initialSec);
          return { value: initialSec, disp };
        }
        const disp = toTimer(value);
        return { value, disp };
      }); */
      setTimer(initialSec + now - run);
    };

    if (run) {
      membersTimerWorkerRef.current.addEventListener("message", onMessage);
    }

    return () => {
      membersTimerWorkerRef.current.removeEventListener("message", onMessage);
    };
  }, [run, initialSec, membersTimerWorkerRef]);

  return (
    <div className={styles.MemberTimer}>
      <p className={styles.hour}>{timer.disp}</p>
    </div>
  );
}

export default MemberTimer;
