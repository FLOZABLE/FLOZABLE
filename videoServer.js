const mediaSoup = require('mediasoup');
const { io } = require('./socket');
const { userCache, activeGroupCache } = require("./services/redisLoader");
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
    rtcMinPort: 50000,
    rtcMaxPort: 55000,
    logLevel: 'warn',
    logTags: [
      'info',
      'ice',
      'dtls',
      'rtp',
      'srtp',
      'rtcp',
      'rtx',
      'bwe',
      'score',
      'simulcast',
      'svc'
    ]
  });

  worker.on("died", () => {
    console.error("mediasoup worker died (this should never happen)");
    process.exit(1);
  });

  return worker;
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
        user_id: 'EoFObpf612',
      };
    };
    const userId = session.user_id;

    socket.on("changeGroup", async(groupId) => {
      const userInfo = await userCache(userId);
      if (!userInfo) return;
      const {groups, friends} = userInfo;
  
      if (!groups.includes(groupId)) return;
      groups.map(group => {
        if (group !== groupId) {
          socket.leave(group);
        };
      });
      socket.join(groupId);
      activeGroup = groupId;
    })

    /**
     * Event handler for fetching router RTP capabilities.
     * RTP capabilities are required for configuring transports and producers/consumerTransports.
     * This function is called when a peer requests the router RTP capabilities.
     * The callback function is used to send the router RTP capabilities to the peer.
     */
    socket.on("getRouterRtpCapabilities", async (callback) => {
      try {
        if (!userId || !activeGroup) return;

        const router = await getRouter(activeGroup, worker);
        const rtpCapabilities = router.rtpCapabilities;
        console.log('SFU: sent router capabilities')
        // call callback from the client and send back the rtpCapabilities
        callback({ rtpCapabilities });
      } catch (err) {
        console.log(err);
      };
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
      try {
        if (!userId || !activeGroup) return;
        
        console.log('SFU: create transport', sender, userId)
        const router = await getRouter(activeGroup, worker);
        const { transport, params } = await createWebRtcTransport(router);
        if (sender) {
          //producerTransports[userId] = { transport, active: false };
          addProducerTransport(userId, transport);
        } else {
          addConsumerTransport(userId, transport);
        };
        callback({ params });
        console.log(Object.keys(consumerTransports), Object.keys(producerTransports))
      } catch (err) {
        console.log(err);
      };
    });

    socket.on('transport-connect', async ({ dtlsParameters }) => {
      try {
        if (!userId) return;

        const producerTransport = getProducerTransport(userId);

        if (!producerTransport) return;

        console.log('SFU: transport connect');
        const connection = await producerTransport.connect({ dtlsParameters });
      } catch (err) {
        console.log(err);
      }
    });

    socket.on('transport-recv-connect', async ({ dtlsParameters }) => {
      try {
        if (!userId) return;

        const consumerTransport = getConsumerTransport(userId);
        
        if (!consumerTransport) return;
        
        console.log('SFU: found consumer transport')
        const connection = await consumerTransport.connect({ dtlsParameters });
      } catch (err) {
        console.log(err);
      };
    });

    socket.on('transport-produce', async ({ kind, rtpParameters }, callback) => {
      try {
        if (!userId || !activeGroup) return;

        const producerTransport = getProducerTransport(userId);

        // Producer not found or already produced
        if (!producerTransport) return;

        console.log("SFU: transport produce", activeGroup);
        const producer = await producerTransport.produce({
          kind,
          rtpParameters,
        });

        addProducer(activeGroup, userId, producer, kind);

        producer.on('transportclose', () => {
          console.log('transportclose close');
          producer.close();
        });

        mediaSocket.to(activeGroup).emit(`newProducer:${userId}`, kind);

        // Send back to the client the Producer's id
        callback({ id: producer.id });
      } catch (err) {
        console.log(err);
      }
    });

    socket.on('consume', async ({ rtpCapabilities, targetId, kind }, callback) => {
      try {
        if (!userId || !activeGroup) return;

        console.log('SFU: consume start', kind);
        const producer = getProducer(activeGroup, targetId, kind);
        if (!producer) return;

        const router = await getRouter(activeGroup, worker);
        // check if the router can consume the specified producer
        const canConsume = router.canConsume({
          producerId: producer.id,
          rtpCapabilities
        });
        console.log("SFU: can consume", canConsume)
        if (canConsume) {
          // transport can now consume and return a consumer
          const consumerTransport = getConsumerTransport(userId);
          if (!consumerTransport) return;
          const consumer = await consumerTransport.consume({
            producerId: producer.id,
            rtpCapabilities,
            paused: true,
          });

          addConsumer(activeGroup, userId, targetId, consumer, kind);

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
          callback({ params })
        }
      } catch (err) {
        console.log(err.message)
        callback({
          params: {
            error: err
          }
        })
      }
    });

    socket.on('consumer-resume', async ({ targetId, kind }) => {
      try {
        if (!userId || !activeGroup) return;

        const consumer = getConsumer(activeGroup, userId, targetId, kind);
        if (!consumer) return;
        console.log('resume', consumer.id, kind)
        await consumer.resume();
      } catch (err) {
        console.log(err);
      };
    });

    socket.on('removeMyProducer', async ({ kind }) => {
      try {
        if (!userId || !activeGroup) return;

        removeProducer(activeGroup, userId, kind);
        socket.to(activeGroup).emit(`removeProducer:${userId}`, kind);
      } catch (err) {
        console.log(err);
      };
    });

    socket.on('disconnect', async () => {
      try {
        if (!userId || !activeGroup) return;

        socket.to(activeGroup).emit(`removeProducer:${userId}`);
        removeConsumer(activeGroup, userId);
        removeProducer(activeGroup, userId);
        const producerTransport = await getProducerTransport(userId);
        if (producerTransport) {
          producerTransport.close();
        };
        const consumerTransport = await getConsumerTransport(userId);
        if (consumerTransport) {
          consumerTransport.close();
        };
      } catch (err) {
        console.log(err);
      };
    })
  });


})();

