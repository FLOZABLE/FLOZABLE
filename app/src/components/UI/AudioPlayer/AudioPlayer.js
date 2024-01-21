import { useEffect, useState } from "react";
import VolumeControl from "../VolumeControl/VolumeControl";
import styles from "./AudioPlayer.module.css";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function AudioPlayer({audio, name}) {
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
        <VolumeControl volume={volume} setVolume={setVolume} backgroundImage={`url(${serverOrigin}/img/${name}.jpg)`}/>
      </div>
    </div>
  )
};

export default AudioPlayer;