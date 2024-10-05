import React, { useContext, useState, useEffect, useCallback } from "react";
import styles from "./SubjectTimer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import {
  ModalsContext,
  SubjectsContext,
  TutorialsContext,
  WorkersContext,
} from "@/app/utils/Contexts";
import { socket } from "@/app/utils/socket";
import SimpleToggleBtn from "../../Buttons/SimpleToggleBtn/SimpleToggleBtn";
import PomodoroTimer from "../PomodoroTimer/PomodoroTimer";

function SubjecTimer({
  selectedSubject,
  setSelectedSubject,
  selectSubjectRef,
  switchPomodoroRef,
  startTimerRef,
}) {
  const { tutorialBoxRef, tutorialTextRef, tutorial, setTutorial } =
    useContext(TutorialsContext);
  const { subjects, setSubjects } = useContext(SubjectsContext);
  const { subjectsTimerWorkerRef } = useContext(WorkersContext);
  const { setIsAddSubjectModal } = useContext(ModalsContext);

  const [subjectOptions, setSubjectOptions] = useState([]);
  const [selectNewSubject, setSelectNewSubject] = useState(false);
  const [pomodoro, setPomodoro] = useState({
    mode: -1,
    active: false,
  });

  useEffect(() => {
    if (!subjects || !subjects.length) return;
    const subjectOptions = subjects.map((subject) => {
      const value = subject.day.total[subject.day.total.length - 1].data;
      const { subject_id, name } = subject;
      return { subject_id, name, value, active: false };
    });

    setSelectedSubject(subjectOptions[0]);
    setSubjectOptions(subjectOptions);
  }, [subjects]);

  const toggleTimer = useCallback(() => {
    if (pomodoro.mode === 1 || pomodoro.mode === 2) {
      setPomodoro((prev) => ({ ...prev, active: !prev.active }));
      return;
    }

    if (!selectedSubject) return;

    const active = !selectedSubject.active;
    setSelectedSubject({
      ...selectedSubject,
      active,
    });

    if (active) {
      socket.emit("start", selectedSubject.subject_id);
      subjectsTimerWorkerRef?.current?.postMessage({
        command: "startSubjectTimer",
      });
    } else {
      socket.emit("stop", selectedSubject.subject_id);
      const selectedSubjectIndex = subjects.findIndex(
        (subject) => subject.subject_id === selectedSubject.subject_id
      );

      subjectsTimerWorkerRef?.current?.postMessage({
        command: "stopSubjectTimer",
      });

      if (!selectedSubjectIndex !== -1) {
        const day = subjects[selectedSubjectIndex].day;
        day.total[day.total.length - 1].data = selectedSubject.value;
        subjects[selectedSubjectIndex] = {
          ...subjects[selectedSubjectIndex],
          day,
        };
        setSubjects(subjects);
      }
    }

    return () => {
      subjectsTimerWorkerRef?.current?.postMessage({
        command: "stopSubjectTimer",
      });
    };
  }, [subjects, pomodoro, selectedSubject]);

  useEffect(() => {
    const messageHandler = (e) => {
      if (e.data.command === "updateSubjectTimer") {
        if (!selectedSubject) return;
        setSelectedSubject({
          ...selectedSubject,
          value: selectedSubject.value + 1,
        });
        const subjectIndex = subjectOptions.findIndex(
          (subject) => subject.subject_id === selectedSubject.subject_id
        );
        if (subjectIndex === -1) return;

        subjectOptions[subjectIndex].value += 1;

        setSubjectOptions(subjectOptions);
      }
    };
    subjectsTimerWorkerRef?.current?.addEventListener(
      "message",
      messageHandler
    );
    return () => {
      subjectsTimerWorkerRef?.current?.removeEventListener(
        "message",
        messageHandler
      );
    };
  }, [selectedSubject, subjectsTimerWorkerRef, subjectOptions]);

  return (
    <div className={styles.SubjectTimer}>
      <div className={styles.header}>
        <div
          className={`${styles.pomodoroToggle} ${
            pomodoro.mode !== -1 ? styles.active : null
          }`}
          ref={switchPomodoroRef}
        >
          <SimpleToggleBtn
            checked={pomodoro.mode !== -1}
            onToggle={(e) => {
              if (e.target.checked) {
                setPomodoro({ mode: 0, active: selectedSubject.active });
              } else {
                setPomodoro({ mode: -1, active: false });
              }
            }}
            tutorial={8}
          />
          <p>Pomodoro</p>
        </div>
        <div
          className={styles.button}
          id={styles.addSubject}
          onClick={() => setIsAddSubjectModal((prev) => !prev)}
        >
          +<p className={`HoverText ${styles.hoverText}`}>Add Subject</p>
        </div>
      </div>
      <div className={styles.mainDisplay} ref={selectSubjectRef}>
        {selectedSubject ? (
          <div
            className={`${styles.subject} ${
              selectNewSubject ? styles.active : null
            }`}
            data-tutorial={6}
            onClick={() => setSelectNewSubject(!selectNewSubject)}
          >
            <p className={styles.name}>{selectedSubject.name}</p>
            <p className={styles.time}>
              {Math.floor(selectedSubject.value / (60 * 60))}:
              {Math.floor((selectedSubject.value / 60) % 60)
                .toString()
                .padStart(2, "0")}
              :
              {Math.floor(selectedSubject.value % 60)
                .toString()
                .padStart(2, "0")}
            </p>
            <i
              id={styles.caret}
              className={`${selectNewSubject ? styles.active : null}`}
            >
              <FontAwesomeIcon icon={faCaretDown} />
            </i>
          </div>
        ) : null}
        <div className={styles.buttons}>
          <div
            className={styles.button}
            id={styles.start}
            onClick={() => {
              toggleTimer();
              if (tutorial === 7) {
                setTimeout(() => {
                  setTutorial(8);
                }, 3000);
              }
            }}
            ref={startTimerRef}
            data-tutorial={7}
          >
            {selectedSubject?.active || pomodoro.active ? (
              <FontAwesomeIcon icon={faPause} />
            ) : (
              <FontAwesomeIcon icon={faPlay} />
            )}
          </div>
        </div>
      </div>
      <div
        className={`customScroll ${selectNewSubject ? styles.active : null} ${
          styles.subjects
        }`}
      >
        {subjectOptions.map((subject, i) => {
          return (
            <div
              className={styles.subject}
              key={i}
              data-tutorial={6}
              onClick={() => {
                setSelectNewSubject(false);
                if (selectedSubject?.active) {
                  toggleTimer();
                  setTimeout(() => {
                    setSelectedSubject(subject);
                  }, 300);
                } else {
                  setSelectedSubject(subject);
                }
                if (tutorial === 6) {
                  setTutorial(7);
                }
              }}
            >
              <p className={styles.name}>{subject.name}</p>
              <p className={styles.time}>
                {Math.floor(subject.value / (60 * 60))}:
                {Math.floor((subject.value / 60) % 60)
                  .toString()
                  .padStart(2, "0")}
                :
                {Math.floor(subject.value % 60)
                  .toString()
                  .padStart(2, "0")}
              </p>
            </div>
          );
        })}
      </div>
      <div className={styles.pomodoroTimer}>
        <PomodoroTimer
          pomodoro={pomodoro}
          setPomodoro={setPomodoro}
          selectedSubject={selectedSubject}
          toggleTimer={toggleTimer}
        />
      </div>
    </div>
  );
}

export default SubjecTimer;
