import React, { useEffect, useState } from "react";
import styles from "./MusicModal.module.css";
import VolumeControl from "../VolumeControl/VolumeControl";
import { Music } from "../../../utils/Music";
import AudioPlayer from "../AudioPlayer/AudioPlayer";
import { socket } from "../../../socket";

function MusicModal({ originalVideoVolume, setOriginalVideoVolume }) {

  const [audioVolumes, setAudioVolumes] = useState([]);
  const [audioChoices, setAudioChoices] = useState([])

  useEffect(() => {
    const tempAudioChoices = [...Music];

    setAudioChoices(tempAudioChoices);
  }, []);

  useEffect(() => {
    setAudioVolumes(new Array(audioChoices.length).fill[0]);
  }, [audioChoices]);

  const onMouseUp = () => {
    socket.emit("volumeChange", {id: "original", volume: originalVideoVolume});
  };

  useEffect(() => {
    const onVolumeChanged = ({id, volume}) => {
      if (id !== "original") {
        return;
      };
      console.log('changed', volume)
      setOriginalVideoVolume(volume);
    };

    socket.on("volumeChange", onVolumeChanged);

    return () => {
      socket.off("volumeChange", onVolumeChanged);
    };
  }, []);

  return (
    <div className={`${styles.YouTubeMusicModal} customScroll`}>
      <div className={styles.audioWrapper}>
        <div className={styles.audioDescription}>
          🔴
          <span className={styles.audioDescriptionName}>
            Original Video Audio
          </span>
        </div>
        <VolumeControl
          volume={originalVideoVolume}
          setVolume={setOriginalVideoVolume}
          backgroundImage={'https://as1.ftcdn.net/v2/jpg/00/92/53/56/1000_F_92535664_IvFsQeHjBzfE6sD4VHdO8u5OHUSc6yHF.jpg'}
          onMouseUp={onMouseUp}
        />
      </div>
      {audioChoices.map((audio, i) => {
        console.log(audio);
        return (
          <div className={styles.audioWrapper} key={i}>
          <div className={styles.audioDescription}>
            {audio.icon}
            <span className={styles.audioDescriptionName}>
              {audio.name}
            </span>
          </div>
          <AudioPlayer audio={audio} />
          {/* <YouTubeAudioPlayer height={"1vh"} width={"1vw"} videoId={audio.id} volume={audioVolumes ? audioVolumes[i] : 0} /> */}
        </div>
        )
      })}
    </div>
  );
}

export default MusicModal;
