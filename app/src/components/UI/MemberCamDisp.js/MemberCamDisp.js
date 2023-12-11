import React, { useEffect, useRef, useState } from "react";
import styles from "./MemberCamDisp.module.css";
import { mediaSocket } from "../../../mediaSocket";

function MemberCamDisp({ memberInfo, device, isFocus }) {
  const videoRef = useRef(null);

  const createRecvTransport = async () => {
    // Request the server to create a send transport
    mediaSocket.emit(
      "createTransport",
      { sender: false },
      ({ params }) => {
        if (params.error) {
          console.log(params.error);
          return;
        }
  
        /**
         * Replicate the send transport on the client-side.
         * The `device.createSendTransport` method creates a send transport instance on the client-side
         * using the parameters provided by the server.
         */
        console.log('gd', params)
        let transport = device.createSendTransport(params);
        console.log('transport',transport)
  
        // Update the state to hold the reference to the created transport
        /* setProducerTransport(transport); */
  
        /**
           * Event handler for the "connect" event on the transport.
           * This event is triggered when the transport is ready to be connected.
           * The `dtlsParameters` are provided by the transport and are required to establish
           * the DTLS connection between the client and the server.
           * This event it emitted as a result of calling the `producerTransport?.produce(params)`
           * method in the next step. The event will only be emitted if this is the first time
           */
        transport.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            try {
              console.log("----------> producer transport has connected");
              // Notify the server that the transport is ready to connect with the provided DTLS parameters
              await mediaSocket.emit("transport-connect", { dtlsParameters });
              // Callback to indicate success
              callback();
            } catch (error) {
              // Errback to indicate failure
              errback(error);
            }
          }
        );
  
        /**
           * Event handler for the "produce" event on the transport.
           * This event is triggered when the transport is ready to start producing media.
           * The `parameters` object contains the necessary information for producing media,
           * including the kind of media (audio or video) and the RTP parameters.
           * The event is emitted as a result of calling the `producerTransport?.produce(params)`
           * method in the next step.
           */
        transport.on(
          "produce",
          async (parameters, callback, errback) => {
            const { kind, rtpParameters } = parameters;
  
            console.log("----------> transport-produce");
  
            try {
              // Notify the server to start producing media with the provided parameters
              mediaSocket.emit(
                "transport-produce",
                { kind, rtpParameters },
                ({ id }) => {
                  // Callback to provide the server-generated producer ID back to the transport
                  callback({ id });
                }
              );
            } catch (error) {
              // Errback to indicate failure
              errback(error);
            }
          }
        );
      }
    );
  };

  useEffect(() => {
    if (!memberInfo || !isFocus) return;
    const {user_id} = memberInfo;
    mediaSocket.on(`producing:${user_id}`, (params) => {
      console.log(params);
      
    });
  }, [memberInfo, isFocus]);

  return (
    <div className={styles.MemberCamDisp}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`${styles.video}`}
      />
    </div>
  );
}

export default MemberCamDisp;