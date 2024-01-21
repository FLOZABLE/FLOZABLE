import { useEffect, useState } from "react";
import VolumeControl from "../VolumeControl/VolumeControl";
import styles from "./AudioPlayer.module.css";

function AudioPlayer({audio}) {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (!audio || !volume) return;
    audio.play();
    audio.volume = volume / 100;
    audio.loop = true;
  }, [audio, volume]);

  return (
    <div className={styles.AudioPlayer}>
      <div className={styles.volumeWrapper}>
        <VolumeControl volume={volume} setVolume={setVolume} />
      </div>
    </div>
  )
};

export default AudioPlayer;