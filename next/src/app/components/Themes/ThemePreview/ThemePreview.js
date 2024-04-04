import React, { useState, useRef, useEffect, useContext } from "react";
import styles from "./ThemePreview.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh, faVolumeXmark } from "@fortawesome/free-solid-svg-icons";
import Draggable from "react-draggable";
import YouTubePlayer from "@/app/components/Youtube/YouTubePlayer/YouTubePlayer";
import ThemeCategoryBtn from "@/app/components/Buttons/ThemeCategoryBtn/ThemeCategoryBtn";
import { ResponseContext, ThemesContext } from "@/app/utils/Contexts";

function ThemePreview({ isActive, setIsActive }) {
  const {themes} = useContext(ThemesContext);
  const {setResponse} = useContext(ResponseContext);

  const [volume, setVolume] = useState(0);
  const draggableRef = useRef(null);

  useEffect(() => {
    if (!themes.length) return;
    
    const searchParams = new URLSearchParams(window.location.search);
    const themeId = searchParams.get('id');

    if (!themeId) return;
    
    const theme = themes.find(theme => theme.id === themeId);

    if (!theme) {
      setResponse({success: false, reason: 'Invalid Theme'});
      return;
    };

    setIsActive(theme);
  }, [themes]);

  return (
    <div className={styles.ThemePreview}>
      <div className={isActive ? styles.active : styles.hidden}>
        <div className={styles.transitionCircle}>
          <Draggable nodeRef={draggableRef}>
            <div ref={draggableRef} className={`${styles.controlButtons}`}>
              <button
                onClick={() => {
                  setIsActive((prev) => !prev);
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setVolume((volume + 50) % 100);
                }}
              >
                <FontAwesomeIcon
                  className={styles.volumeIcon}
                  icon={volume > 0 ? faVolumeHigh : faVolumeXmark}
                />
              </button>
              <ThemeCategoryBtn
                themeId={isActive.id}
              />
            </div>
          </Draggable>
          {!isActive ? (
            <div></div>
          ) : (
            <div className={styles.youtubeWrapper}>
              <div className={isActive ? "" : styles.hidden}>
                <YouTubePlayer
                  height={"100vh"}
                  width={"100vw"}
                  videoId={isActive.video_id}
                  volume={volume}
                  autoplay={1}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ThemePreview;
