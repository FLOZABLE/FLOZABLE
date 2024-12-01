import React, { useEffect, useState } from "react";
import styles from "./PomodoroTimer.module.css";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import SlidingOptBtn from "../../Buttons/SlidingOptBtn/SlidingOptBtn";
import { toTimer } from "@/app/utils/Tool";

const STUDY_DURATION = 60 * 25; //25min
const SHORT_BREAK_DURATION = 60 * 5; //5min
const LONG_BREAK_DURATION = 60 * 15; // 15min

function PomodoroTimer({
  pomodoro,
  setPomodoro,
  selectedSubject,
  toggleTimer,
}) {
  const [duration, setDuration] = useState(STUDY_DURATION);

  useEffect(() => {
    if (pomodoro.mode === 0) {
      setDuration(STUDY_DURATION);
    } else if (pomodoro.mode === 1) {
      setDuration(SHORT_BREAK_DURATION);

      if (selectedSubject.active) {
        toggleTimer();
      }
    } else {
      setDuration(LONG_BREAK_DURATION);

      if (selectedSubject.active) {
        toggleTimer();
      }
    }
  }, [pomodoro, selectedSubject]);

  useEffect(() => {
    if (pomodoro.mode === 0) {
      setPomodoro((prev) => ({ ...prev, running: selectedSubject.active }));
    }
  }, [selectedSubject]);

  if (!pomodoro.active) {
    return null;
  }

  return (
    <div className={styles.PomodoroTimer}>
      <div className={styles.options}>
        <SlidingOptBtn
          options={[
            {
              name: `Study`,
              value: 0,
            },
            {
              name: `Short Break`,
              value: 1,
            },
            {
              name: `Long Break`,
              value: 2,
            },
          ]}
          value={pomodoro.mode}
          setValue={(mode) => {
            setPomodoro((prev) => ({ ...prev, running: false, mode }));
          }}
          isCheck={false}
        />
      </div>
      <div className={styles.timer}>
        <CountdownCircleTimer
          isPlaying={pomodoro.running}
          duration={duration}
          key={pomodoro.mode}
          colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
          colorsTime={[7, 5, 2, 0]}
          size={300}
          strokeWidth={15}
          onUpdate={(sec) => {
            const timer = toTimer(sec);
            if (!pomodoro.running) return;

            if (pomodoro.mode === 0) {
              let slicedName = selectedSubject.name.slice(0, 7);

              if (slicedName.length !== selectedSubject.name.length) {
                slicedName += "...";
              }

              document.title = `${timer} ${slicedName}`;
            } else {
              document.title = `${timer} break`;
            }
          }}
          onComplete={() => {
            if (pomodoro.mode === 0) {
              if (selectedSubject.active) {
                toggleTimer();
              }
              setPomodoro((prev) => ({ ...prev, running: false, mode: 1 }));
            } else {
              setPomodoro((prev) => ({ ...prev, running: false, mode: 0 }));
            }
          }}
        >
          {({ remainingTime }) => {
            const minutes = Math.floor((remainingTime % 3600) / 60)
              .toString()
              .padStart(2, "0");
            const seconds = (remainingTime % 60).toString().padStart(2, "0");

            return `${minutes}:${seconds}`;
          }}
        </CountdownCircleTimer>
      </div>
    </div>
  );
}

export default PomodoroTimer;
