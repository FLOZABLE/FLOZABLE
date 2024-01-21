import React, { useEffect, useState, useRef } from "react";
import ReactAudioPlayer from 'react-audio-player';
import styles from "./YouTubeAudioPlayer.module.css";
import VolumeControl from "../VolumeControl/VolumeControl";
function YouTubeAudioPlayer({ audioPath}) {
  const [player, setPlayer] = useState(null);
  const [volume, setVolume] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const [opts] = useState({
    playerVars: {
      loop: 1,
    },
  });

  const audioRef = useRef(new Audio(audioPath))

  const onReady = (event) => {
    setPlayer(event.target);
    event.target.setVolume(volume);
  };

  useEffect(() => {
    if (volume <= 0 && !interacted) return;
    audioRef.current.volume = volume/100;
    if (!interacted){
      setInteracted(true);
      audioRef.current.play();
    }
  }, [volume]);

  return (
    <div className={styles.YouTubeAudioPlayer}>
      <div className={styles.volumeWrapper}>
        <VolumeControl volume={volume} setVolume={setVolume} />
      </div>
    </div>
  );
}

export default YouTubeAudioPlayer;
