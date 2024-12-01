"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import SubjectTimer from "@/app/components/Study/SubjectTimer/SubjectTimer";
import MyGroupsViewer from "@/app/components/Groups/MyGroupsViewer/MyGroupsViewer";
import YouTubePlayer from "@/app/components/Youtube/YouTubePlayer/YouTubePlayer";
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
import { useRouter } from "next/navigation";
import { exitFullscreen } from "@/app/utils/Tool";
import ChatModalBtn from "@/app/components/Buttons/ChatModalBtn/ChatModalBtn";
import { useTour } from "@reactour/tour";

function StudyOption({ onClick, children, hoverText, tutorial }) {
  return (
    <div
      className={styles.studyOption}
      onClick={onClick ?? onClick}
      data-tutorial={tutorial}
    >
      {children}
      <div className={`HoverText ${styles.hoverText}`}>{hoverText}</div>
    </div>
  );
}

function Study() {
  const router = useRouter();
  const { currentStep, setCurrentStep, isOpen } = useTour();

  const [studyOptions, setStudyOptions] = useState({
    planner: true,
    timer: true,
    groups: true,
    playlists: false,
    audioController: true,
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
    setStudyOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  useEffect(() => {
    if (studyOptions.zoom) {
      document.body.requestFullscreen();
    } else {
      exitFullscreen();
    }

    return () => {
      exitFullscreen();
    };
  }, [studyOptions.zoom]);

  useEffect(() => {
    if (currentStep === 13) {
      setTimeout(() => {
        setCurrentStep(14);
      }, 5000);
    }
  }, [currentStep]);

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
      <div className={styles.studyOptions} data-tutorial={13}>
        <StudyOption
          onClick={() => {
            toggleStudyOption("timer");
          }}
          hoverText={"Timer"}
        >
          <i>
            <FontAwesomeIcon icon={faHourglass} />
          </i>
        </StudyOption>
        <StudyOption
          onClick={() => {
            toggleStudyOption("planner");
          }}
          hoverText={"Planner"}
        >
          <i>
            <IconClipboardOutline />
          </i>
        </StudyOption>
        <StudyOption
          onClick={() => {
            toggleStudyOption("groups");
          }}
          hoverText={"Groups"}
        >
          <i>
            <FontAwesomeIcon icon={faUsers} />
          </i>
        </StudyOption>
        <StudyOption
          onClick={() => {
            toggleStudyOption("media");
          }}
          hoverText={"Media"}
        >
          <i>
            <FontAwesomeIcon icon={faPhone} />
          </i>
        </StudyOption>
        <StudyOption
          onClick={() => {
            toggleStudyOption("audioController");
          }}
          hoverText={"Audio"}
        >
          <i>
            <FontAwesomeIcon icon={faHeadphones} />
          </i>
        </StudyOption>
        <StudyOption
          onClick={() => {
            toggleStudyOption("playlists");
          }}
          hoverText={"Playlists"}
        >
          <i>
            <FontAwesomeIcon icon={faMusic} />
          </i>
        </StudyOption>
        <StudyOption
          onClick={() => {
            toggleStudyOption("themeSelector");
          }}
          hoverText={"Themes"}
        >
          <i>
            <FontAwesomeIcon icon={faImage} />
          </i>
        </StudyOption>
        <StudyOption
          onClick={() => {
            toggleStudyOption("zoom");
          }}
          hoverText={"Zoom"}
        >
          <i>
            {studyOptions.zoom ? (
              <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} />
            ) : (
              <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
            )}
          </i>
        </StudyOption>
        <StudyOption hoverText={"Chat"}>
          <ChatModalBtn />
        </StudyOption>
        <StudyOption
          onClick={() => {
            if (isOpen && currentStep === 13) return;
            if (currentStep === 14) {
              router.push("/dashboard/stats");
              return;
            }
            router.push("/dashboard");
          }}
          hoverText={"Home"}
          tutorial={14}
        >
          <i>
            <IconBxHome />
          </i>
        </StudyOption>
      </div>
      <div
        className={`${styles.StudyModalContainer} ${
          studyOptions.timer ? styles.visible : ""
        }`}
        id={styles.timer}
      >
        <SubjectTimer />
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
        <AudioController themeVolume={volume} setThemeVolume={setVolume} />
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
