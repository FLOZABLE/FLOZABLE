import React, { useEffect, useRef, useState } from "react";
import styles from "./UserCamDisp.module.css";
import SimplePeer from "simple-peer";

function UserCamDisp({isCam, isMic, stream, socket}) {
  const [peer, setPeer] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const newPeer = new SimplePeer({
      initiator: true,
    });

    newPeer.on("stream", (remoteStream) => {
      console.log("streamsdfsdf", remoteStream)
      videoRef.current.srcObject = remoteStream;
    });

    newPeer.on("signal", (offer) => {
      socket.emit("offer", {offer: offer});
    });

    newPeer.on("error", (err) => {
      console.log(err);
    })

    newPeer.on("track", (remoteStream) => {
      console.log("sdfs",remoteStream)
    })

    setPeer(newPeer);
  }, []);
  
  useEffect(() => {
    const onOffer = (offer, userId) => {
      console.log("ddddddd", offer, userId);
      if (peer) {
        peer.signal(offer);
      }
    };

    socket.on("offer", onOffer);

    return () => {
      socket.off("offer", onOffer);
    };
  }, []);

  useEffect(() => {
    if (stream && peer) {
      peer.addStream(stream);
      /* stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
        //console.log("track",track);
      }); */
    };
  }, [stream, peer]);

  return (
    <div className={styles.UserCamDisp}>
      <video ref={videoRef} autoPlay playsInline className={styles.video} />
    </div>
  );
};

export default UserCamDisp;