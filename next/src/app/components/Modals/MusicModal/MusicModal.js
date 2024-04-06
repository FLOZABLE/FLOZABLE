import React, { useEffect, useState } from "react";
import styles from "./MusicModal.module.css";
import { socket } from "@/app/utils/socket";
import VolumeControl from "../../Study/VolumeControl/VolumeControl";
import AudioPlayer from "../../Study/AudioPlayer/AudioPlayer";

function MusicModal({ originalVideoVolume, setOriginalVideoVolume }) {
  const [audioVolumes, setAudioVolumes] = useState([]);
  const [musicFiles] = useState([
    { id: "p29JUpsOSTE", name: "Fire", icon: "🔥", audio: new Audio("../../audio/Fire.mp3") },
    { id: "HVau-JRGirg", name: "Forest", icon: "🌱", audio: new Audio("../../audio/Forest.mp3") },
    { id: "xDWG9SrB4io", name: "Rain", icon: "💧", audio: new Audio("../../audio/Rain.mp3") },
    { id: "SE9nDvo94hw", name: "Wave", icon: "🌊", audio: new Audio("../../audio/Wave.mp3") },
    { id: "WNcsUNKlAKw", name: "Wind", icon: "🍃", audio: new Audio("../../audio/Wind.mp3") },
  ])

  useEffect(() => {
    if (!!musicFiles) return;
    setAudioVolumes(new Array(musicFiles.length).fill[0]);
  }, [musicFiles]);

  const onMouseUp = () => {
    socket.emit("volumeChange", { id: "original", volume: originalVideoVolume });
  };

  useEffect(() => {
    const onVolumeChanged = ({ id, volume }) => {
      if (id !== "original") {
        return;
      };
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
      {musicFiles.map((audio, i) => {
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