const getRouter = async (roomId, worker) => {
  const room = rooms[roomId];
  if (!room) {
    rooms[roomId] = {};
  };
  //if there is no router for the room, create one
  if (!rooms[roomId].router) {
    rooms[roomId].router = await worker.createRouter({ mediaCodecs });
    return rooms[roomId].router;
  };
  return rooms[roomId].router;
};

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

const addProducer = async (roomId, userId, producer, kind) => {
  console.log(producer)
  if (!producers[roomId]) {
    producers[roomId] = {};
  };
  if (!producers[roomId][userId]) {
    producers[roomId][userId] = {};
  };
  if (kind === "audio") {
    producers[roomId][userId].audio = producer;
  } else {
    producers[roomId][userId].video = producer;
  };
  //producers[roomId][userId] = producer;
};

const removeProducer = async (roomId, userId, kind = false) => {
  try {
    if (!producers[roomId] || !producers[roomId][userId]) {
      return;
    };

    if (!kind) {
      //remove both;
      if (producers[roomId][userId].audio) {
        producers[roomId][userId].audio.close();
      }
      if (producers[roomId][userId].video) {
        producers[roomId][userId].video.close();
      };
      delete producers[roomId][userId];
      return;
    };

    if (kind === "audio") {
      if (producers[roomId][userId].audio) {
        producers[roomId][userId].audio.close();
      };
      delete producers[roomId][userId].audio;
    } else {
      if (producers[roomId][userId].video) {
        producers[roomId][userId].video.close();
      };
      delete producers[roomId][userId].video;
    };
  } catch (err) {
    console.log(err);
  }
}

const addConsumer = async (roomId, userId, targetId, consumer, kind) => {
  if (!consumers[roomId]) {
    consumers[roomId] = {};
  };
  if (!consumers[roomId][userId]) {
    consumers[roomId][userId] = {};
  };
  if (!consumers[roomId][userId][targetId]) {
    consumers[roomId][userId][targetId] = {};
  };
  if (kind === "audio") {
    consumers[roomId][userId][targetId].audio = consumer;
  } else {
    consumers[roomId][userId][targetId].video = consumer;
  };
  //consumers[roomId][userId][targetId] = consumer;
};

const removeConsumerTarget = async (roomId, userId, targetId) => {
  if (consumers[roomId] && consumers[roomId][userId] && consumers[roomId][userId][targetId]) {
    delete consumers[roomId][userId].targetId;
  }
}

const removeConsumer = async (roomId, userId) => {
  if (consumers[roomId] && consumers[roomId][userId]) {
    delete consumers[roomId][userId];
  }
}


const getProducer = (roomId, userId, kind) => {
  try {
    //not found
    if (!producers[roomId] || !producers[roomId][userId]) return false;

    const producer = producers[roomId][userId];
    if (kind === "audio") {
      return producer.audio;
    };
    return producer.video;
    /* const producer = producers[roomId][userId];
    return producer; */
  } catch (err) {
    console.log(err);
    return false;
  };
};

const getConsumer = (roomId, userId, targetId, kind) => {
  try {
    //not found
    if (!consumers[roomId] || !consumers[roomId][userId] || !consumers[roomId][userId][targetId]) return false;

    const consumer = consumers[roomId][userId][targetId];
    if (kind === "audio") {
      return consumer.audio;
    };
    return consumer.video;
    //return consumer;
  } catch (err) {
    console.log(err);
    return false;
  };
};

async function createWebRtcTransport(router) {

  const transport = await router.createWebRtcTransport({
    listenIps: [
      {
        ip: process.env.WEB_RTC_IP,
        announcedIp: process.env.WEB_RTC_ANNOUNCED_IP,
      }
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
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
};