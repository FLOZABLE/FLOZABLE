import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./UserCamDisp.module.css";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function UserCamDisp({ isCam, isMic, stream, socket, me, memberInfo, offer, answer }) {
  const [peer, setPeer] = useState(null);
  const videoRef = useRef(null);

  const handleNegotiationNeededEvent = useCallback(async(newPeer) => {
    const offer = await newPeer.createOffer();
    await newPeer.setLocalDescription(offer);
    const payload = {
      sdp: newPeer.localDescription
    };
    socket.emit('answer', payload);
  }, [])

  const createnewPeer = useCallback(() => {
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
  }, []);

  const handleTrackEvent = useCallback((e) => {
    console.log("track", e.streams, videoRef.current)
    videoRef.current.srcObject = e.streams[0];
  }, [videoRef]);

  useEffect(() => {
    if (peer) {
      peer.addTransceiver("video", { direction: "recvonly" })
    }
  }, [peer]);

  useEffect(() => {
    if (offer && offer.userId === memberInfo.user_id) {
      setPeer(createnewPeer());
    }
  }, [offer]);

  useEffect(() => {
    if (answer && answer.data && answer.data.sdp && peer) {
      const desc = new RTCSessionDescription(answer.data.sdp);
      peer.setRemoteDescription(desc).catch(e => console.log(e));
    }
  }, [answer]);


  return (
    <div className={styles.UserCamDisp}>
      <video ref={videoRef} autoPlay playsInline className={styles.video} />
    </div>
  );
};

export default UserCamDisp;