import React, { useEffect, useRef, useState } from "react";
import styles from "./AudioPlayer.module.css";
import SliderAnimation from "../../Inputs/SliderAnimation/SliderAnimation";

function AudioPlayer({ audioInfo }) {
  const [volume, setVolume] = useState(0);
  const audioRef = useRef();

  useEffect(() => {
    console.log("test");
    try {
      const audio = new Audio(audioInfo.source);
      audio.loop = true;

      audioRef.current = audio;
    } catch (err) {
      console.log(err);
    }

    return () => {
      //remove audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, [audioInfo]);

  useEffect(() => {
    if (!audioRef?.current) return;

    if (volume > 0) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }

    audioRef.current.volume = volume / 100;
  }, [volume]);

  return (
    <div className={styles.AudioPlayer}>
      <p>{audioInfo.id}</p>
      <SliderAnimation
        min={0}
        max={100}
        step={1}
        sliderValue={volume}
        setSliderValue={setVolume}
      />
    </div>
  );
}

export default AudioPlayer;
