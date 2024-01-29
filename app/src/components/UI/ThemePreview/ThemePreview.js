import React, { useState, useEffect } from "react";
import styles from "./ThemePreview.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVolumeHigh,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import YouTubePlayer from "../YouTubePlayer/YouTubePlayer";
import BlobBtn from "../BlobBtn/BlobBtn"
import ThemeCategoryBtn from "../ThemeCategoryBtn/ThemeCategoryBtn";
import Draggable from "react-draggable";

function ThemePreview({ isActive, setIsActive, setResponse }) {
  const [isDragging, setIsDragging] = useState(false);
  const [volume, setVolume] = useState(0);
  const [themeCategory, setThemeCategory] = useState(-1);

  const eventControl = (event) => {
    if (event.type === 'mousemove' || event.type === 'touchmove') {
      setIsDragging(true)
    }
    if (event.type === 'mouseup' || event.type === 'touchend') {
      setTimeout(() => {
        setIsDragging(false);
      }, 100);
    }
  }

  return (
    <div className={styles.ThemePreview}>
      <div className={isActive ? styles.active : styles.hidden}>
        <div className={styles.transitionCircle}>
          <Draggable
            onDrag={eventControl}
            onStop={eventControl}
          >
            <div className={`${styles.controlButtons} ${!isDragging ? styles.initial : ''}`}>
              <button onClick={() => { if (!isDragging) { setIsActive(prev => !prev) } }}>
                Close
              </button>
              <button onClick={() => { setVolume((volume + 50) % 100) }}>
                <FontAwesomeIcon className={styles.volumeIcon} icon={volume > 0 ? faVolumeHigh : faVolumeXmark} />
              </button>
              <ThemeCategoryBtn themeId={isActive.id} setResponse={setResponse} themeCategory={themeCategory} />
            </div>
          </Draggable>
          {
            !isActive ?
              <div></div>
              :
              <div className={styles.youtubeWrapper}>
                <div className={isActive ? '' : styles.hidden}>
                  <YouTubePlayer
                    height={"100vh"}
                    width={"100vw"}
                    videoId={isActive.video_id}
                    volume={volume}
                    autoplay={1}
                  />
                </div>
              </div>
          }
        </div>
      </div>
    </div>
  );
}

export default ThemePreview;