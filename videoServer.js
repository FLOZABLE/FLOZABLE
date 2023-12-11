const mediaSoup = require('mediasoup');
const {io} = require('./socket');
const { groupCache } = require("./services/redisLoader");
const {sessionMiddleWare} = require('./app');
const mediaSocket = io.of('/mediaSocket');

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
mediaSocket.use(wrap(sessionMiddleWare));

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
];

async function createWorker() {
  const worker = await mediaSoup.createWorker({
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
  });

  worker.on("died", () => {
    console.error("mediasoup worker died (this should never happen)");
    process.exit(1);
  });

  const router = await worker.createRouter({ mediaCodecs });
  return {worker, router};
};

/**
 * {userId:{produce info}, }
 */
const producers = {};
const consumers = {};

(async() => {
  const worker = await createWorker();
  mediaSocket.on('connection', async (socket) => {
    let session;

    if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test") {
      try {
        session = socket.request.session;
      } catch (err) {
        console.log(err);
      };
    } else {
      session = {
        cookie: {
          path: '/',
          _expires: null,
          originalMaxAge: null,
          httpOnly: true,
          secure: false
        },
        user_id: 'EoFObpf612bdJKt',
        name: 't1',
        loggedin: true,
        userInfo: {
          userId: 'EoFObpf612bdJKt',
          name: 't1',
          loggedin: true,
          email: 't1@t.t',
          myinfo: null,
          timeZone: 'America/Los_Angeles'
        }
      };
    };
    const userId = session.user_id;
    console.log('mediasocket',userId)

    /**
     * Event handler for fetching router RTP capabilities.
     * RTP capabilities are required for configuring transports and producers/consumers.
     * This function is called when a peer requests the router RTP capabilities.
     * The callback function is used to send the router RTP capabilities to the peer.
     */
    const {router} = worker;
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
      const {transport, params} = await createWebRtcTransport(router);
      if (sender) {
        producers[userId] = transport;
        callback({ params });
      } else {
        consumers[userId] = transport;
      }
    });
  
    /* socket.on('createProducerTransport', async (callback) => {
      try {
        const { transport, params } = await createWebRtcTransport(router);
        //producerTransport = transport;
        callback(params);
      } catch (err) {
        console.error(err);
        callback({ error: err.message });
      }
    }); */
  });


})();

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
