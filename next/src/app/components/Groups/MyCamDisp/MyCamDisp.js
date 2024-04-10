import React, { useEffect, useRef, useState } from "react";
import styles from "./MyCamDisp.module.css";
import { mediaSocket } from "@/app/utils/mediaSocket";

const videoParams = {
  encodings: [
    {
      rid: "r0",
      maxBitrate: 100000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r1",
      maxBitrate: 300000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r2",
      maxBitrate: 900000,
      scalabilityMode: "S1T3",
    },
  ],
  codecOptions: {
    videoGoogleStartBitrate: 1000,
  },
};

const audioParams = {
  encodings: [{ maxBitrate: 900000 }],
};

function MyCamDisp({ videoStream }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoStream) return;
    videoRef.current.srcObject = videoStream;
  }, [videoStream]);
  
  return (
    <div className={styles.MyCamDisp}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`${styles.video}`}
      />
    </div>
  );
}

export default MyCamDisp;