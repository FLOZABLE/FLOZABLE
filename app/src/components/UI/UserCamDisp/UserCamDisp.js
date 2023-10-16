import React, { useEffect, useRef, useState } from "react";
import styles from "./UserCamDisp.module.css";
import SimplePeer from "simple-peer";

function UserCamDisp({isCam, isMic}) {
  const [peer, setPeer] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const newPeer = new SimplePeer({});

    newPeer.on("", () => {

    });
    
  }, [])
  useEffect(() => {
    if (isCam || isMic) {
      navigator.mediaDevices
        .getUserMedia({
          audio: isMic,
          video: isCam,
        })
        .then((stream) => {
          peer.addStream(stream);
        });
    };
  }, [isCam, isMic]);
  return (
    <div className={styles.UserCamDisp}>
      <video ref={videoRef} autoPlay playsInline />
    </div>
  );
};

export default UserCamDisp;