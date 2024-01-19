import React, { useEffect, useState } from "react";
import styles from "./YouTubeMusicModal.module.css";
import YouTubeAudioPlayer from "../YoutubeAudioPlayer/YoutTubeAudioPlayer";
import { YouTubeMusic } from "../../../utils/Music";
import VolumeControl from "../VolumeControl/VolumeControl";
//<YouTubeAudioPlayer height={"50%"} weight={"50%"} videoId={"nMfPqeZjc2c"} volume={tempVolume}/>
function YouTubeMusicModal({ originalVideoVolume, setOriginalVideoVolume }) {

  const [audioVolumes, setAudioVolumes] = useState([]);
  const [audioChoices, setAudioChoices] = useState([])

  useEffect(() => {
    const tempAudioChoices = [...YouTubeMusic];
    setAudioChoices(tempAudioChoices);
  }, []);

  useEffect(() => {
    setAudioVolumes(new Array(audioChoices.length).fill[0]);
  }, [audioChoices])

  console.log(YouTubeMusic);

  return (
    <div className={`${styles.YouTubeMusicModal}`}>
      <div className={styles.audioWrapper}>
        Original Video Audio
        <VolumeControl volume={originalVideoVolume} setVolume={setOriginalVideoVolume} />
      </div>
      {
        YouTubeMusic.map((audio, i) => {
          return (
            <div key={i} className={styles.audioWrapper}>
              <div className={styles.audioDescription}>
                🌱
                <span className={styles.audioDescriptionName}>
                  {audio.name}
                </span>
              </div>
              <YouTubeAudioPlayer height={"1vh"} width={"1vw"} videoId={audio.id} volume={audioVolumes ? audioVolumes[i] : 0} />
            </div>
          )
        })
      }
    </div>
  );
}

export default YouTubeMusicModal;
