import React, { useEffect, useState } from "react";
import styles from "./FullScreenBtn.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownLeftAndUpRightToCenter, faUpRightAndDownLeftFromCenter } from "@fortawesome/free-solid-svg-icons";

function FullScreenBtn(props) {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      props.setFullScreen(true);
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      props.setFullScreen(false);
      document.exitFullscreen().catch((err) => {
        console.error('Exit fullscreen request failed:', err);
      });
    }
  };
  
  return (
    <div className={styles.fullScreenBtn} onClick={toggleFullscreen}>
      {props.fullScreen ? <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} /> : <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />}
    </div>
  );
};

export default FullScreenBtn;