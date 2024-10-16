import React, { useEffect, useRef, useState } from "react";
import styles from "./MyCamDisp.module.css";

function MyCamDisp({ videoStream }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoStream) {
      videoRef.current.srcObject = null;
    }
    videoRef.current.srcObject = videoStream;
  }, [videoStream]);

  return (
    <div className={styles.MyCamDisp}>
      <video
        muted={true}
        ref={videoRef}
        autoPlay
        playsInline
        className={`${styles.video}`}
      />
    </div>
  );
}

export default MyCamDisp;
