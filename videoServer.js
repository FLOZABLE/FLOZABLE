const {createWorker} = require('mediasoup');
const {io} = require('./socket');
const { groupCache } = require("./services/redisLoader");
const {sessionMiddleWare} = require('./app');
const mediaSocket = io.of('/mediaSocket');

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
mediaSocket.use(wrap(sessionMiddleWare));

let worker1 = (async() => {
  worker1 = await createWorker({
    rtcMinPort: 10000,
    rtcMaxPort: 10100,
    logLevel: 'warn',
    logTags: [
      'info',
      'ice',
      'dtls',
      'rtp',
      'srtp',
      'rtcp'
      // 'rtx',
      // 'bwe',
      // 'score',
      // 'simulcast',
      // 'svc'
    ]
  })
  console.log(`worker pid ${worker1.pid}`)

  worker1.on('died', error => {
    // This implies something serious happened, so kill the application
    console.error('mediasoup worker has died')
    setTimeout(() => process.exit(1), 2000) // exit in 2 seconds
  });

  return worker1
})();

let worker2 = (async() => {
  worker2 = await createWorker({
    rtcMinPort: 10000,
    rtcMaxPort: 10100,
    logLevel: 'warn',
    logTags: [
      'info',
      'ice',
      'dtls',
      'rtp',
      'srtp',
      'rtcp'
      // 'rtx',
      // 'bwe',
      // 'score',
      // 'simulcast',
      // 'svc'
    ]
  })
  console.log(`worker pid ${worker2.pid}`)

  worker2.on('died', error => {
    // This implies something serious happened, so kill the application
    console.error('mediasoup worker has died')
    setTimeout(() => process.exit(1), 2000) // exit in 2 seconds
  });

  return worker2
})();

// This is an Array of RtpCapabilities
// https://mediasoup.org/documentation/v3/mediasoup/rtp-parameters-and-capabilities/#RtpCodecCapability
// list of media codecs supported by mediasoup ...
// https://github.com/versatica/mediasoup/blob/v3/src/supportedRtpCapabilities.ts
const mediaCodecs = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 1000,
    },
  },
]

mediaSocket.on('connection', async (socket) => {
  const router = await worker1.createRouter({mediaCodecs});
  /**
   * Event handler for fetching router RTP capabilities.
   * RTP capabilities are required for configuring transports and producers/consumers.
   * This function is called when a peer requests the router RTP capabilities.
   * The callback function is used to send the router RTP capabilities to the peer.
   */
  let producer = null;
  let consumer = null;
  socket.on("getRouterRtpCapabilities", (callback) => {

    const rtpCapabilities = router.rtpCapabilities

    // call callback from the client and send back the rtpCapabilities
    callback({ rtpCapabilities })
  });

  /**
   * Event handler for creating a transport.
   * A transport is required for sending or producing media.
   * The callback function is used to send the transport parameters to the peer.
   * @param {boolean} data.sender - Indicates whether the transport is for sending or receiving media.
   * @param {function} callback - A callback function to handle the result of the transport creation.
   */
  socket.on("createTransport", async ({ sender }, callback) => {
    // ... Creating sender/receiver transports ...
    if (sender) {
      const params = await handleWebrtcRecvStart(router);
      callback({ params });
    } else {
      consumer = await handleWebrtcRecvStart(router);
    }
  });

  socket.on('createProducerTransport', async (callback) => {
    try {
      const { transport, params } = await createWebRtcTransport(router);
      //producerTransport = transport;
      addTransport(transport, roomName, false, socket.id, false)
      callback(params);
    } catch (err) {
      console.error(err);
      callback({ error: err.message });
    }
  });
});

/* 


const createWebRtcTransport = async (callback) => {
  try {
    // https://mediasoup.org/documentation/v3/mediasoup/api/#WebRtcTransportOptions
    const webRtcTransport_options = {
      listenIps: [
        {
          ip: '0.0.0.0', // replace with relevant IP address
          announcedIp: '127.0.0.1',
        }
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    }

    // https://mediasoup.org/documentation/v3/mediasoup/api/#router-createWebRtcTransport
    let transport = await router.createWebRtcTransport(webRtcTransport_options)
    console.log(`transport id: ${transport.id}`)

    transport.on('dtlsstatechange', dtlsState => {
      if (dtlsState === 'closed') {
        transport.close()
      }
    })

    transport.on('close', () => {
      console.log('transport closed')
    })

    // send back to the client the following prameters
    callback({
      // https://mediasoup.org/documentation/v3/mediasoup-client/api/#TransportOptions
      params: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      }
    })

    return transport

  } catch (error) {
    console.log(error)
    callback({
      params: {
        error: error
      }
    })
  }
}
*/

async function createWebRtcTransport(router) {

  const transport = await router.createWebRtcTransport({
    listenIps: [
      {
        ip: '0.0.0.0', // replace with relevant IP address
        announcedIp: '127.0.0.1',
      }
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    enableFp: true,
  });
  transport.on('dtlsstatechange', dtlsState => {
    if (dtlsState === 'closed') {
      console.log("Transport closed due to dtls change")
      transport.close()
    }
  })

  if (maxIncomingBitrate) {
    try {
      await transport.setMaxIncomingBitrate(maxIncomingBitrate);
    } catch (error) {
    }
  }
  return {
    transport,
    params: {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
      sctpParameters: transport.sctpParameters,
    },
  };
}

async function handleWebrtcRecvStart(router) {
  const transport = await router.createWebRtcTransport(
    {
      listenIps: [
        {
          ip: '0.0.0.0', // replace with relevant IP address
          announcedIp: '127.0.0.1',
        }
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    }
  );

  console.log("mediasoup WebRTC RECV transport created");

  const webrtcTransportOptions = {
    id: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters,
    sctpParameters: transport.sctpParameters
  };

  // Uncomment for debug
  // console.log("webrtcTransportOptions: %s", JSON.stringify(webrtcTransportOptions, null, 2));

  return webrtcTransportOptions;
}
