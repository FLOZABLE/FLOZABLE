import React, { useState, useEffect, useRef } from "react";
import styles from "./Study.module.css";
import MyGroupsViewer from "../../UI/MyGroupsViewer/MyGroupsViewer";
import YouTubePlayer from "../../UI/YouTubePlayer/YouTubePlayer";
import PlanTimelineBar from "../../UI/PlanTimelineBar/PlanTimelineBar";
import StudySidebar from "../../UI/StudySidebar/StudySidebar";
import SubjectTimer from "../../UI/SubjectTimer/SubjectTimer";
import StudyModalContainer from "../../UI/StudyModalContainer/StudyModalContainer";
import PlanTimeline from "../../UI/PlanTimeline/PlanTimeline";
import VolumeControl from "../../UI/VolumeControl/VolumeControl";
import ThemeSelector from "../../UI/ThemeSelector/ThemeSelector";
import MusicModal from "../../UI/MusicModal/MusicModal";
import PlaylistModal from "../../UI/PlaylistModal/PlaylistModal";
import StudySubjectTools from "../../UI/StudySubjectTools/StudySubjectTools";
import StudyTimelineBar from "../../UI/StudyTimelineBar/StudyTimelineBar";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Study(props) {
  const {
    isStudy,
    setIsStudy,
    subjects,
    setSubjects,
    userInfo,
    events,
    setEvents,
    reset,
    myGroups,
    isAddSubjectModal,
    setIsAddSubjectModal,
    setPlanModal,
    bringSubjects,
    setIsChatModal,
    setResponse,
    tutorialBoxRef,
    tutorialTextRef,
    musicFiles,
  } = props;

  const [isTimerModal, setIsTimerModal] = useState(true);
  const [isPlaylistModal, setIsPlaylistModal] = useState(false);
  const [isMicModal, setIsMicModal] = useState(false);
  const [isCamModal, setIsCamModal] = useState(false);
  const [isPlannerModal, setIsPlannerModal] = useState(false);
  const [isTemplateModal, setIsTemplateModal] = useState(false);
  const [isVolumeModal, setIsVolumeModal] = useState(false);
  const [isZoom, setIsZoom] = useState(false);
  const [isToolModal, setIsToolModal] = useState(false);

  const [videoId, setVideoId] = useState("MYPVQccHhAQ");
  const [volume, setVolume] = useState(0);
  const [addSubjectResponse, setAddSubjectResponse] = useState(null);
  const [myTimerTotal, setMyTimerTotal] = useState(0);
  const [addPlanResponse, setAddPlanResponse] = useState(null);
  const [isCam, setIsCam] = useState(false);
  const [isMic, setIsMic] = useState(false);
  const [isHeadphone, setIsHeadphone] = useState(false);
  const [link, setLink] = useState([]);
  const [isViewGroups, setIsViewGroups] = useState(true);

  //events
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectsOpt, setSubjectsOpt] = useState([]);
  const [subject, setSubject] = useState(null);
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [repeat, setRepeat] = useState(0);
  const [priority, setPriority] = useState(50);
  const [notification, setNotification] = useState(-1);

  //localstorage positions
  const [dragPos] = useState({
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
  });



  const groupsViewerRef = useRef(null);

  const handleLinkInput = (e) => {
    setLink(e.target.value);
  };

  useEffect(() => {
    if (
      subjects.daily &&
      subjects.daily.groupedTotal[subjects.daily.groupedTotal.length - 1]
    ) {
      setMyTimerTotal(
        subjects.daily.groupedTotal[subjects.daily.groupedTotal.length - 1],
      );
    }
  }, [subjects]);

  useEffect(() => {
    /* if (isZoom) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.error('Fullscreen request failed:', err);
        });
      } else {
        document.exitFullscreen().catch((err) => {
          console.error('Exit fullscreen request failed:', err);
        });
      }
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Exit fullscreen request failed:', err);
      });
    } */
    if (!document.fullscreenElement && isZoom) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Fullscreen request failed:", err);
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error("Exit fullscreen request failed:", err);
      });
    }
  }, [isZoom]);

  useEffect(() => {
    setSubjectsOpt([
      ...subjects.map((subject) => {
        return { name: subject.name, value: subject.id };
      }),
      { name: "others", value: "0000000000" },
    ]);
  }, [subjects]);

  const handleStop = (event, dragElement, name) => {
    //Calculate global pos instead of relative pos to previous offset
    const previousX = parseFloat(dragPos[name].x) / 100;
    const previousY = parseFloat(dragPos[name].y) / 100;
    localStorage.setItem(name + "_positionX", previousX + dragElement.x / window.innerWidth);
    localStorage.setItem(name + "_positionY", previousY + dragElement.y / window.innerHeight);
  };

  return (
    <div className={styles.Study}>
      <StudyModalContainer
        startPos={dragPos.playlist}
        onDragEnd={(event, dragElement) => { handleStop(event, dragElement, "playlist") }}
        isDisp={isPlaylistModal}
        element={
          <PlaylistModal
            userInfo={userInfo}
            setResponse={setResponse}
          />
        }
      />
      <StudyModalContainer
        startPos={dragPos.subject}
        onDragEnd={(event, dragElement) => { handleStop(event, dragElement, "subject") }}
        isDisp={isTimerModal}
        element={
          <SubjectTimer
            subjects={subjects}
            setSubjects={setSubjects}
            subject={subject}
            setSubject={setSubject}
            isStudy={isStudy}
            setIsStudy={setIsStudy}
            setIsAddSubjectModal={setIsAddSubjectModal}
            isAddSubjectModal={isAddSubjectModal}
            setMyTimerTotal={setMyTimerTotal}
            tutorialBoxRef={tutorialBoxRef}
            tutorialTextRef={tutorialTextRef}
          />
        }
      />
      <StudyModalContainer
        startPos={dragPos.plan}
        onDragEnd={(event, dragElement) => { handleStop(event, dragElement, "plan") }}
        isDisp={isPlannerModal}
        element={
          <PlanTimeline
            plans={events}
            viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
            viewMode={"timeGridDay"}
            subjects={subjects}
            setPlans={setEvents}
            mode={"study"}
            setPlanModal={setPlanModal}
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
      <StudySubjectTools
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
              musicFiles={musicFiles}
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
            myGroups={myGroups}
            mode={"study"}
            userInfo={userInfo}
            myTimerTotal={myTimerTotal}
            isCam={isCam}
            isMic={isMic}
            setIsChatModal={setIsChatModal}
            groupsViewerRef={groupsViewerRef}
            isHeadphone={isHeadphone}
            setIsCam={setIsCam}
            setIsMic={setIsMic}
          />
        </div>
        <div className={styles.PlanTimelineBarWrapper}>
          {
            <div>
              {
                //<PlanTimelineBar events={events} subjects={subjects} />
              }
              <StudyTimelineBar events={events} subjects={subjects} setPlanModal={setPlanModal} />
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
}

export default Study;