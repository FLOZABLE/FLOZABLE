"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import StudyModalContainer from "@/app/components/Study/StudyModalContainer/StudyModalContainer";
import PlaylistModal from "@/app/components/Modals/PlaylistModal/PlaylistModal";
import SubjectTimer from "@/app/components/Study/SubjectTimer/SubjectTimer";
import PlanTimeline from "@/app/components/Plans/PlanTimeline/PlanTimeline";
import ThemeSelector from "@/app/components/Themes/ThemeSelector/ThemeSelector";
import MusicModal from "@/app/components/Modals/MusicModal/MusicModal";
import MyGroupsViewer from "@/app/components/Groups/MyGroupsViewer/MyGroupsViewer";
import YouTubePlayer from "@/app/components/Youtube/YouTubePlayer/YouTubePlayer";
import StudySidebar from "@/app/components/Study/StudySidebar/StudySidebar";
import StudyTimelineBar from "@/app/components/Study/StudyTimelineBar/StudyTimelineBar";
import PlansTimeline from "@/app/components/Plans/PlansTimeline/PlansTimeline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconBxHome, IconClipboardOutline } from "@/app/utils/Svg";
import { faHourglass, faUsers } from "@fortawesome/free-solid-svg-icons";

const MODAL_CORDINATES = {
  timer: {
    left: "3rem",
    top: "3rem",
  },
  planner: {
    left: "3rem",
    bottom: "10rem",
  },
};

function StudyOption({ children }) {
  return <div className={styles.StudyOption}>{children}</div>;
}

function Study() {
  const [isPlannerModal, setIsPlannerModal] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isTimerModal, setIsTimerModal] = useState(true);
  const [isPlaylistModal, setIsPlaylistModal] = useState(true);
  const [isTemplateModal, setIsTemplateModal] = useState(true);
  const [isVolumeModal, setIsVolumeModal] = useState(true);
  const [isZoom, setIsZoom] = useState(true);
  const [isToolModal, setIsToolModal] = useState(true);
  const [isViewGroups, setIsViewGroups] = useState(true);

  const [studyOptions, setStudyOptions] = useState({
    planner: false,
    timer: false,
    groups: false,
    playlist: false,
    music: false,
  });

  const [videoId, setVideoId] = useState("_gVrQa_bvm8");
  const [volume, setVolume] = useState(0);
  const [link, setLink] = useState([]);

  const handleLinkInput = (e) => {
    setLink(e.target.value);
  };

  const toggleStudyOption = useCallback((key) => {
    console.log(key);
    setStudyOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className={styles.Study}>
      <div className={styles.studyOptions}>
        <div
          className={styles.studyOption}
          onClick={() => {
            toggleStudyOption("timer");
          }}
        >
          <i>
            <FontAwesomeIcon icon={faHourglass} />
          </i>
        </div>
        <div
          className={styles.studyOption}
          onClick={() => {
            toggleStudyOption("planner");
          }}
        >
          <i>
            <IconClipboardOutline />
          </i>
        </div>
        <div className={styles.studyOption} onClick={() => {}}>
          <i>
            <FontAwesomeIcon icon={faUsers} />
          </i>
        </div>
        <div className={styles.studyOption} onClick={() => {}}>
          <i>
            <IconBxHome />
          </i>
        </div>
      </div>
      <StudyModalContainer isDisp={isTimerModal} style={MODAL_CORDINATES.timer}>
        <SubjectTimer
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
        />
      </StudyModalContainer>
      <StudyModalContainer
        isDisp={studyOptions.planner}
        style={MODAL_CORDINATES.planner}
      >
        <PlansTimeline
          viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
          viewer={"day"}
          mode={"study"}
          maxHeight="calc(100vh - 2.5rem)"
        />
      </StudyModalContainer>
      {/* <StudyModalContainer isDisp={isTemplateModal}>
        <ThemeSelector
          link={link}
          handleLinkInput={handleLinkInput}
          setVideoId={setVideoId}
        />
      </StudyModalContainer>
      <StudyModalContainer isDisp={isVolumeModal}>
        <MusicModal
          originalVideoVolume={volume}
          setOriginalVideoVolume={setVolume}
        />
      </StudyModalContainer>
      <StudyModalContainer isDisp={isPlaylistModal}>
        <PlaylistModal />
      </StudyModalContainer> */}
      <StudySidebar
        isPlannerModal={isPlannerModal}
        setIsPlannerModal={setIsPlannerModal}
        setIsPlaylistModal={setIsPlaylistModal}
        isPlaylistModal={isPlaylistModal}
        isTimerModal={isTimerModal}
        isTemplateModal={isTemplateModal}
        isVolumeModal={isVolumeModal}
        setIsTimerModal={setIsTimerModal}
        setIsTemplateModal={setIsTemplateModal}
        setIsVolumeModal={setIsVolumeModal}
        isZoom={isZoom}
        setIsZoom={setIsZoom}
        isViewGroups={isViewGroups}
        setIsViewGroups={setIsViewGroups}
        isToolModal={isToolModal}
        setIsToolModal={setIsToolModal}
      />
      <div className={`StudyMain`}>
        <div
          className={`${styles.myGroupsViewerWrapper} ${
            isViewGroups ? styles.open : ""
          }`}
          style={{ "--textColor": "#ffffff" }}
        >
          <MyGroupsViewer />
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
}

export default Study;
