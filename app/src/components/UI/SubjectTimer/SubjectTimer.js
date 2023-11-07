import React, { useState, useEffect, useRef } from "react";
import styles from "./SubjectTimer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import worker from "./TimerWorker";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function SubjectTimer(props) {
  const { subjects, setSubjects, /* subject, setSubject,  */isStudy, setIsStudy, isAddSubjectModal, setIsAddSubjectModal, setMyTimerTotal, reset, socket } = props;
  const timerDispRef = useRef(null);
  
  const [subject, setSubject] = useState(null);
  const [timeValues, setTimeValues] = useState([]);
  const [options, setOptions] = useState([]);
  const [subjectTimer, setSubjectTimer] = useState({ total: 0, });
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    setTimeValues(
      subjects.map((subject) => {
        let total = subject.daily.total[subject.daily.total.length - 1];
        let id = subject.id;
        return {id, total};
      })
    );
  }, [subjects]);

  useEffect(() => {
    if (timeValues.length) {
      setSubject({...subjects[0]});
      if (subjects[0].daily && subjects[0].daily.total) {
        const timeValue = subjects[0].daily.total[subjects[0].daily.total.length - 1];
        setSubjectTimer({total: timeValue});
      };
      setSubjectTimer({total: timeValues[0].total});
    }
    const subjectOptions = subjects.map((option, i) => {
      let timeValue = 0;
      /*if (option.daily && option.daily.total) {
        timeValue = option.daily.total[option.daily.total.length - 1];
      };*/
      timeValue = timeValues[i].total;

      const sec = timeValue % 60;
      const min = Math.floor(timeValue / 60) % 60;
      const hr = Math.floor(timeValue / 3600);
      return (
        <li key={i} onClick={(e) => {
          setSubjectTimer({ total: timeValue })
          setClicked(false);
          setSubject(option);
          const targetElement = e.currentTarget.querySelector('p');
          timerDispRef.current = targetElement;
        }
        } className={styles.option} >
          {option.name} <p className={styles.timeDisp}> {hr}:{min.toString().padStart(2, '0')}:{sec.toString().padStart(2, '0')}</p>
        </li>
      )
    });

    subjectOptions.push(
      <li key={subjects.length + 1} onClick={() => { setClicked(false); setIsAddSubjectModal(true) }} className={styles.option}>
        Or Add Subject
      </li>
    );
    
    setOptions(subjectOptions);
  }, [timeValues]);

  const toggleTimer = () => {
    if (!isStudy) {
      console.log("start");
      console.log(subjectTimer, subject);
      worker.postMessage({ command: 'startSubjectTimer' });
      socket.emit("start", subject.id);
      /* fetch(`${serverOrigin}/api/study/start`, {
        method: 'post', headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subjectId: subject.id })
      })
        .then((response) => response.json())
        .then((data) => {
           
        })
        .catch((error) => console.error(error)); */
    } else {
      console.log("stop")
      worker.postMessage({ command: 'stopSubjectTimer' });
      socket.emit("stop", subject.id);
      /* fetch(`${serverOrigin}/api/study/stop`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subjectId: subject.id })
      })
        .then((response) => response.json())
        .then((data) => {
           
        })
        .catch((error) => console.error(error)); */
    }
    setIsStudy(!isStudy);
  };

  useEffect(() => {
     
    if (reset && isStudy) {
       
      setSubjectTimer({total: 0});
      /* toggleTimer();
      toggleTimer(); */
    };
  }, [reset]);

  useEffect(() => {
    const messageHandler = (e) => {
      if (e.data.command === 'updateSubjectTimer') {
        // 
        setSubjectTimer((prevTimer) => ({ total: prevTimer.total + 1 }));
        setMyTimerTotal((prevTimer) => (prevTimer + 1));

        let timeValuesTemp = [];
        for (let i = 0; i < timeValues.length; i++){
          if (timeValues[i].id == subject.id){
            timeValuesTemp.push({id: timeValues[i].id, total: timeValues[i].total + 1});
          }
          else{
            timeValuesTemp.push({id: timeValues[i].id, total: timeValues[i].total});
          }
        }
        setTimeValues([...timeValuesTemp]);
      }
    };

    worker.addEventListener('message', messageHandler);

    return () => {
      worker.removeEventListener('message', messageHandler);
    };
  }, [timeValues, subject]);

  return (
    <div className={styles.SubjectTimer}>
      <div className={styles.timerWrapper}>
        <button className={`${clicked ? styles.clicked : ''} ${styles.optBtn}`} onClick={() => { setClicked(!clicked) }}>
          <p>{subject ? subject.name : 'Others'}</p>
          <p className={styles.mainTimeDisp}>
          {Math.floor(subjectTimer.total / 3600)}:{(Math.floor(subjectTimer.total / 60) % 60).toString().padStart(2, '0')}:{(subjectTimer.total % 60).toString().padStart(2, '0')}
          </p>
          <i>
            <FontAwesomeIcon icon={faCaretDown} />
          </i>
        </button>
        <ul className={`${styles.options} customScroll`}>
          {options}
        </ul>
      </div>
      <div className={styles.buttonWrapper}>
        <button onClick={toggleTimer} className={styles.toggleBtn}>
          {isStudy ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />}
        </button>
      </div>
    </div>
  );
};

export default SubjectTimer;