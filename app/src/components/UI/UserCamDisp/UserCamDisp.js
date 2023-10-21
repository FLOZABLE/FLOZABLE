import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./UserCamDisp.module.css";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function UserCamDisp({ isCam, isMic, stream, socket, me, memberInfo, offer, answer }) {
  const [peer, setPeer] = useState(null);

  const videoRef = useRef(null);
  const createPeer = () => {
    const newPeer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org"
        }
      ]
    });
    newPeer.ontrack = handleTrackEvent;
    newPeer.onnegotiationneeded = () => handleNegotiationNeededEvent(newPeer);

    return newPeer;
  }

  const handleNegotiationNeededEvent = async (peer) => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
      sdp: peer.localDescription
    };

    socket.emit('answer', payload);
  }

  const handleTrackEvent = (e) => {
    videoRef.current.srcObject = e.streams[0];
    console.log('streaming ot',e.streams[0].getTracks().map(track => {
      console.log('ot track',track)
    }))
  };

  useEffect(() => {
    if (offer && me.user_id === offer.userId) {
      videoRef.current.srcObject = stream;
      return;
    }
    if (offer && offer.userId === memberInfo.user_id) {
      console.log('gd gd gd')
      const newPeer = createPeer();
      newPeer.addTransceiver("video", { direction: "recvonly" });
      setPeer(newPeer);
    }
  }, [offer]);

  useEffect(() => {
    if (answer && answer.payload && answer.payload.sdp && peer) {
      const desc = new RTCSessionDescription(answer.payload.sdp);
      peer.setRemoteDescription(desc).catch(e => console.log(e));
    }
  }, [answer]);


  return (
    <div className={styles.UserCamDisp}>
      <video ref={videoRef} autoPlay playsInline className={`${styles.video}`} />
    </div>
  );
};

export default UserCamDisp;