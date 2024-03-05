import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import VolumeControl from "../VolumeControl/VolumeControl";
import styles from "./AudioPlayer.module.css";
import { socket } from "../../../socket";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function AudioPlayer({ audio }) {
  const [volume, setVolume] = useState(0);
  const weblink = useLocation();

  useEffect(() => {
    if (!audio || (!volume && volume !== 0) || !audio.audio) return;
    try {
      if (volume > 0) audio.audio.play();
      audio.audio.volume = volume / 100;
      audio.audio.loop = true;
    } catch (err) {
      console.log(err);
    };
  }, [audio, volume]);

  const onMouseUp = () => {
    socket.emit("volumeChange", { id: audio.id, volume });
  };

  useEffect(() => {
    const onVolumeChanged = ({ id, volume }) => {
      if (id !== audio.id) {
        return;
      };
      setVolume(volume);
    };

    socket.on("volumeChange", onVolumeChanged);

    return () => {
      socket.off("volumeChange", onVolumeChanged);
    };
  }, []);

  return (
    <div className={styles.AudioPlayer}>
      <div className={styles.volumeWrapper}>
        <VolumeControl onMouseUp={onMouseUp} volume={volume} setVolume={setVolume} backgroundImage={`url(${serverOrigin}/img/${audio.name}.jpg)`} />
      </div>
    </div>
  )
};

export default AudioPlayer;