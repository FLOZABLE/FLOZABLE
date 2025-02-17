import React, { useEffect, useState } from "react";
import styles from "./YouTubePlayer.module.css";
import ReactPlayer from "react-player";

function YouTubePlayer({ height, width, videoId, volume }) {
  return (
    <div className={styles.YouTubePlayer} style={{ height, width }}>
      {videoId ? (
        <ReactPlayer
          url={`https://www.youtube.com/watch?v=${videoId}`}
          loop={true}
          className={styles.video}
          volume={volume}
          controls={0}
          playing={true}
          config={{ youtube: { playerVars: {} } }}
        />
      ) : null}
    </div>
  );
}

export default YouTubePlayer;
