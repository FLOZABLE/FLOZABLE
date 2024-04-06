"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import StudyModalContainer from "@/app/components/Study/StudyModalContainer/StudyModalContainer";
import PlaylistModal from "@/app/components/Modals/PlaylistModal/PlaylistModal";
import SubjectTimer from "@/app/components/Study/SubjectTimer/SubjectTimer";
import PlanTimeline from "@/app/components/Plans/PlanTimeline/PlanTimeline";
import ThemeSelector from "@/app/components/Themes/ThemeSelector/ThemeSelector";
import MusicModal from "@/app/components/Modals/MusicModal/MusicModal";
import MyGroupsViewer from "@/app/components/Groups/MyGroupsViewer/MyGroupsViewer";
import YouTubePlayer from "@/app/components/Youtube/YouTubePlayer/YouTubePlayer";
import StudySubjectTool from "@/app/components/Study/StudySubjectTool/StudySubjectTool";


function Study() {
  const [subject, setSubject] = useState(null);
  const [isTimerModal, setIsTimerModal] = useState(true);
  const [isPlaylistModal, setIsPlaylistModal] = useState(false);
  const [isMicModal, setIsMicModal] = useState(false);
  const [isCamModal, setIsCamModal] = useState(false);
  const [isPlannerModal, setIsPlannerModal] = useState(false);
  const [isTemplateModal, setIsTemplateModal] = useState(false);
  const [isVolumeModal, setIsVolumeModal] = useState(false);
  const [isZoom, setIsZoom] = useState(false);
  const [isToolModal, setIsToolModal] = useState(false);

  const groupsViewerRef = useRef(null);

  const [videoId, setVideoId] = useState("MYPVQccHhAQ");
  const [volume, setVolume] = useState(0);
  const [link, setLink] = useState([]);

  const handleLinkInput = (e) => {
    setLink(e.target.value);
  };


  //localstorage positions
  const [dragPos, setDragPos] = useState({
    playlist: {
      x: "0vw",
      y: "0vh"
    },
    subject: {
      x: "0vw",
      y: "0vh"
    },
    theme: {
      x: "0vw",
      y: "0vh"
    },
    plan: {
      x: "0vw",
      y: "0vh"
    },
    music: {
      x: "0vw",
      y: "0vh"
    }
  });

  useEffect(() => {
    setDragPos(
      {
        playlist: {
          x: parseFloat(localStorage.getItem("playlist_positionX") || 0) * 100 + "vw",
          y: parseFloat(localStorage.getItem("playlist_positionY") || 0) * 100 + "vh"
        },
        subject: {
          x: parseFloat(localStorage.getItem("subject_positionX") || 0) * 100 + "vw",
          y: parseFloat(localStorage.getItem("subject_positionY") || 0) * 100 + "vh"
        },
        theme: {
          x: parseFloat(localStorage.getItem("theme_positionX") || 0) * 100 + "vw",
          y: parseFloat(localStorage.getItem("theme_positionY") || 0) * 100 + "vh"
        },
        plan: {
          x: parseFloat(localStorage.getItem("plan_positionX") || 0) * 100 + "vw",
          y: parseFloat(localStorage.getItem("plan_positionY") || 0) * 100 + "vh"
        },
        music: {
          x: parseFloat(localStorage.getItem("music_positionX") || 0) * 100 + "vw",
          y: parseFloat(localStorage.getItem("music_positionY") || 0) * 100 + "vh"
        }
      }
    )
  }, []);

  return (
    <div className={styles.Study}>
      <StudyModalContainer
        startPos={dragPos.playlist}
        onDragEnd={(event, dragElement) => { handleStop(event, dragElement, "playlist") }}
        isDisp={isPlaylistModal}
        element={
          <PlaylistModal />
        }
      />
      <StudyModalContainer
        startPos={dragPos.subject}
        onDragEnd={(event, dragElement) => { handleStop(event, dragElement, "subject") }}
        isDisp={isTimerModal}
        element={
          <SubjectTimer />
        }
      />
      <StudyModalContainer
        startPos={dragPos.plan}
        onDragEnd={(event, dragElement) => { handleStop(event, dragElement, "plan") }}
        isDisp={isPlannerModal}
        element={
          <PlanTimeline
            viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
            viewMode={"timeGridDay"}
            mode={"study"}
          />
        }
      />
      <StudyModalContainer
        startPos={dragPos.theme}
        onDragEnd={(event, dragElement) => { handleStop(event, dragElement, "theme") }}
        isDisp={isTemplateModal}
        element={
          <ThemeSelector
            link={link}
            handleLinkInput={handleLinkInput}
            setVideoId={setVideoId}
          />
        }
      />
      <StudySubjectTool
        startPos={{ x: "50vw", y: "19vh" }}
        isDisp={isToolModal}
        subject={subject}
      />
      {
        <StudyModalContainer
          startPos={dragPos.music}
          onDragEnd={(event, dragElement) => { handleStop(event, dragElement, "music") }}
          isDisp={isVolumeModal}
          element={
            <MusicModal
              originalVideoVolume={volume}
              setOriginalVideoVolume={setVolume}
            />
          }
        />
      }
      <StudySidebar
        setIsPlaylistModal={setIsPlaylistModal}
        isPlaylistModal={isPlaylistModal}
        isTimerModal={isTimerModal}
        isPlannerModal={isPlannerModal}
        isTemplateModal={isTemplateModal}
        isVolumeModal={isVolumeModal}
        isCam={isCam}
        isMic={isMic}
        setIsTimerModal={setIsTimerModal}
        setIsPlannerModal={setIsPlannerModal}
        setIsTemplateModal={setIsTemplateModal}
        setIsVolumeModal={setIsVolumeModal}
        isZoom={isZoom}
        setIsZoom={setIsZoom}
        isHeadphone={isHeadphone}
        setIsHeadphone={setIsHeadphone}
        setIsViewGroups={setIsViewGroups}
        setIsCam={setIsCam}
        setIsMic={setIsMic}
        bringSubjects={bringSubjects}
        isToolModal={isToolModal}
        setIsToolModal={setIsToolModal}
        tutorialBoxRef={tutorialBoxRef}
        tutorialTextRef={tutorialTextRef}
      />
      <div
        className={`StudyMain ${styles.Main} ${props.isSidebarOpen || props.isSidebarHovered ? "sidebarOpen" : ""
          }`}
      >
        <div
          className={`${styles.myGroupsViewerWrapper} ${isViewGroups ? styles.open : ""
            }`}
        >
          <MyGroupsViewer
            mode={"study"}
            groupsViewerRef={groupsViewerRef}
          />
        </div>
        <div className={styles.PlanTimelineBarWrapper}>
          {
            <div>
              <StudyTimelineBar />
            </div>
          }
        </div>
      </div>
      <div className={styles.ytBg}>
        <YouTubePlayer
          height={"100vh"}
          width={"100vw"}
          videoId={videoId}
          volume={volume}
        />
      </div>
    </div>
  );
};

export default Study;