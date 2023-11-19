import React, { useEffect, useRef, useState } from "react";
import styles from "./MemberCamDisp.module.css";

const stream = new MediaStream();

function MemberCamDisp({ track }) {
  const videoRef = useRef(null);
  //const [stream, setStream] = useState(new MediaStream());
  const [upd, setUpd] = useState(0);

  useEffect(() => {
    if (!track) return;
    videoRef.current.onerror = (event) => {
      console.error("Video playback error:", event);
    };
    track.enabled = true;
    stream.addTrack(track);

    videoRef.current.srcObject = stream;

    setUpd(upd + 1);
  }, [track]);

  return (
    <div className={styles.MemberCamDisp}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`${styles.video}`}
      />
      {upd}
    </div>
  );
}

export default MemberCamDisp;