import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./UserCamDisp.module.css";

function UserCamDisp({ socket, memberInfo }) {
  const [peer, setPeer] = useState(null);

  const videoRef = useRef(null);

  return (
    <div className={styles.UserCamDisp}>
      <video ref={videoRef} autoPlay playsInline className={`${styles.video}`} />
    </div>
  );
};

export default UserCamDisp;