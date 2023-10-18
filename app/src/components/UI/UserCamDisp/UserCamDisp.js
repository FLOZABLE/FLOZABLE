import React, { useEffect, useRef, useState } from "react";
import styles from "./UserCamDisp.module.css";
import SimplePeer from "simple-peer";

function UserCamDisp({isCam, isMic, stream, socket, me, memberInfo, offer, answer}) {
  const [peer, setPeer] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    function createPeer(isInitiator) {
      const newPeer = new SimplePeer({ initiator: isInitiator });

      newPeer.on("stream", (remoteStream) => {
        videoRef.current.srcObject = remoteStream;
      });

      newPeer.on("signal", (offer) => {
        socket.emit("offer", offer);
      });

      return newPeer;
    }

    if (me) {
      setPeer(createPeer(true));
    } else {
      setPeer(createPeer(false));
    };
  })

  return (
    <div className={styles.UserCamDisp}>
      <video ref={videoRef} autoPlay playsInline className={styles.video} />
    </div>
  );
};

export default UserCamDisp;