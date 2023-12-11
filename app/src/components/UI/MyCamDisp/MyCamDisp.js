import React, { useEffect, useRef, useState } from "react";
import styles from "./MyCamDisp.module.css";
import { mediaSocket } from "../../../mediaSocket";
import { Device } from "mediasoup-client";

function MyCamDisp({ stream, isFocus }) {
  const videoRef = useRef(null);

  const [rtpCapabilities, setRtpCapabilities] = useState(false);
  const [device, setDevice] = useState(null);
  const [producerTransport, setProducerTransport] = useState(null);
  /**
 * Step 1: Retrieve the Router's RTP Capabilities.
 * This function requests the router's RTP capabilities from the server,
 * which are essential to configure the mediasoup Device.
 * The router's RTP capabilities describe the codecs and RTP parameters supported by the router.
 * This information is crucial for ensuring that the Device is compatible with the router.
 */
const getRouterRtpCapabilities = async () => {
  mediaSocket.emit("getRouterRtpCapabilities", (routerRtpCapabilities) => {
    setRtpCapabilities(routerRtpCapabilities);
    console.log(`getRouterRtpCapabilities:`, routerRtpCapabilities);
  });
};

/**
 * Step 2: Create and Initialize the mediasoup Device.
 * This function creates a new mediasoup Device instance and loads the router's RTP capabilities into it.
 * The Device is a client-side entity that provides an API for managing sending/receiving media with a mediasoup server.
 * Loading the router's RTP capabilities ensures that the Device is aware of the codecs and RTP parameters it needs to use
 * to successfully send and receive media with the server.
 *
 * If the Device is unable to load the router's RTP capabilities (e.g., due to an unsupported browser),
 * an error is logged to the console.
 */
const createDevice = async () => {
  try {
    const device = new Device();

    setDevice(device);
    console.log('new device', device)

    await device.load({ routerRtpCapabilities: rtpCapabilities });
  } catch (error) {
    console.log(error);
    if (error.name === "UnsupportedError") {
      console.error("Browser not supported");
    }
  }
};

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
      let transport = device.createSendTransport(params);
      console.log('transport',transport)

      // Update the state to hold the reference to the created transport
      setProducerTransport(transport);

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

const createProducerTransport = async() => {
  const data = await mediaSocket.emit('createProducerTransport', {
    forceTcp: false,
    rtpCapabilities: device.rtpCapabilities,
    sctpCapabilities: device.sctpCapabilities,
  });
  console.log('data', data)
  if (data.error) {
    console.error(data.error);
    return;
  }
}

  useEffect(() => {
    if (!stream || !isFocus) return;
    videoRef.current.srcObject = stream;
    getRouterRtpCapabilities();
    console.log(stream);
  }, [stream, isFocus]);

  useEffect(() => {
    if (!rtpCapabilities) return;
    createDevice();
  }, [rtpCapabilities]);

  useEffect(() => {
    if(!device) return;
    //createSendTransport();
    createProducerTransport();
  }, [device]);
  

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