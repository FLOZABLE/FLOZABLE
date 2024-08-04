import React, { useContext, useState, useEffect, useCallback } from "react";
import styles from "./SubjectTimer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { SubjectsContext, WorkersContext } from "@/app/utils/Contexts";
import { socket } from "@/app/utils/socket";

function SubjecTimer({ selectedSubject, setSelectedSubject }) {
  const { subjects } = useContext(SubjectsContext);
  const { subjectsTimerWorkerRef } = useContext(WorkersContext);

  const [subjectOptions, setSubjectOptions] = useState([]);
  const [selectNewSubject, setSelectNewSubject] = useState(false);

  useEffect(() => {
    if (!subjects || !subjects.length) return;
    const subjectOptions = subjects.map((subject) => {
      const value = subject.daily.total[subject.daily.total.length - 1].data;
      const { subject_id, name } = subject;
      return { subject_id, name, value, active: false };
    });

    setSelectedSubject(subjectOptions[0]);
    setSubjectOptions(subjectOptions);
  }, [subjects]);

  const toggleTimer = useCallback((selectedSubject) => {
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

      subjectsTimerWorkerRef?.current?.postMessage({
        command: "stopSubjectTimer",
      });
    }

    return () => {
      subjectsTimerWorkerRef?.current?.postMessage({
        command: "stopSubjectTimer",
      });
    };
  }, []);

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
      <div className={styles.mainDisplay}>
        {selectedSubject ? (
          <div
            className={styles.subject}
            onClick={() => setSelectNewSubject(!selectNewSubject)}
          >
            <p className={styles.name}>{selectedSubject.name}</p>
            <p className={styles.time}>
              {Math.floor(selectedSubject.value / (60 * 60))}:
              {Math.floor((selectedSubject.value / 60) % 60)
                .toString()
                .padStart(2, "0")}
              :
              {Math.floor(selectedSubject.value % (60 * 60))
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
              toggleTimer(selectedSubject);
            }}
          >
            {selectedSubject?.active ? (
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
              onClick={() => {
                setSelectNewSubject(false);
                setSelectedSubject(subject);
              }}
            >
              <p className={styles.name}>{subject.name}</p>
              <p className={styles.time}>
                {Math.floor(subject.value / (60 * 60))}:
                {Math.floor((subject.value / 60) % 60)
                  .toString()
                  .padStart(2, "0")}
                :
                {Math.floor(subject.value % (60 * 60))
                  .toString()
                  .padStart(2, "0")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SubjecTimer;
