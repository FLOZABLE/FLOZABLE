import React, { useContext, useState, useEffect, use } from 'react';
import styles from "./SubjectTimer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { ModalsContext, SubjectsContext, WorkersContext } from "@/app/utils/Contexts";
import { socket } from "@/app/utils/socket";

function SubjecTimer({
  selectedSubject,
  setSelectedSubject
}) {
  const { subjects } = useContext(SubjectsContext);
  const { setIsAddSubjectModal } = useContext(ModalsContext);
  const { subjectsTimerWorkerRef } = useContext(WorkersContext);

  const [timerActive, setTimerActive] = useState(false);
  const [subjectTimer, setSubjectTimer] = useState({ total: 0 });
  const [timerValues, setTimerValues] = useState({});
  const [clicked, setClicked] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState([]);

  useEffect(() => {
    if (!subjects.length) return;
    setSubjectOptions([...subjects]);
    setSelectedSubject(subjects[0]);
    setSubjectTimer({ total: subjects[0].daily.total[subjects[0].daily.total.length - 1] });
    const timerValueObj = {};
    subjects.map((subject) => {
      timerValueObj[subject.id] = subject.daily.total[subject.daily.total.length - 1];
    })
    setTimerValues(timerValueObj);
  }, [subjects]);

  const toggleTimer = (subject) => {
    if (!subject) return;
    if (!timerActive) {
      subjectsTimerWorkerRef?.current?.postMessage({ command: "startSubjectTimer" });
      socket.emit("start", subject.id);
    } else {
      subjectsTimerWorkerRef?.current?.postMessage({ command: "stopSubjectTimer" });
      socket.emit("stop", subject.id);
    }
    setTimerActive(!timerActive);
  };


  useEffect(() => {
    const messageHandler = (e) => {
      if (e.data.command === "updateSubjectTimer") {
        setSubjectTimer((prevTimer) => ({ total: prevTimer.total + 1 }));
        const subjectId = selectedSubject.id;
        const tempVal = { ...timerValues };
        tempVal[subjectId] += 1;
        setTimerValues(tempVal);
      }
    };
    subjectsTimerWorkerRef?.current?.addEventListener("message", messageHandler);
    return () => {
      subjectsTimerWorkerRef?.current?.removeEventListener("message", messageHandler);
    };
  }, [selectedSubject, subjectsTimerWorkerRef, timerValues]);

  return (
    <div className={styles.SubjectTimer}>
      <div className={styles.timerWrapper}>
        <button
          className={`${clicked ? styles.clicked : ""} ${styles.optBtn}`}
          onClick={() => { setClicked(!clicked); }}
        >
          <p>{selectedSubject.name ? selectedSubject.name : "Others"}</p>
          <p className={styles.mainTimeDisp}>
            {Math.floor(subjectTimer.total / 3600)}:
            {(Math.floor(subjectTimer.total / 60) % 60)
              .toString()
              .padStart(2, "0")}
            :{(subjectTimer.total % 60).toString().padStart(2, "0")}
          </p>
          <i>
            <FontAwesomeIcon icon={faCaretDown} />
          </i>
        </button>
        <ul className={`${styles.options} customScroll`}>
          {
            subjectOptions.map((option, i) => {
              const timeValue = timerValues[option.id];
              return (
                <li
                  key={i}
                  onClick={(e) => {
                    setSubjectTimer({ total: timeValue });
                    setClicked(false);
                    if (timerActive) {
                      toggleTimer(option);
                    };
                    setSelectedSubject(option)
                  }}
                  className={styles.option}
                  id="tutorial-7"
                >
                  {option.name}{" "}
                  <p className={styles.timeDisp}>
                    {" "}
                    {Math.floor(timeValue / 3600)}:
                    {(Math.floor(timeValue / 60) % 60)
                      .toString()
                      .padStart(2, "0")}
                    :{(timeValue % 60).toString().padStart(2, "0")}
                  </p>
                </li>
              );
            })
          }
          <li
            onClick={() => {
              setClicked(false);
              setIsAddSubjectModal(true);
            }}
            className={styles.option}
          >
            Or Add Subject
          </li>,
        </ul>
      </div>
      <div className={styles.buttonWrapper}>
        <button onClick={() => { toggleTimer(selectedSubject) }} className={styles.toggleBtn}>
          {timerActive ? (
            <FontAwesomeIcon icon={faPause} />
          ) : (
            <FontAwesomeIcon icon={faPlay} />
          )}
        </button>
      </div>
    </div>
  )

}

export default SubjecTimer