import React, { useEffect, useRef, useState } from "react";
import styles from "./MemberCamDisp.module.css";
import { mediaSocket } from "../../../mediaSocket";

function MemberCamDisp({ memberInfo, device, isFocus, recvTransport }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [upd, setUpd] = useState(0);

  const connectRecvTransport = async () => {
    console.log('new producer')
    // for consumer, we need to tell the server first
    // to create a consumer based on the rtpCapabilities and consume
    // if the router can consume, it will send back a set of params as below
    const targetId = memberInfo.user_id;
    mediaSocket.emit('consume', {
      rtpCapabilities: device.rtpCapabilities,
      targetId
    }, async ({ params }) => {
      if (params.error) {
        console.log('Cannot Consume')
        return
      }
  
      // then consume with the local consumer transport
      // which creates a consumer
      const consumer = await recvTransport.consume({
        id: params.id,
        producerId: params.producerId,
        kind: params.kind,
        rtpParameters: params.rtpParameters,
      })
  
      // destructure and retrieve the video track from the producer
      const { track } = consumer
  
      const stream = new MediaStream([track]);
      /* stream.addTrack(track); */
      setStream(stream);
      // the server consumer started with media paused
      // so we need to inform the server to resume
      mediaSocket.emit('consumer-resume', {targetId});
    })
  };

  useEffect(() => {
    if (!memberInfo || !isFocus || !recvTransport || !device) return;
    const {user_id} = memberInfo;
    mediaSocket.on(`newProducer:${user_id}`, connectRecvTransport);

    return () => {
      mediaSocket.off(`newProducer:${user_id}`, connectRecvTransport);
    }
  }, [memberInfo, isFocus, recvTransport, device]);

  useEffect(() => {
    if (!stream) return;
    videoRef.current.srcObject = stream;
    setUpd(prev => prev +1)
  }, [stream]);
  
  return (
    <div className={styles.MemberCamDisp}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`${styles.video}`}
      />
      {upd}
    </div>
  );
}

export default MemberCamDisp;