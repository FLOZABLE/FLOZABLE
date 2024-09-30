"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import SubjectTimer from "@/app/components/Study/SubjectTimer/SubjectTimer";
import MusicModal from "@/app/components/Modals/MusicModal/MusicModal";
import MyGroupsViewer from "@/app/components/Groups/MyGroupsViewer/MyGroupsViewer";
import YouTubePlayer from "@/app/components/Youtube/YouTubePlayer/YouTubePlayer";
import StudySidebar from "@/app/components/Study/StudySidebar/StudySidebar";
import StudyTimelineBar from "@/app/components/Study/StudyTimelineBar/StudyTimelineBar";
import PlansTimeline from "@/app/components/Plans/PlansTimeline/PlansTimeline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconBxHome, IconClipboardOutline } from "@/app/utils/Svg";
import {
  faDownLeftAndUpRightToCenter,
  faHeadphones,
  faHourglass,
  faImage,
  faMusic,
  faPhone,
  faUpRightAndDownLeftFromCenter,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import VideoCallController from "../(header)/study/VideoCallController/VideoCallController";
import AudioController from "../(header)/study/AudioController/AudioController";
import PlaylistModal from "@/app/components/Modals/PlaylistModal/PlaylistModal";
import ThemeSelector from "@/app/components/Themes/ThemeSelector/ThemeSelector";

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
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [studyOptions, setStudyOptions] = useState({
    planner: false,
    timer: false,
    groups: false,
    playlists: false,
    audioController: false,
    media: false,
    themeSelector: false,
    zoom: false,
  });

  const [videoId, setVideoId] = useState("_gVrQa_bvm8");
  const [volume, setVolume] = useState(0);
  const [link, setLink] = useState([]);

  const handleLinkInput = useCallback(() => {
    setLink(e.target.value);
  }, []);

  const toggleStudyOption = useCallback((key) => {
    console.log(key);
    setStudyOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className={styles.Study}>
      <div className={styles.ytBg}>
        <YouTubePlayer
          height={"100vh"}
          width={"100vw"}
          videoId={videoId}
          volume={volume}
        />
      </div>
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
        <div
          className={styles.studyOption}
          onClick={() => {
            toggleStudyOption("groups");
          }}
        >
          <i>
            <FontAwesomeIcon icon={faUsers} />
          </i>
        </div>
        <div
          className={styles.studyOption}
          onClick={() => {
            toggleStudyOption("media");
          }}
        >
          <i>
            <FontAwesomeIcon icon={faPhone} />
          </i>
        </div>
        <div
          className={styles.studyOption}
          onClick={() => {
            toggleStudyOption("audioController");
          }}
        >
          <i>
            <FontAwesomeIcon icon={faHeadphones} />
          </i>
        </div>
        <div
          className={styles.studyOption}
          onClick={() => {
            toggleStudyOption("playlists");
          }}
        >
          <i>
            <FontAwesomeIcon icon={faMusic} />
          </i>
        </div>
        <div
          className={styles.studyOption}
          onClick={() => {
            toggleStudyOption("themeSelector");
          }}
        >
          <i>
            <FontAwesomeIcon icon={faImage} />
          </i>
        </div>
        <div
          className={styles.studyOption}
          onClick={() => {
            toggleStudyOption("zoom");
          }}
        >
          <i>
            {studyOptions.zoom ? (
              <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} />
            ) : (
              <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
            )}
          </i>
        </div>
        <div className={styles.studyOption} onClick={() => {}}>
          <i>
            <IconBxHome />
          </i>
        </div>
      </div>
      <div
        className={`${styles.StudyModalContainer} ${
          studyOptions.timer ? styles.visible : ""
        }`}
        id={styles.timer}
      >
        <SubjectTimer
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
        />
      </div>
      <div
        className={`${styles.StudyModalContainer} ${
          studyOptions.planner ? styles.visible : ""
        }`}
        id={styles.planner}
        style={{ "--text-color": "#fff" }}
      >
        <PlansTimeline
          viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
          viewer={"day"}
          maxHeight="calc(50vh)"
        />
      </div>
      <div
        className={`${styles.StudyModalContainer} ${
          studyOptions.media ? styles.visible : ""
        }`}
        id={styles.media}
      >
        <VideoCallController />
      </div>
      <div
        className={`${styles.StudyModalContainer} ${
          studyOptions.audioController ? styles.visible : ""
        }`}
        id={styles.AudioController}
      >
        <AudioController />
      </div>
      <div
        className={`${styles.StudyModalContainer} ${
          studyOptions.playlists ? styles.visible : ""
        }`}
        id={styles.PlaylistModal}
      >
        <PlaylistModal />
      </div>
      <div
        className={`${styles.StudyModalContainer} ${
          studyOptions.themeSelector ? styles.visible : ""
        }`}
        id={styles.ThemeSelector}
      >
        <ThemeSelector
          link={link}
          handleLinkInput={handleLinkInput}
          setVideoId={setVideoId}
        />
      </div>
      <div
        className={`${styles.MyGroupsViewer} ${
          studyOptions.groups ? styles.visible : ""
        }`}
        style={{ "--textColor": "#ffffff" }}
      >
        <MyGroupsViewer />
      </div>
      <div className={styles.StudyTimelineBar}>
        <StudyTimelineBar />
      </div>
    </div>
  );
}

export default Study;
