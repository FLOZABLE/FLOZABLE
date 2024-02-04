import React, { useEffect, useRef, useState } from "react";
import styles from "./MyCamDisp.module.css";
import { mediaSocket } from "../../../mediaSocket";

const videoParams = {
  encodings: [
    {
      rid: "r0",
      maxBitrate: 100000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r1",
      maxBitrate: 300000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r2",
      maxBitrate: 900000,
      scalabilityMode: "S1T3",
    },
  ],
  codecOptions: {
    videoGoogleStartBitrate: 1000,
  },
};

const audioParams = {
  encodings: [{ maxBitrate: 900000 }],
};

function MyCamDisp({ videoStream, audioStream,isFocus, device }) {
  const videoRef = useRef(null);
  const [producerTransport, setProducerTransport] = useState(null);
  /* const [params, setParams] = useState(null); */
/**
 * Step 3: Create a Transport for Sending Media.
 * This function initiates the creation of a transport on the server-side for sending media,
 * and then replicates the transport on the client-side using the parameters returned by the server.
 */
const createSendTransport = async () => {
  // Request the server to create a send transport
  mediaSocket.emit(
    "createTransport",
    { sender: true },
    async({ params }) => {
      if (params.error) {
        console.log(params.error);
        return;
      }

      /**
       * Replicate the send transport on the client-side.
       * The `device.createSendTransport` method creates a send transport instance on the client-side
       * using the parameters provided by the server.
       */
      const transport = await device.createSendTransport(params);
      // Update the state to hold the reference to the created transport
      /* setParams(params); */

      /**
         * Event handler for the "connect" event on the transport.
         * This event is triggered when the transport is ready to be connected.
         * The `dtlsParameters` are provided by the transport and are required to establish
         * the DTLS connection between the client and the server.
         * This event it emitted as a result of calling the `producerTransport?.produce(params)`
         * method in the next step. The event will only be emitted if this is the first time
         */
      await transport.on(
        "connect",
        async ({ dtlsParameters }, callback, errback) => {
          try {
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
      await transport.on(
        "produce",
        async (parameters, callback, errback) => {
          const { kind, rtpParameters, appData } = parameters;

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

      setProducerTransport(transport);
    }
  );
};

const transportProduce = async() => {
  const track = await videoStream.getVideoTracks()[0];
  const localProducer = await producerTransport.produce({track, ...videoParams});
  localProducer.on("trackended", () => { console.log("video track ended"); });
  localProducer.on("transportclose", () => { console.log("video transport ended"); });
  console.log('local video producer', localProducer)
}

const audioTransportProduce = async() => {
  const track = await audioStream.getAudioTracks()[0];
  const localProducer = await producerTransport.produce({track, ...audioParams});
  localProducer.on("trackended", () => { console.log("audio track ended"); });
  localProducer.on("transportclose", () => { console.log("audio transport ended"); });
  console.log('local audio producer', localProducer)
}

  useEffect(() => {
    if(!device || !isFocus) return;
    console.log('create send transport')
    createSendTransport();
    //createProducerTransport();
  }, [device, isFocus]);

  useEffect(() => {
    if (!videoStream || !isFocus) return;
    videoRef.current.srcObject = videoStream;
  }, [videoStream]);
  
  useEffect(() => {
    if (!producerTransport || !isFocus || !videoStream) return;
    transportProduce();
  }, [producerTransport, videoStream, isFocus]);

  useEffect(() => {
    if (!producerTransport || !isFocus || !audioStream) return;
    audioTransportProduce();
  }, [producerTransport, audioStream, isFocus]);

  return (
    <div className={styles.MyCamDisp}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`${styles.video}`}
      />
    </div>
  );
}

export default MyCamDisp;