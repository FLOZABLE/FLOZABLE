import React, { useEffect, useState } from "react";
import YouTube from "react-youtube";
import styles from "./YouTubeAudioPlayer.module.css";
import VolumeControl from "../VolumeControl/VolumeControl";
//<YouTubeAudioPlayer height={"50%"} weight={"50%"} videoId={"nMfPqeZjc2c"} volume={tempVolume}/>
function YouTubeAudioPlayer({ height, width, videoId, autoplay = 1 }) {
  const [player, setPlayer] = useState(null);
  const [volume, setVolume] = useState(0);
  const [opts] = useState({
    playerVars: {
      loop: 1,
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      showinfo: 0,
      origin: window.origin,
      mute: 1,
      disablekb: 1,
      fs: 0,
      rel: 0,
      iv_load_policy: 3,
      playsinline: 1,
      enablejsapi: 0,
      crossOriginIsolated: true,
      autohide: 1,
      wmode: "opaque",
    },
  });

  const onReady = (event) => {
    setPlayer(event.target);
    event.target.setVolume(volume);
  };

  const onStateChange = (event) => {
    if (event.data === YouTube.PlayerState.ENDED) {
      player.seekTo(10);
    }
    if (event.data === window.YT.PlayerState.PLAYING) {
      // Video started (start button clicked)
      // You can add custom behavior here or leave it empty
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      player.seekTo(10);
      player.playVideo();
      // Video paused (stop button clicked)
      // You can add custom behavior here or leave it empty
    }
  };

  useEffect(() => {
    if (player) {
      player.setVolume(volume);
      if (volume === 0) {
        player.mute();
      } else {
        player.unMute();
      }
    }
  }, [volume]);

  return (
    <div className={styles.YouTubeAudioPlayer}>
      <div className={styles.volumeWrapper}>
        <VolumeControl volume={volume} setVolume={setVolume} />
      </div>
      <div className={styles.youTubeWrapper} style={{ height, width }}>
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
          className={styles.video}
        />
      </div>
    </div>
  );
}

export default YouTubeAudioPlayer;
