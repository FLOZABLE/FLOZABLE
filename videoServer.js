const mediaSoup = require('mediasoup');
const { io } = require('./socket');
const { groupCache, userCache } = require("./services/redisLoader");
const { sessionMiddleWare } = require('./app');
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
  return { worker, router };
};

/**
 * {userId:{produce info}, }
 */
const rooms = {};
const producerTransports = {};
const consumerTransports = {};
const producers = {};
const consumers = {};

(async () => {
  const worker = await createWorker();
  const { router } = worker;
  mediaSocket.on('connection', async (socket) => {
    let session;
    let activeGroup;
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
    console.log('mediasocket', userId);
    socket.on("changeGroup", async (groupId) => {
      const userInfo = await userCache(userId);
      if (!userInfo) return;
      const groups = userInfo.groups === "" ? [] : userInfo.groups.split(",");
      if (!groups.includes(groupId)) return;
      groups.map(group => {
        if (group !== groupId) {
          socket.leave(group);
          delete rooms[userId];
        };
      });
      socket.join(groupId);
      console.log('changegroup')
      activeGroup = groupId;
    });

    /**
     * Event handler for fetching router RTP capabilities.
     * RTP capabilities are required for configuring transports and producers/consumerTransports.
     * This function is called when a peer requests the router RTP capabilities.
     * The callback function is used to send the router RTP capabilities to the peer.
     */
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
      const { transport, params } = await createWebRtcTransport(router);
      callback({ params });
      if (activeGroup) {
        if (sender) {
          //producerTransports[userId] = { transport, active: false };
          addProducerTransport(userId, transport);
        } else {
          addConsumerTransport(userId, transport);
        };
      };
    });

    socket.on('transport-connect', async ({ dtlsParameters }) => {
      if (!activeGroup) return;
      const producerTransport = getProducerTransport(userId);
      console.log('DTLS PARAMS... ', { dtlsParameters }, producerTransport.id)
      if (!producerTransport) return;
      const connection = await producerTransport.connect({ dtlsParameters });
    })

    socket.on('transport-recv-connect', async ({ dtlsParameters }) => {
      if (!activeGroup) return;
      const consumerTransport = getConsumerTransport(userId);
      console.log('DTLS PARAMS...  consumer', { dtlsParameters }, consumerTransport.id)
      if (!consumerTransport) return;
      const connection = await consumerTransport.connect({ dtlsParameters });
    })

    socket.on('transport-produce', async ({ kind, rtpParameters }, callback) => {
      // call produce based on the prameters from the client
      if (!activeGroup) return;
      const producerTransport = getProducerTransport(userId);

      //producer not found pr already produced
      if (!producerTransport) return;

      const producer = await producerTransport.produce({
        kind,
        rtpParameters,
      });

      addProducer(activeGroup, userId, producer);
      console.log('producer add', producer.id)
      producer.on('transportclose', () => {
        console.log('transport for this producer closed ')
        producer.close()
      });
      mediaSocket.to(activeGroup).emit(`newProducer:${userId}`);

      // Send back to the client the Producer's id
      callback({
        id: producer.id
      })
    })

    socket.on('consume', async ({ rtpCapabilities, targetId }, callback) => {
      console.log('consume -------------')
      try {
        // check if the router can consume the specified producer
        if (!activeGroup) return;
        const producer = getProducer(activeGroup, targetId);
        console.log('consume producer', producer.id, rtpCapabilities)
        if (!producer) return;
        console.log('producer can consume', router.canConsume({
          producerId: producer.id,
          rtpCapabilities
        }))
        if (router.canConsume({
          producerId: producer.id,
          rtpCapabilities
        })) {
          // transport can now consume and return a consumer
          const consumerTransport = getConsumerTransport(userId);
          console.log('consumer transport id',consumerTransport.id)
          if (!consumerTransport) return;
          const consumer = await consumerTransport.consume({
            producerId: producer.id,
            rtpCapabilities,
            paused: true,
          })
  
          consumer.on('transportclose', () => {
            console.log('transport close from consumer')
          })
  
          consumer.on('producerclose', () => {
            console.log('producer of consumer closed')
          })
  
          // from the consumer extract the following params
          // to send back to the Client
          const params = {
            id: consumer.id,
            producerId: producer.id,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
          }
  
          // send the parameters to the client
          console.log('consumed')
          callback({ params })
        }
      } catch (error) {
        console.log(error.message)
        callback({
          params: {
            error: error
          }
        })
      }
    });

    socket.on('consumer-resume', async () => {
      console.log('consumer resume');
      const consumer = getConsumer(activeGroup, userId);
      if (!consumer) return;
      console.log('resume', consumer.id)
      await consumer.resume()
    })
  });


})();

const addProducerTransport = async (userId, transport) => {
  producerTransports[userId] = { transport, active: false };
};

const addConsumerTransport = async (userId, transport) => {
  consumerTransports[userId] = transport;
};

const getProducerTransport = (userId, produce = false) => {
  try {
    const producerTransport = producerTransports[userId];
    if (!producerTransport) return;
    
    if (!produce || !producerTransport.active) return producerTransport.transport;
    producerTransport.active = true;
    return producerTransport.transport;
  } catch (err) {
    console.log(err);
    return false;
  };
};

const getConsumerTransport = (userId) => {
  try {
    const consumerTransport = consumerTransports[userId];
    return consumerTransport;
  } catch (err) {
    console.log(err);
    return false;
  };
};

const addProducer = async (roomId, userId, producer) => {
  if (producers[roomId]) {
    producers[roomId][userId] = producer;
  } else {
    producers[roomId] = {};
    producers[roomId][userId] = producer;
  }
  //console.log('add producer', producers)
};

const addConsumer = async (roomId, userId, consumer) => {
  if (consumers[roomId]) {
    consumers[roomId][userId] = consumer;
  } else {
    consumers[roomId] = {};
    consumers[roomId][userId] = consumer;
  }
};


const getProducer = (roomId, userId) => {
  try {
    //not found
    if (!producers[roomId] || !producers[roomId][userId]) return false;

    const producer = producers[roomId][userId];
    return producer;
  } catch (err) {
    console.log(err);
    return false;
  };
};

const getConsumer = (roomId, userId) => {
  try {
    //not found
    if (!consumers[roomId] || !consumers[roomId][userId]) return false;

    const consumer = consumers[roomId][userId];
    return consumer;
  } catch (err) {
    console.log(err);
    return false;
  };
};


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
