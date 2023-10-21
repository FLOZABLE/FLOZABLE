import React, { useEffect, useRef } from "react";
import styles from "./MyCamDisp.module.css";

function MyCamDisp({ stream }) {
  const videoRef = useRef(null);
  
  useEffect(() => {
    videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className={styles.MyCamDisp}>
      <video ref={videoRef} autoPlay playsInline className={`${styles.video}`} />
    </div>
  );
};

export default MyCamDisp;