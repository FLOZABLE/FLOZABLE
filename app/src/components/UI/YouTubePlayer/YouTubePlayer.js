import React, { useEffect, useState } from "react";
import YouTube from "react-youtube";
import styles from "./YouTubePlayer.module.css";

function YouTubePlayer({ height, width, videoId, volume }) {
  const [player, setPlayer] = useState(null);
  const [opts] = useState({
    height: "100%",
    width: "100%",
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
      player.seekTo(1);
    }
    if (event.data === window.YT.PlayerState.PLAYING) {
      // Video started (start button clicked)
      // You can add custom behavior here or leave it empty
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      player.seekTo(1);
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
    <div className={styles.YouTubePlayer} style={{ height, width }}>
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
        className={styles.video}
      />
    </div>
  );
}

export default YouTubePlayer;
