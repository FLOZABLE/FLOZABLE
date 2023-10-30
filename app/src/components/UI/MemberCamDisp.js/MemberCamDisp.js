import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./MemberCamDisp.module.css";

function MemberCamDisp({ track }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(new MediaStream());
  const [upd, setUpd] = useState(0);

  useEffect(() => {
    if (!track) return;
    videoRef.current.onerror = (event) => {
      console.error('Video playback error:', event);
    };
    track.enabled = true;
    stream.addTrack(track)
    console.log('other user track', track, stream)
    videoRef.current.srcObject = stream;
    console.log(stream.getTracks());
    setUpd(upd + 1);
  }, [track]);

  return (
    <div className={styles.MemberCamDisp}>
      <video ref={videoRef} autoPlay playsInline className={`${styles.video}`} />
      {upd}
    </div>
  );
};

export default MemberCamDisp;