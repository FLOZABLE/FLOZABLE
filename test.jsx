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
        console.log('dddddddd')
        socket.emit("offer", offer);
      });

      return newPeer;
    }
    if (me) {
      setPeer(createPeer(true));
    } else {
      setPeer(createPeer(false));
    }
  }, []);

  useEffect(() => {
    if (offer && offer.userId === memberInfo.user_id) {
      console.log('eeeeeeee', offer.data);
      socket.emit("answer", offer.data);
    };
  }, [offer]);

  useEffect(() => {
    if (answer && answer.data && answer.userId === memberInfo.user_id) {
      console.log("sdfdddd", answer.userId, answer.data);
      peer.signal(answer.data);
    }
  }, [answer]);

  useEffect(() => {
    if (me && stream) {
      videoRef.current.srcObject = stream;
      stream.getTracks().forEach(track => {
        peer.addTrack(track, stream);
      });
      //peer.addStream(stream)
    } else if(stream && peer) {
      stream.getTracks().forEach(track => {
        peer.addTrack(track, stream);
      });
      //peer.addStream(stream)
    }
    console.log("sddddddddddddddddd", peer)
  }, [stream, peer]);

  return (
    <div className={styles.UserCamDisp}>
      <video ref={videoRef} autoPlay playsInline className={styles.video} />
    </div>
  );
};

export default UserCamDisp;