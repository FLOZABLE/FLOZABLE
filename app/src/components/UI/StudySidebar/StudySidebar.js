import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styles from "./StudySidebar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardCheck,
  faDownLeftAndUpRightToCenter,
  faHome,
  faHourglass,
  faImage,
  faMusic,
  faScrewdriverWrench,
  faUpRightAndDownLeftFromCenter,
  faUsers,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
import { socket } from "../../../socket";
import { IconCameraVideoFill, IconCameraVideoOffFill, IconHeadphoneFill, IconHeadphonesOff, IconMicFill, IconMicMuteFill } from "../../../utils/svgs";

function StudySidebar({
  isTimerModal,
  isPlannerModal,
  isTemplateModal,
  isGroupModal,
  isVolumeModal,
  isZoom,
  setIsTimerModal,
  setIsPlannerModal,
  setIsTemplateModal,
  setIsVolumeModal,
  setIsZoom,
  setIsViewGroups,
  setIsCam,
  setIsMic,
  isCam,
  isMic,
  bringSubjects,
  setIsPlaylistModal,
  isPlaylistModal,
  isHeadphone,
  setIsHeadphone,
  setIsToolModal,
  isToolModal,
  tutorialBoxRef,
  tutorialTextRef,
}) {

  const [searchParams, setSearchParams] = useSearchParams();
  const [tutorial, setTutorial] = useState(null);
  const toHomeBtnRef = useRef(null);

  useEffect(() => {
    if (!searchParams) return;

    const tutorial = searchParams.get("tutorial");
    if (tutorial && parseInt(tutorial) === 9) {
      setTutorial(9);

      setTimeout(() => {
        const { width, top, left, height, bottom } = toHomeBtnRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left + 'px';
        tutorialBoxRef.current.style.top = top + 'px';
        tutorialBoxRef.current.style.width = width + 'px';
        tutorialBoxRef.current.style.height = height + 'px';

        tutorialTextRef.current.style.top = top + 'px';
        tutorialTextRef.current.style.left = left + width + 30 + 'px';
        tutorialTextRef.current.innerText = "Let's go back to the dashboard!";
      }, 500);
    }
  }, [searchParams]);


  return (
    <div className={styles.StudySidebar}>
      <Link
        to={tutorial ? `/dashboard?tutorial=${tutorial + 1}` : "/dashboard"}
        className={`${styles.studyTool}`}
        onClick={() => {
          bringSubjects();
          socket.emit('exitSession');
        }}
        ref={toHomeBtnRef}
        id="tutorial-9"
      >
        <i style={{ fontSize: '1.4375rem' }}>
          <FontAwesomeIcon icon={faHome} />
        </i>
        <div className={styles.hoverEl}>
          Home
        </div>
      </Link>
      <div
        className={`${styles.studyTool} ${isTimerModal ? styles.clicked : ""}`}
        onClick={() => {
          setIsTimerModal(prev => !prev);
        }}
      >
        <i style={{ fontSize: '1.4375rem' }}>
          <FontAwesomeIcon icon={faHourglass} />
        </i>
        <div className={styles.hoverEl}>
          Timer
        </div>
      </div>

      <div
        className={`${styles.studyTool} ${isPlannerModal ? styles.clicked : ""}`}
        onClick={() => {
          setIsPlannerModal(prev => !prev);
        }}
      >
        <i style={{ fontSize: '1.4375rem' }}>
          <FontAwesomeIcon icon={faClipboardCheck} />
        </i>
        <div className={styles.hoverEl}>
          Planner
        </div>
      </div>

      <div
        className={`${styles.studyTool} ${isCam ? styles.clicked : ""}`}
        onClick={() => {
          setIsCam(prev => !prev);
        }}
      >
        <i style={{ fontSize: '1.4375rem' }}>
          {isCam ? <IconCameraVideoFill /> : <IconCameraVideoOffFill />}
        </i>
        <div className={styles.hoverEl}>
          {isCam ? "Cam Off" : "Cam On"}
        </div>
      </div>

      <div
        className={`${styles.studyTool} ${isMic ? styles.clicked : ""}`}
        onClick={() => {
          setIsMic(prev => !prev);
        }}
      >
        <i style={{ fontSize: '1.4375rem' }}>
          {isMic ? <IconMicFill /> : <IconMicMuteFill />}
        </i>
        <div className={styles.hoverEl}>
          {isMic ? "Mute" : "Unmute"}
        </div>
      </div>

      <div
        className={`${styles.studyTool} ${isHeadphone ? styles.clicked : ""}`}
        onClick={() => {
          setIsHeadphone(prev => !prev);
        }}
      >
        <i style={{ fontSize: '1.4375rem' }}>
          {isHeadphone ? <IconHeadphoneFill /> : <IconHeadphonesOff />}
        </i>
        <div className={styles.hoverEl}>
          {isHeadphone ? "Deafen" : "Undeafen"}
        </div>
      </div>

      <div
        className={`${styles.studyTool} ${isGroupModal ? styles.clicked : ""}`}
        onClick={() => {
          setIsViewGroups(prev => !prev);
        }}
      >
        <i style={{ fontSize: '1.4375rem' }}>
          <FontAwesomeIcon icon={faUsers} />
        </i>
        <div className={styles.hoverEl}>
          {isGroupModal ? "View Groups" : "Hide Groups"}
        </div>
      </div>

      <div
        className={`${styles.studyTool} ${isTemplateModal ? styles.clicked : ""}`}
        onClick={() => {
          setIsTemplateModal(prev => !prev);
        }}
      >
        <i style={{ fontSize: '1.4375rem' }}>
          <FontAwesomeIcon icon={faImage} />
        </i>
        <div className={styles.hoverEl}>
          Themes
        </div>
      </div>

      <div
        className={`${styles.studyTool} ${isVolumeModal ? styles.clicked : ""}`}
        onClick={() => {
          setIsVolumeModal(prev => !prev);
        }}
      >
        <i style={{ fontSize: '1.4375rem' }}>
          <FontAwesomeIcon icon={faVolumeHigh} />
        </i>
        <div className={styles.hoverEl}>
          Sound
        </div>
      </div>

      <div
        className={`${styles.studyTool} ${isPlaylistModal ? styles.clicked : ""}`}
        onClick={() => {
          setIsPlaylistModal(prev => !prev);
        }}
      >
        <i style={{ fontSize: '1.4375rem' }}>
          <FontAwesomeIcon icon={faMusic} />
        </i>
        <div className={styles.hoverEl}>
          Playlist
        </div>
      </div>

      <div
        className={`${styles.studyTool} ${isToolModal ? styles.clicked : ""}`}
        onClick={() => {
          setIsToolModal(prev => !prev);
        }}
      >
        <i style={{ fontSize: '1.4375rem' }}>
          {isToolModal ?
            <FontAwesomeIcon icon={faScrewdriverWrench} />
            :
            <FontAwesomeIcon icon={faScrewdriverWrench} />
          }
        </i>
        <div className={styles.hoverEl}>
          Tools
        </div>
      </div>

      <div
        className={`${styles.studyTool} ${isZoom ? styles.clicked : ""}`}
        onClick={() => {
          setIsZoom(prev => !prev);
        }}
      >
        <i style={{ fontSize: '1.4375rem' }}>
          <FontAwesomeIcon
            icon={
              isZoom
                ? faDownLeftAndUpRightToCenter
                : faUpRightAndDownLeftFromCenter
            }
          />
        </i>
        <div className={styles.hoverEl}>
          {isZoom ? "Exit Fullscreen" : "Fullscreen"}
        </div>
      </div>
    </div>
  );
}

export default StudySidebar;
