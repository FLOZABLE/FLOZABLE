import { useState, useCallback, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import update from "immutability-helper";
import StudyTool from "../StudyToolWrapper/StudyToolWrapper";
import { Link } from "react-router-dom";
import styles from "./StudySidebar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faClipboardCheck,
  faDownLeftAndUpRightToCenter,
  faHome,
  faHourglass,
  faImage,
  faMicrophone,
  faMusic,
  faUpRightAndDownLeftFromCenter,
  faUsers,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
import { socket } from "../../../socket";
import { IconCameraVideoFill, IconCameraVideoOffFill, IconHeadphoneFill, IconHeadphonesOff, IconMicFill, IconMicMuteFill } from "../../../utils/svgs";

function FullScreenBtn() {
  const [isZoom, setIsZoom] = useState(false);

  useEffect(() => {
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

  return (
    <div
      className={`${styles.studyTool} ${isZoom ? styles.clicked : ""}`}
      onClick={() => {
        setIsZoom((prev) => !prev);
      }}
    >
      <i>
        <FontAwesomeIcon
          icon={
            isZoom
              ? faDownLeftAndUpRightToCenter
              : faUpRightAndDownLeftFromCenter
          }
        />
      </i>
      <div className={styles.hoverEl}>
        Full Screen
      </div>
    </div>
  )
};

function HeadphoneBtn() {
  const [isHeadphone, setIsHeadphone] = useState(false);
  return (
    <div
      className={`${styles.studyTool} ${isHeadphone ? styles.clicked : ""}`}
      onClick={() => {
        setIsHeadphone(prev => !prev);
      }}
    >
      <i style={{ fontSize: '23px' }}>
        {isHeadphone ? <IconHeadphoneFill /> : <IconHeadphonesOff />}
      </i>
      <div className={styles.hoverEl}>
        {isHeadphone ? "Undeafen" : "Deafen"}
      </div>
    </div>
  )
};

function ButtonContainer({text1, text2, icon1, icon2}) {
  const [isClicked, setIsClicked] = useState(false);
  return (
    <div
      className={`${styles.studyTool} ${isClicked ? styles.clicked : ""}`}
      onClick={() => {
        setIsClicked(prev => !prev);
      }}
    >
      <i style={{ fontSize: '23px' }}>
        {isClicked ? icon1 : icon2}
      </i>
      <div className={styles.hoverEl}>
        {isClicked ? text1 : text2}
      </div>
    </div>
  )
}

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
  setIsHeadphone
}) {
  const [items, setItems] = useState([
    {
      id: 0,
      element: (
        <Link
          to={"/dashboard/stats"}
          className={`${styles.studyTool} ${isTimerModal ? styles.clicked : ""
            }`}
          onClick={() => {
            bringSubjects();
            socket.emit('exitSession');
          }}
          style={{ zIndex: 9 }}
        >
          <i>
            <FontAwesomeIcon icon={faHome} />
          </i>
          <div className={styles.hoverEl}>
            to Home
          </div>
        </Link>
      ),
    },

    {
      id: 1,
      element: (
        <div
          className={`${styles.studyTool} ${isTimerModal ? styles.clicked : ""
            }`}
          onClick={() => {
            setIsTimerModal((prev) => !prev);
          }}
        >
          <i>
            <FontAwesomeIcon icon={faHourglass} />
          </i>
          <div className={styles.hoverEl}>
            Timer
          </div>
        </div>
      ),
    },

    {
      id: 2,
      element: (
        <div
          className={`${styles.studyTool} ${isPlannerModal ? styles.clicked : ""
            }`}
          onClick={() => {
            setIsPlannerModal((prev) => !prev);
          }}
        >
          <i>
            <FontAwesomeIcon icon={faClipboardCheck} />
          </i>
          <div className={styles.hoverEl}>
            Planner
          </div>
        </div>
      ),
    },

    {
      id: 3,
      element: (
        <div
          onClick={() => {
            setIsCam((prev) => !prev);
          }}
        >
          <ButtonContainer 
            text1={"Turn Off Camera"}
            text2={"Turn On Camera"}
            icon1={<IconCameraVideoFill />}
            icon2={<IconCameraVideoOffFill />}
          />
        </div>
      ),
    },

    {
      id: 4,
      element: (
        <div
          onClick={() => {
            setIsMic((prev) => !prev);
          }}
        >
          <ButtonContainer 
            text1={"Mute"}
            text2={"Unmute"}
            icon1={<IconMicFill />}
            icon2={<IconMicMuteFill />}
          />
        </div>
      ),
    },

    {
      id: 5,
      element: (
        <div
          onClick={() => {
            setIsHeadphone((prev) => !prev);
          }}
        >
          <ButtonContainer 
            text1={"Deafen"}
            text2={"Undeafen"}
            icon1={<IconHeadphoneFill />}
            icon2={<IconHeadphonesOff />}
          />
        </div>
      ),
    },

    {
      id: 6,
      element: (
        <div
          className={`${styles.studyTool} ${isTemplateModal ? styles.clicked : ""
            }`}
          onClick={() => {
            setIsTemplateModal((prev) => !prev);
          }}
        >
          <i>
            <FontAwesomeIcon icon={faImage} />
          </i>
          <div className={styles.hoverEl}>
            Themes
          </div>
        </div>
      ),
    },

    {
      id: 7,
      element: (
        <div
          className={`${styles.studyTool} ${isVolumeModal ? styles.clicked : ""
            }`}
          onClick={() => {
            setIsVolumeModal((prev) => !prev);
          }}
        >
          <i>
            <FontAwesomeIcon icon={faVolumeHigh} />
          </i>
          <div className={styles.hoverEl}>
            Sound
          </div>
        </div>
      ),
    },

    {
      id: 8,
      element: (
        <div
          className={`${styles.studyTool} ${isGroupModal ? styles.clicked : ""
            }`}
          onClick={() => {
            setIsViewGroups((prev) => !prev);
          }}
        >
          <i>
            <FontAwesomeIcon icon={faUsers} />
          </i>
          <div className={styles.hoverEl}>
            View Group
          </div>
        </div>
      ),
    },
    {
      id: 9,
      element: (
        <FullScreenBtn isZoom={isZoom} setIsZoom={setIsZoom} />
      ),
    },
    {
      id: 10,
      element: (
        <div
          className={`${styles.studyTool} ${isGroupModal ? styles.clicked : ""
            }`}
          onClick={() => {
            setIsPlaylistModal((prev) => !prev);
          }}
        >
          <i>
            <FontAwesomeIcon icon={faMusic} />
          </i>
          <div className={styles.hoverEl}>
            Playlist
          </div>
        </div>
      ),
    },
  ]);

  const moveCard = useCallback((dragIndex, hoverIndex) => {
    setItems((prevItems) =>
      update(prevItems, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevItems[dragIndex]],
        ],
      }),
    );
  }, []);

  const renderCard = useCallback((card, index, styles) => {
    return (
      <StudyTool
        key={card.id}
        index={index}
        id={card.id}
        element={card.element}
        moveCard={moveCard}
        styles={styles}
      />
    );
  }, []);

  return (
    <div className={styles.StudySidebar}>
      <DndProvider backend={HTML5Backend}>
        {items.map((card, i) => renderCard(card, i, styles))}
      </DndProvider>
    </div>
  );
}

export default StudySidebar;
