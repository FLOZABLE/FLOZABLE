import React, { useEffect, useRef, useState } from "react";
import styles from "./MemberCamDisp.module.css";
import { mediaSocket } from "../../../mediaSocket";
import { IconCameraVideoFill, IconCameraVideoOffFill, IconMicFill, IconMicMuteFill } from "../../../utils/svgs";

function MemberCamDisp({ memberInfo, device, isFocus, recvTransport, isHeadphone }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [isAudio, setIsAudio] = useState(false);
  const [isVideo, setIsVideo] = useState(false);

  const connectRecvTransport = async (kind) => {
    console.log('new producer')
    // for consumer, we need to tell the server first
    // to create a consumer based on the rtpCapabilities and consume
    // if the router can consume, it will send back a set of params as below
    const targetId = memberInfo.user_id;
    mediaSocket.emit('consume', {
      rtpCapabilities: device.rtpCapabilities,
      targetId,
      kind
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
      if (track.kind === "video") {
        videoRef.current.srcObject = stream;
        setIsVideo(true);
        console.log('video')
      } else {
        setIsAudio(true);
        audioRef.current.srcObject = stream;
      }
      //videoRef.current.srcObject = stream;
      /* stream.addTrack(track); */
      // the server consumer started with media paused
      // so we need to inform the server to resume
      mediaSocket.emit('consumer-resume', { targetId, kind });
    })


    //audio
    /* 
        mediaSocket.emit('consume', {
          rtpCapabilities: device.rtpCapabilities,
          targetId,
          kind: 'audio'
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
          audioRef.current.srcObject = stream;
          audioRef.current.play();
          console.log('gd', stream, track)
          setStream(stream);
          // the server consumer started with media paused
          // so we need to inform the server to resume
          mediaSocket.emit('consumer-resume', { targetId, kind: 'audio' });
        }) */
  };

  useEffect(() => {
    if (!memberInfo || !isFocus || !recvTransport || !device) return;
    const { user_id } = memberInfo;
    mediaSocket.on(`newProducer:${user_id}`, connectRecvTransport);

    return () => {
      mediaSocket.off(`newProducer:${user_id}`, connectRecvTransport);
    }
  }, [memberInfo, isFocus, recvTransport, device]);

  useEffect(() => {
    if (!memberInfo || !isFocus) return;
    const { user_id } = memberInfo;

    const onRemoveProducer = (kind) => {
      if (kind === "audio") {
        audioRef.current.srcObject = null;
        setIsAudio(false);
      } else {
        videoRef.current.srcObject = null;
        setIsVideo(false);
      };
    };

    mediaSocket.on(`removeProducer:${user_id}`, onRemoveProducer);

    return () => {
      mediaSocket.off(`removeProducer:${user_id}`, onRemoveProducer);
    }
  }, [memberInfo, isFocus]);

  useEffect(() => {
    if (!audioRef || !audioRef.current) return;
    
    if (isHeadphone) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    };
  }, [isHeadphone]);

  return (
    <div className={styles.MemberCamDisp}>
      <div className={styles.icons}>
      <i style={{fontSize: '0.9375rem'}}>
      {isAudio ? <IconMicFill /> : <IconMicMuteFill />}
      </i>
      <i style={{fontSize: '0.9375rem'}}>
      {isVideo ? <IconCameraVideoFill /> : <IconCameraVideoOffFill />}
      </i>
      </div>
      <video
        muted={true}
        ref={videoRef}
        autoPlay
        playsInline
        className={`${styles.video}`}
      />
      <audio
        ref={audioRef}
      />
    </div>
  );
}

export default MemberCamDisp;