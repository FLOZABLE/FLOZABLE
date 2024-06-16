import React, { useCallback, useEffect, useState } from "react";
import styles from "./PomodoroTimer.module.css";
import SimpleToggleBtn from "../../Buttons/SimpleToggleBtn/SimpleToggleBtn";
import { CountdownCircleTimer } from 'react-countdown-circle-timer'

function PomodoroTimer() {

  const [pomo, setPomo] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [timerDuration, setTimerDuration] = useState(25);
  const [timerKey, setTimerKey] = useState(0);
  const [descEl, setDescEl] = useState("Focus");
  const [color, setColor] = useState("blue")

  const switchTimer = useCallback(() => {
    setIsBreak(!isBreak);
  }, [isBreak]);

  useEffect(() => {
    if (isBreak) {
      setTimerKey(timerKey + 1);
      setTimerDuration(5);
      setDescEl("Break");
      setColor("#1c95ff");
    }
    else {
      setTimerKey(timerKey + 1);
      setTimerDuration(25);
      setDescEl("Focus");
      setColor("red");
    }
  }, [isBreak])

  return (
    <div className={styles.PomodoroTimer}>
      <div className={styles.PomodoroSwitch}>
        <SimpleToggleBtn
          onToggle={() => { setPomo(!pomo) }}
          checked={false}
          className={styles.toggleBtn}
        />
        <div className={styles.pomodoroDescription}>
          Pomodoro
        </div>
      </div>
      {pomo &&
        <CountdownCircleTimer
          key={timerKey}
          isPlaying
          duration={timerDuration}
          colors={[color]}
          colorsTime={[0]}
          onComplete={() => {
            switchTimer();
            return { shouldRepeat: true }
          }}
        >
          {({ remainingTime }) => {
            const minutes = Math.floor((remainingTime % 3600) / 60)
            const seconds = remainingTime % 60
            return <div className="time-wrapper">
              <div className="time">{`${minutes.toString().padStart(2, 0)}:${seconds.toString().padStart(2, 0)}`}</div>
              <div>{descEl}</div>
            </div>
          }}
        </CountdownCircleTimer>
      }
    </div>
  )
}

export default PomodoroTimer;