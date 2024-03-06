import React, { useEffect, useState } from "react";
import {useLocation} from 'react-router-dom';
import VolumeControl from "../VolumeControl/VolumeControl";
import styles from "./AudioStopper.module.css";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function AudioStopper({ musicFiles }) {

  const windowLocation = useLocation();

  useEffect(() => {
    if (!musicFiles) return;
    for (let i = 0; i < musicFiles.length; i++){
      musicFiles[i].audio.pause();
    }
  }, [musicFiles, windowLocation]);

  return (
    <div className={styles.AudioStopper} />
  )
};

export default AudioStopper;