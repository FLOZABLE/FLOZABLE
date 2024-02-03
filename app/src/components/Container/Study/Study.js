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
  } = props;

  const [isTimerModal, setIsTimerModal] = useState(false);
  const [isPlaylistModal, setIsPlaylistModal] = useState(false);
  const [isMicModal, setIsMicModal] = useState(false);
  const [isCamModal, setIsCamModal] = useState(false);
  const [isPlannerModal, setIsPlannerModal] = useState(false);
  const [isTemplateModal, setIsTemplateModal] = useState(false);
  const [isVolumeModal, setIsVolumeModal] = useState(false);
  const [isZoom, setIsZoom] = useState(false);

  const [videoId, setVideoId] = useState("MYPVQccHhAQ");
  const [volume, setVolume] = useState(0);
  const [addSubjectResponse, setAddSubjectResponse] = useState(null);
  const [myTimerTotal, setMyTimerTotal] = useState(0);
  const [addPlanResponse, setAddPlanResponse] = useState(null);
  const [isCam, setIsCam] = useState(false);
  const [isMic, setIsMic] = useState(false);
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

  return (
    <div className={styles.StudyContainer}>
      <StudyModalContainer 
        startPos={{ x: "10vw", y: "5vh" }}
        isDisp={isPlaylistModal}
        element={
          <PlaylistModal 
          userInfo={userInfo}
          setResponse={setResponse}
          />
        }
      />
      <StudyModalContainer
        startPos={{ x: "5vw", y: "5vh" }}
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
          />
        }
      />
      <StudyModalContainer
        startPos={{ x: "5vw", y: "12vh" }}
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
        startPos={{ x: "50vw", y: "19vh" }}
        isDisp={isTemplateModal}
        element={
          <ThemeSelector
            link={link}
            handleLinkInput={handleLinkInput}
            setVideoId={setVideoId}
          />
        }
      />
      {
        <StudyModalContainer
          startPos={{ x: "5vw", y: "38vh" }}
          isDisp={isVolumeModal}
          element={<MusicModal originalVideoVolume={volume} setOriginalVideoVolume={setVolume} />}
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
        setIsViewGroups={setIsViewGroups}
        setIsCam={setIsCam}
        setIsMic={setIsMic}
        bringSubjects={bringSubjects}
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
          />
        </div>
        <div className={styles.PlanTimelineBarWrapper}>
          <PlanTimelineBar events={events} subjects={subjects} />
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