import React, { useEffect, useRef, useState } from "react";
import styles from "./UserCamDisp.module.css";
import SimplePeer from "simple-peer";

function UserCamDisp({isCam, isMic, stream, socket, me, memberInfo, offer, answer}) {
  const [peer, setPeer] = useState(null);
  const videoRef = useRef(null);

  /* useEffect(() => {
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
      //peer.addStream(stream);
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
        //console.log("track",track);
      });
    };
  }, [stream, peer]); */

  useEffect(() => {
    if (peer) {
      peer.destroy();
    };
    
    if (!me) {
      const newPeer = new SimplePeer({
        initiator: false
      });
  
      setPeer(newPeer);
    } else {
      const newPeer = new SimplePeer({
        initiator: true
      });
  
      newPeer.on("stream", (remoteStream) => {
        console.log("0000000000remote", remoteStream)
        videoRef.current.srcObject = remoteStream;
      });

      newPeer.on("signal", (offer) => {
        console.log("signal", offer)
        socket.emit("offer", offer);
      });
      
      newPeer.on("track", (track) => {
        console.log("track", track)
      })

/*       socket.on('answer', (data) => {
        if (data.sender === targetSocketId) {
          peer.signal(data.answer);
        }
      }); */
  
      setPeer(newPeer);
    }
  }, []);

  useEffect(() => {
    if (offer && offer.userId === memberInfo.user_id) {
      console.log('eeeeeeee', offer.data);
      socket.emit("answer", offer.data);
    };
  }, [offer]);

  useEffect(() => {
    if (answer && answer.data) {
      console.log("sdfdddd", answer.data);
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