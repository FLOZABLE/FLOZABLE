import React, { useState, useEffect, useRef } from "react";
import styles from "./SubjectTimer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import worker from "../../../utils/subjectTimerWorker";
import { socket } from "../../../socket";
import { useSearchParams } from "react-router-dom";

function SubjectTimer({
  subjects,
  isStudy,
  setIsStudy,
  setIsAddSubjectModal,
  setMyTimerTotal,
  reset,
  subject,
  setSubject,
  tutorialBoxRef,
  tutorialTextRef,
}) {
  const timerDispRef = useRef(null);

  const [timeValues, setTimeValues] = useState([]);
  const [options, setOptions] = useState([]);
  const [subjectTimer, setSubjectTimer] = useState({ total: 0 });
  const [clicked, setClicked] = useState(false);


  const [searchParams, setSearchParams] = useSearchParams();

  const chooseSubjectRef = useRef(null);
  const subjectOptionsRef = useRef(null);
  const startSubjectRef = useRef(null);

  useEffect(() => {
    if (!searchParams) return;

    const tutorial = searchParams.get("tutorial");
    if (!tutorial) return;

    if (parseInt(tutorial) === 6) {

      setTimeout(() => {
        const { width, top, left, height, bottom } = chooseSubjectRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left + 'px';
        tutorialBoxRef.current.style.top = top + 'px';
        tutorialBoxRef.current.style.width = width + 'px';

        tutorialTextRef.current.style.top = top + 'px';
        tutorialTextRef.current.style.left = left + width + 50 + 'px';
        tutorialTextRef.current.innerText = "Select a subject to study";
      }, 500);
    } else if (parseInt(tutorial) === 7) {
      setClicked(true);

      setTimeout(() => {
        const { width, top, left, height, bottom } = subjectOptionsRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left + 'px';
        tutorialBoxRef.current.style.top = top + 'px';
        tutorialBoxRef.current.style.width = width + 'px';
        tutorialBoxRef.current.style.height = height + 'px';

        tutorialTextRef.current.style.top = top + 'px';
        tutorialTextRef.current.style.left = left + width + 50 + 'px';
        tutorialTextRef.current.innerText = "You will see your subjects here";
      }, 500);
    } else if (parseInt(tutorial) === 8) {

      setTimeout(() => {
        const { width, top, left, height, bottom } = startSubjectRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left + 'px';
        tutorialBoxRef.current.style.top = top + 'px';
        tutorialBoxRef.current.style.width = width + 'px';
        tutorialBoxRef.current.style.height = height + 'px';

        tutorialTextRef.current.style.top = top + 'px';
        tutorialTextRef.current.style.left = left + width + 50 + 'px';
        tutorialTextRef.current.innerText = "Click to start/stop the timer!";
      }, 500);

      setTimeout(() => {
        setSearchParams({...searchParams, tutorial: 9});
      }, 3000);
    }
  }, [searchParams]);

  useEffect(() => {
    setTimeValues(
      subjects.map((subject, i) => {
        let total = subject.daily.total[subject.daily.total.length - 1];
        if (timeValues.length > i) {
          //If a new subejct is added, do not reset the timer
          total = Math.max(timeValues[i].total, total);
        }
        let id = subject.id;
        return { id, total };
      }),
    );
  }, [subjects]);

  useEffect(() => {
    if (timeValues.length) {
      if (!!!subject) setSubject({ ...subjects[0] });
      let subjectIndex = subject ? subject.id : -1; //default to -1 if undefined and check later
      if (subjectIndex !== -1) {
        for (let i = 0; i < subjects.length; i++) {
          if (subjects[i].id === subjectIndex) {
            subjectIndex = i;
          }
        }
        if (
          subjects[subjectIndex].daily &&
          subjects[subjectIndex].daily.total
        ) {
          const timeValue =
            subjects[subjectIndex].daily.total[
            subjects[subjectIndex].daily.total.length - 1
            ];
          setSubjectTimer({ total: timeValue });
        }
        setSubjectTimer({ total: timeValues[subjectIndex].total });
      } else {
        setSubjectTimer({ total: timeValues[0].total });
      }
    }
    const subjectOptions = subjects.map((option, i) => {
      const selectedOption = timeValues.find(
        (timeVal) => timeVal.id === option.id,
      );
      const timeValue = selectedOption ? selectedOption.total : 0;
      const sec = timeValue % 60;
      const min = Math.floor(timeValue / 60) % 60;
      const hr = Math.floor(timeValue / 3600);
      return (
        <li
          key={i}
          onClick={(e) => {
            setSubjectTimer({ total: timeValue });
            setClicked(false);
            if (isStudy) {
              toggleTimer(subject);
            };
            setSubject(option)
            const targetElement = e.currentTarget.querySelector("p");
            timerDispRef.current = targetElement;


            const searchParams = new URLSearchParams(window.location.search);
            const tutorial = searchParams.get("tutorial");
            console.log(tutorial, 'gd')
            if (tutorial && parseInt(tutorial) === 7) {
              setSearchParams({...searchParams, tutorial: 8})
            }
          }}
          className={styles.option}
          id="tutorial-7"
        >
          {option.name}{" "}
          <p className={styles.timeDisp}>
            {" "}
            {hr}:{min.toString().padStart(2, "0")}:
            {sec.toString().padStart(2, "0")}
          </p>
        </li>
      );
    });

    subjectOptions.push(
      <li
        key={subjects.length + 1}
        onClick={() => {
          setClicked(false);
          setIsAddSubjectModal(true);
        }}
        className={styles.option}
      >
        Or Add Subject
      </li>,
    );

    setOptions(subjectOptions);
  }, [timeValues, isStudy]);

  const toggleTimer = (subject) => {
    if (!isStudy) {
      worker.postMessage({ command: "startSubjectTimer" });
      socket.emit("start", subject.id);
    } else {
      worker.postMessage({ command: "stopSubjectTimer" });
      socket.emit("stop", subject.id);
    }
    setIsStudy(!isStudy);
  };

  useEffect(() => {
    if (reset && isStudy) {
      setSubjectTimer({ total: 0 });
      /* toggleTimer();
      toggleTimer(); */
    }
  }, [reset]);

  useEffect(() => {
    const messageHandler = (e) => {
      if (e.data.command === "updateSubjectTimer") {
        //
        setSubjectTimer((prevTimer) => ({ total: prevTimer.total + 1 }));
        setMyTimerTotal((prevTimer) => prevTimer + 1);
        let timeValuesTemp = [];
        for (let i = 0; i < timeValues.length; i++) {
          if (timeValues[i].id === subject.id) {
            timeValuesTemp.push({
              id: timeValues[i].id,
              total: timeValues[i].total + 1,
            });
          } else {
            timeValuesTemp.push({
              id: timeValues[i].id,
              total: timeValues[i].total,
            });
          }
        }
        setTimeValues([...timeValuesTemp]);
      }
    };

    worker.addEventListener("message", messageHandler);

    return () => {
      worker.removeEventListener("message", messageHandler);
    };
  }, [timeValues, subject]);

  /* useEffect(() => {
    if (subject && isStudy) {
      socket.emit(`stop`, subject.id);
      socket.emit(`stop`, subject.id);
    }
  }, [subject, isStudy]); */

  return (
    <div className={styles.SubjectTimer}>
      <div className={styles.timerWrapper}
        ref={chooseSubjectRef}
      >
        <button
          className={`${clicked ? styles.clicked : ""} ${styles.optBtn}`}
          onClick={() => {
            setClicked(!clicked);
            const tutorial = searchParams.get("tutorial");
            if (tutorial && parseInt(tutorial) === 6) {
              setSearchParams({...searchParams, tutorial: 7})
            }
          }}
          id="tutorial-6"
        >
          <p>{subject ? subject.name : "Others"}</p>
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
        <ul className={`${styles.options} customScroll`} ref={subjectOptionsRef}>{options}</ul>
      </div>
      <div className={styles.buttonWrapper}>
        <button onClick={() => { toggleTimer(subject) }} className={styles.toggleBtn} ref={startSubjectRef} id="tutorial-8">
          {isStudy ? (
            <FontAwesomeIcon icon={faPause} />
          ) : (
            <FontAwesomeIcon icon={faPlay} />
          )}
        </button>
      </div>
    </div>
  );
}

export default SubjectTimer;
