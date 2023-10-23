import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./UserCamDisp.module.css";

function UserCamDisp({ socket, memberInfo, offer, answer }) {
  const [peer, setPeer] = useState(null);

  const videoRef = useRef(null);

  useEffect(() => {
    console.log(offer ? offer.userId : '', memberInfo ? memberInfo.user_id : '')
    if (offer && offer.userId === memberInfo.user_id) {
      const newPeer = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.stunprotocol.org"
          }
        ]
      });
      console.log('offer',offer, memberInfo.name)
      newPeer.setRemoteDescription(offer.description);
      newPeer.createAnswer()
      .then((description) => {
        newPeer.setLocalDescription(description);
        socket.emit('answer', description, memberInfo.user_id);
      })

      newPeer.ontrack = (e) => {
        videoRef.current.srcObject = e.streams[0];
        console.log('streaming ot',)
        e.streams[0].getTracks().map(track => {
          console.log('ot track',track)
        })
      }
      setPeer(newPeer);
    }
  }, [offer]);

  /* useEffect(() => {

  }, [answer]); */

  /* useEffect(() => {
    const newPeer = new RTCPeerConnection();

  }, []); */
  /* const createPeer = () => {
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
    console.log('answerpeer', await peer)
    socket.emit('answer', payload, memberInfo.user_id);
  }

  const handleTrackEvent = (e) => {
    videoRef.current.srcObject = e.streams[0];
    console.log('streaming ot',)
    e.streams[0].getTracks().map(track => {
      console.log('ot track',track)
    })
  }; */

  /* useEffect(() => {
    if (offer && offer.userId === memberInfo.user_id) {
      const newPeer = createPeer();
      newPeer.addTransceiver("video", { direction: "recvonly" });
      setPeer(newPeer);
    }
  }, [offer]);

  useEffect(() => {
    if (answer && answer.payload && peer) {
      const desc = new RTCSessionDescription(answer.payload.sdp);
      peer.setRemoteDescription(desc).catch(e => console.log(e));
    }
  }, [answer]);
 */

  return (
    <div className={styles.UserCamDisp}>
      <video ref={videoRef} autoPlay playsInline className={`${styles.video}`} />
    </div>
  );
};

export default UserCamDisp;