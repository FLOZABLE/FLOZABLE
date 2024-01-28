import React, { useEffect, useState } from "react";
import styles from "./StudyHeader.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faClipboardCheck,
  faHourglass,
  faImage,
  faLink,
  faMicrophone,
  faUsers,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
import { AllThemes } from "../../../utils/Themes";
import CustomInput from "../CustomInput/CustomInput";
import VolumeControl from "../VolumeControl/VolumeControl";
import FullScreenBtn from "../FullScreenBtn/FullScreenBtn";

import SubjectTimer from "../SubjectTimer/SubjectTimer";
import PlanTimeline from "../PlanTimeline/PlanTimeline";

function StudyHeader({
  subjects,
  subject,
  setSubject,
  isStudy,
  setIsStudy,
  isAddSubjectModal,
  setIsAddSubjectModal,
  setMyTimerTotal,
  groupsBtn,
  setGroupsBtn,
  volume,
  setVolume,
  events,
  setEvents,
  setPlanModal,
  reset,
  setIsMic,
  setIsCam,
  isMic,
  isCam,
  socket,
  setVideoId,
}) {
  const [recommendedThemes, setRecommendedThemes] = useState([]);
  const [link, setLink] = useState([]);
  const [backgrounBtn, setBackgrounBtn] = useState(false);
  const [volumeBtn, setVolumeBtn] = useState(false);
  const [fullScreeenBtn, setFullScreenBtn] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [plannerBtn, setPlannerBtn] = useState(false);
  const [timerBtn, setTimerBtn] = useState(false);

  const handleLinkInput = (e) => {
    setLink(e.target.value);
  };

  const getRecommendedThemes = () => {
    setRecommendedThemes(
      AllThemes.map((Theme, i) => {
        return (
          <div
            className={styles.video}
            key={i}
            onClick={() => {
              setVideoId(Theme.id);
            }}
          >
            <img src={Theme.img} alt={Theme.id} />
          </div>
        );
      }),
    );
  };

  useEffect(() => {
    getRecommendedThemes();
  }, []);

  const submit = () => {
    try {
      const videoId = new URLSearchParams(new URL(link).search).get("v");
      setVideoId(videoId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className={styles.StudyHeader}>
      <ul className={styles.left}>
        <li className={`${timerBtn ? styles.open : ""} ${styles.timer}`}>
          <button
            onClick={() => {
              setTimerBtn(!timerBtn);
            }}
            className={styles.dispBtn}
          >
            <FontAwesomeIcon icon={faHourglass} />
          </button>
          <div className={styles.hoverEl}>Timer</div>
          <div className={styles.clickedEl}>
            <SubjectTimer
              socket={socket}
              subjects={subjects}
              subject={subject}
              setSubject={setSubject}
              isStudy={isStudy}
              setIsStudy={setIsStudy}
              setIsAddSubjectModal={setIsAddSubjectModal}
              isAddSubjectModal={isAddSubjectModal}
              setMyTimerTotal={setMyTimerTotal}
              reset={reset}
            />
          </div>
        </li>
      </ul>
      <ul className={styles.right}>
        <li className={`${plannerBtn ? styles.open : ""} ${styles.planner}`}>
          <button
            onClick={() => {
              setIsCam(!isCam);
            }}
            className={styles.dispBtn}
          >
            <FontAwesomeIcon icon={faCamera} />
          </button>
          <div className={styles.hoverEl}>Camera</div>
          <div className={styles.clickedEl}></div>
        </li>
        <li className={`${plannerBtn ? styles.open : ""} ${styles.planner}`}>
          <button
            onClick={() => {
              setIsMic(!isMic);
            }}
            className={styles.dispBtn}
          >
            <FontAwesomeIcon icon={faMicrophone} />
          </button>
          <div className={styles.hoverEl}>Microphone</div>
          <div className={styles.clickedEl}></div>
        </li>
        <li className={`${plannerBtn ? styles.open : ""} ${styles.planner}`}>
          <button
            onClick={() => {
              setPlannerBtn(!plannerBtn);
            }}
            className={styles.dispBtn}
          >
            <FontAwesomeIcon icon={faClipboardCheck} />
          </button>
          <div className={styles.hoverEl}>Planner</div>
          <div className={styles.clickedEl}>
            {/* <SmallPlanner plannerBtn={plannerBtn} setPlannerBtn={setPlannerBtn} /> */}
            <PlanTimeline
              plans={events}
              viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
              viewMode={"timeGridDay"}
              subjects={subjects}
              setPlans={setEvents}
              mode={"study"}
              setPlanModal={setPlanModal}
            />
          </div>
        </li>
        <li className={`${backgrounBtn ? styles.open : ""}`}>
          <button
            onClick={() => {
              setBackgrounBtn(!backgrounBtn);
            }}
            className={styles.dispBtn}
          >
            <FontAwesomeIcon icon={faImage} />
          </button>
          <div className={styles.hoverEl}>Background</div>
          <div className={styles.clickedEl}>
            <div className={styles.videoContainer}>
              {recommendedThemes}
              <CustomInput
                input={link}
                handleInput={handleLinkInput}
                handleEnter={submit}
                icon={faLink}
                placeHolder={"Paste a Youtube Link"}
                type={"text"}
              />
            </div>
          </div>
        </li>
        <li>
          <button
            onClick={() => {
              alert(groupsBtn);
              setGroupsBtn(!groupsBtn);
            }}
            className={styles.dispBtn}
          >
            <FontAwesomeIcon icon={faUsers} />
          </button>
          <div className={styles.hoverEl}>Show Groups</div>
        </li>
        <li className={`${volumeBtn ? styles.open : ""}`}>
          <button
            onClick={() => {
              setVolumeBtn(!volumeBtn);
            }}
            className={styles.dispBtn}
          >
            <FontAwesomeIcon icon={faVolumeHigh} />
          </button>
          <div className={styles.hoverEl}>Volume</div>
          <div className={styles.clickedEl}>
            <VolumeControl setVolume={setVolume} volume={volume} />
          </div>
        </li>
        <li className={`${fullScreeenBtn ? styles.open : ""}`}>
          <button
            onClick={() => {
              setFullScreenBtn(!fullScreeenBtn);
            }}
            className={styles.dispBtn}
          >
            <FullScreenBtn
              setFullScreen={setFullScreen}
              fullScreen={fullScreen}
            />
          </button>
          <div className={styles.hoverEl}>Full Screen</div>
        </li>
      </ul>
    </header>
  );
}

export default StudyHeader;
