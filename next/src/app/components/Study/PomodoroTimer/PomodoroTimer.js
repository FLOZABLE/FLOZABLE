import React, { useEffect, useState } from "react";
import styles from "./PomodoroTimer.module.css";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import SlidingOptBtn from "../../Buttons/SlidingOptBtn/SlidingOptBtn";

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
    if (!pomodoro) return;

    if (pomodoro.mode === 0) {
      setDuration(STUDY_DURATION);
    } else if (pomodoro.mode === 1) {
      setDuration(SHORT_BREAK_DURATION);
    } else {
      setDuration(LONG_BREAK_DURATION);
    }
  }, [selectedSubject, pomodoro]);

  useEffect(() => {
    if (!selectedSubject || !pomodoro) return;

    if (pomodoro.mode === 0) {
      setPomodoro((prev) => ({ ...prev, active: selectedSubject.active }));
    }
  }, [selectedSubject]);

  if (pomodoro?.mode === -1) {
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
          value={pomodoro?.mode}
          setValue={(mode) => {
            setPomodoro({ active: false, mode });
            if (mode !== 0 && selectedSubject.active) {
              toggleTimer();
            }
          }}
        />
      </div>
      <div className={styles.timer}>
        <CountdownCircleTimer
          isPlaying={pomodoro?.active}
          duration={duration}
          key={pomodoro?.mode}
          colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
          colorsTime={[7, 5, 2, 0]}
          size={300}
          strokeWidth={15}
          onComplete={() => {
            if (pomodoro.mode === 0) {
              toggleTimer();
              setPomodoro({ active: false, mode: 1 });
            } else {
              setPomodoro({ active: false, mode: 0 });
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
