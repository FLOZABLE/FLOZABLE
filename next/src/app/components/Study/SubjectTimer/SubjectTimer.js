import React, { useContext, useState, useEffect, useRef } from 'react';
import styles from "./SubjectTimer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { ModalsContext, SubjectsContext, TutorialsContext, WorkersContext } from "@/app/utils/Contexts";
import { socket } from "@/app/utils/socket";

function SubjecTimer({
  selectedSubject,
  setSelectedSubject
}) {
  const { subjects, setSubjects } = useContext(SubjectsContext);
  const { setIsAddSubjectModal } = useContext(ModalsContext);
  const { subjectsTimerWorkerRef } = useContext(WorkersContext);
  const { tutorialBoxRef, tutorialTextRef, tutorial, setTutorial } = useContext(TutorialsContext);

  const [timerActive, setTimerActive] = useState(false);
  const [subjectTimer, setSubjectTimer] = useState({ total: 0 });
  const [timerValues, setTimerValues] = useState({});
  const [clicked, setClicked] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState([]);

  const chooseSubjectRef = useRef(null);
  const subjectOptionsRef = useRef(null);
  const startSubjectRef = useRef(null);

  useEffect(() => {
    return () => {
      subjectsTimerWorkerRef?.current?.postMessage({ command: "stopSubjectTimer" });
    };
  }, []);

  useEffect(() => {
    if (tutorial === 7) {
      setTimeout(() => {
        const { width, top, left } = chooseSubjectRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left + 'px';
        tutorialBoxRef.current.style.top = top + 'px';
        tutorialBoxRef.current.style.width = width + 'px';

        tutorialTextRef.current.style.top = top + 'px';
        tutorialTextRef.current.style.left = left + width + 50 + 'px';
        tutorialTextRef.current.innerText = "Select a subject to study";
      }, 500);
    } else if (tutorial === 8) {
      setClicked(true);

      setTimeout(() => {
        const { width, top, left, height, } = subjectOptionsRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left + 'px';
        tutorialBoxRef.current.style.top = top + 'px';
        tutorialBoxRef.current.style.width = width + 'px';
        tutorialBoxRef.current.style.height = height + 'px';

        tutorialTextRef.current.style.top = top + 'px';
        tutorialTextRef.current.style.left = left + width + 50 + 'px';
        tutorialTextRef.current.innerText = "You will see your subjects here";
      }, 500);
    } else if (tutorial === 9) {

      setTimeout(() => {
        const { width, top, left, height } = startSubjectRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left + 'px';
        tutorialBoxRef.current.style.top = top + 'px';
        tutorialBoxRef.current.style.width = width + 'px';
        tutorialBoxRef.current.style.height = height + 'px';

        tutorialTextRef.current.style.top = top + 'px';
        tutorialTextRef.current.style.left = left + width + 50 + 'px';
        tutorialTextRef.current.innerText = "Click to start/stop the timer!";
      }, 500);

      setTimeout(() => {
        setTutorial(10);
      }, 5000);
    }
  }, [tutorial]);

  useEffect(() => {
    if (!subjects.length) return;
    setSubjectOptions([...subjects]);
    if (selectedSubject.default) { //is the default object, not previously selected subject
      setSelectedSubject(subjects[0]);
      setSubjectTimer({ total: subjects[0].daily.total[subjects[0].daily.total.length - 1] });
    }
    const timerValueObj = {};
    subjects.map((subject) => {
      timerValueObj[subject.id] = subject.daily.total[subject.daily.total.length - 1];
    })
    setTimerValues(timerValueObj);
  }, [subjects]);

  const toggleTimer = (subject) => {
    if (!subject) return;
    console.log(subjectsTimerWorkerRef?.current);
    if (!!subjectsTimerWorkerRef?.current) {
      subjectsTimerWorkerRef.current["subjectId"] = subject.id;
    }
    if (!timerActive) {
      subjectsTimerWorkerRef?.current?.postMessage({ command: "startSubjectTimer" });
      socket.emit("start", subject.id);
    } else {
      subjectsTimerWorkerRef?.current?.postMessage({ command: "stopSubjectTimer" });
      socket.emit("stop", subject.id);
      setSubjects((prev) => {
        const newState = subjects.map((currentSubject) => {
          if (currentSubject.id === subject.id) {
            return {
              ...currentSubject,
              daily: {
                ...currentSubject.daily,
                total: [...currentSubject.daily.total.slice(0, currentSubject.daily.total.length - 1), timerValues[currentSubject.id]]
              }
            }
          }
          return {
            ...currentSubject
          }
        });
        newState.daily = prev.daily;
        newState.weekly = prev.weekly;
        newState.monthly = prev.monthly;

        return newState;
      })
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
      <div className={styles.timerWrapper}
        ref={chooseSubjectRef}
      >
        <button
          id="tutorial-7"
          className={`${clicked ? styles.clicked : ""} ${styles.optBtn}`}
          onClick={() => {
            setClicked(!clicked);
            if (tutorial === 7) {
              setTutorial(8);
            }
          }}
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
        <ul className={`${styles.options} customScroll`} ref={subjectOptionsRef}>
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
                    setSelectedSubject(option);
                    if (tutorial === 8) {
                      setTutorial(9);
                    };
                  }}
                  className={styles.option}
                  id="tutorial-8"
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
        <button onClick={() => { toggleTimer(selectedSubject) }} className={styles.toggleBtn} ref={startSubjectRef} id="tutorial-9">
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