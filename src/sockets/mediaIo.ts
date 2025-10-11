import * as cookie from 'cookie';
import * as mediasoup from 'mediasoup';
import { types as mediasoupTypes } from 'mediasoup';
import { Namespace } from 'socket.io';

import { getCachedUserGroups } from '../services/cacheService';
import { getUserIdByToken } from '../services/sessionService';
import { getIO } from './io';

const mediaCodecs: mediasoupTypes.RtpCodecCapability[] = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
    preferredPayloadType: 0,
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 1000,
    },
    preferredPayloadType: 0,
  },
];

const rooms: Record<string, { router?: mediasoupTypes.Router }> = {};
const producerTransports: Record<
  string,
  { transport: mediasoupTypes.WebRtcTransport; active: boolean }
> = {};
const consumerTransports: Record<string, mediasoupTypes.WebRtcTransport> = {};
const producers: Record<
  string,
  Record<
    string,
    { audio?: mediasoupTypes.Producer; video?: mediasoupTypes.Producer }
  >
> = {};
const consumers: Record<
  string,
  Record<
    string,
    Record<
      string,
      { audio?: mediasoupTypes.Consumer; video?: mediasoupTypes.Consumer }
    >
  >
> = {};

async function createWorker(): Promise<mediasoupTypes.Worker> {
  const worker = await mediasoup.createWorker({
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
      'svc',
    ],
  });

  worker.on('died', () => {
    console.error('mediasoup worker died (this should never happen)');
    process.exit(1);
  });

  return worker;
}

export async function getRouter(
  roomId: string,
  worker: mediasoupTypes.Worker,
): Promise<mediasoupTypes.Router> {
  if (!rooms[roomId]) rooms[roomId] = {};
  if (!rooms[roomId].router) {
    rooms[roomId].router = await worker.createRouter({ mediaCodecs });
  }
  return rooms[roomId].router!;
}

function addProducerTransport(
  userId: string,
  transport: mediasoupTypes.WebRtcTransport,
) {
  producerTransports[userId] = { transport, active: false };
}

function addConsumerTransport(
  userId: string,
  transport: mediasoupTypes.WebRtcTransport,
) {
  consumerTransports[userId] = transport;
}

function getProducerTransport(
  userId: string,
  produce = false,
): mediasoupTypes.WebRtcTransport | null {
  const producerTransport = producerTransports[userId];
  if (!producerTransport) return null;
  if (!produce || !producerTransport.active) return producerTransport.transport;
  producerTransport.active = true;
  return producerTransport.transport;
}

function getConsumerTransport(
  userId: string,
): mediasoupTypes.WebRtcTransport | null {
  return consumerTransports[userId] || null;
}

function addProducer(
  roomId: string,
  userId: string,
  producer: mediasoupTypes.Producer,
  kind: 'audio' | 'video',
) {
  if (!producers[roomId]) producers[roomId] = {};
  if (!producers[roomId][userId]) producers[roomId][userId] = {};
  producers[roomId][userId][kind] = producer;
}

function removeProducer(
  roomId: string,
  userId: string,
  kind?: 'audio' | 'video',
) {
  if (!producers[roomId]?.[userId]) return;
  if (!kind) {
    producers[roomId][userId].audio?.close();
    producers[roomId][userId].video?.close();
    delete producers[roomId][userId];
    return;
  }
  producers[roomId][userId][kind]?.close();
  delete producers[roomId][userId][kind];
}

function addConsumer(
  roomId: string,
  userId: string,
  targetId: string,
  consumer: mediasoupTypes.Consumer,
  kind: 'audio' | 'video',
) {
  if (!consumers[roomId]) consumers[roomId] = {};
  if (!consumers[roomId][userId]) consumers[roomId][userId] = {};
  if (!consumers[roomId][userId][targetId])
    consumers[roomId][userId][targetId] = {};
  consumers[roomId][userId][targetId][kind] = consumer;
}

function removeConsumer(roomId: string, userId: string) {
  if (consumers[roomId]?.[userId]) delete consumers[roomId][userId];
}

function getProducer(
  roomId: string,
  userId: string,
  kind: 'audio' | 'video',
): mediasoupTypes.Producer | null {
  return producers[roomId]?.[userId]?.[kind] || null;
}

function getRoomProducers(roomId: string):
  | {
      user_id: string;
      kind: any;
      audio?: mediasoupTypes.Producer;
      video?: mediasoupTypes.Producer;
    }[]
  | null {
  if (!producers[roomId]) return null;
  return Object.entries(producers[roomId]).map(([user_id, kind]) => ({
    user_id,
    kind,
    ...kind,
  }));
}

function getConsumer(
  roomId: string,
  userId: string,
  targetId: string,
  kind: 'audio' | 'video',
): mediasoupTypes.Consumer | null {
  return consumers[roomId]?.[userId]?.[targetId]?.[kind] || null;
}

async function createWebRtcTransport(router: mediasoupTypes.Router) {
  try {
    const transport = await router.createWebRtcTransport({
      listenIps: [
        {
          ip: process.env.WEB_RTC_IP!,
          announcedIp: process.env.WEB_RTC_ANNOUNCED_IP!,
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    transport.on('dtlsstatechange', (dtlsState: mediasoupTypes.DtlsState) => {
      if (dtlsState === 'closed') {
        console.log('Transport closed due to dtls change');
        transport.close();
      }
    });

    return {
      transport,
      params: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      },
      iceServers: [
        {
          urls: `turn:${process.env.WEB_RTC_ANNOUNCED_IP}:3478`,
          username: process.env.TURN_USERNAME!,
          credential: process.env.TURN_CREDENTIAL!,
        },
      ],
    };
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function onDisconnect(roomId: string, userId: string) {
  try {
    if (!roomId) return;
    const mediaIo = getMediaIoIo();
    mediaIo?.to(roomId).emit(`removeProducer:${userId}`);
    removeConsumer(roomId, userId);
    removeProducer(roomId, userId);

    getProducerTransport(userId)?.close();
    getConsumerTransport(userId)?.close();
  } catch (err) {
    console.log(err);
  }
}

let mediaIo: Namespace | null = null;

export const registerMediaIoIoEvents = async () => {
  const worker = await createWorker();

  const io = getIO();
  if (!io) {
    console.error('Socket.io server is not initialized yet!');
    return;
  }

  mediaIo = io.of('/media');

  mediaIo.on('connection', async (socket) => {
    try {
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) return;
      const parsedCookies = cookie.parse(cookies);
      if (!parsedCookies.token) return;
      const userId = await getUserIdByToken(parsedCookies.token);
      if (!userId) return;

      socket.join(userId);

      let activeGroup: string | null = null;

      console.log('media socket connected', userId);

      socket.on('group:change', async (groupId: string | null) => {
        try {
          const groups = await getCachedUserGroups({ userId });

          if (groupId === null) {
            groups.map((group) => {
              socket.leave(group);
            });
            return;
          }

          if (!groups.includes(groupId)) return;

          activeGroup = groupId;

          socket.join(groupId);
        } catch (err) {
          console.log(err);
        }
      });

      /**
       * Event handler for fetching router RTP capabilities.
       * RTP capabilities are required for configuring transports and producers/consumerTransports.
       * This function is called when a peer requests the router RTP capabilities.
       * The callback function is used to send the router RTP capabilities to the peer.
       */
      socket.on('getRouterRtpCapabilities', async (callback) => {
        try {
          console.log(activeGroup);
          if (!activeGroup) return;

          const router = await getRouter(activeGroup, worker);
          const rtpCapabilities = router.rtpCapabilities;
          console.log('SFU: sent router capabilities');
          // call callback from the client and send back the rtpCapabilities
          callback({ rtpCapabilities });
        } catch (err) {
          console.log(err);
        }
      });

      /**
       * Event handler for creating a transport.
       * A transport is required for sending or producing media.
       * The callback function is used to send the transport parameters to the peer.
       * @param {boolean} data.sender - Indicates whether the transport is for sending or receiving media.
       * @param {function} callback - A callback function to handle the result of the transport creation.
       */
      socket.on('createTransport', async ({ sender }, callback) => {
        // ... Creating sender/receiver transports ...
        try {
          if (!activeGroup) return;

          console.log('SFU: create transport', sender, userId);
          const router = await getRouter(activeGroup, worker);
          const webRtcTransport = await createWebRtcTransport(router);
          if (!webRtcTransport) return;
          const { transport, params } = webRtcTransport;

          if (sender) {
            //producerTransports[userId] = { transport, active: false };
            addProducerTransport(userId, transport);
          } else {
            addConsumerTransport(userId, transport);
          }
          callback({ params });
          console.log(
            Object.keys(consumerTransports),
            Object.keys(producerTransports),
          );
        } catch (err) {
          console.log(err);
        }
      });

      socket.on('transport-connect', async ({ dtlsParameters }) => {
        try {
          const producerTransport = getProducerTransport(userId);

          if (!producerTransport) return;

          console.log('SFU: transport connect');
          await producerTransport.connect({
            dtlsParameters,
          });
        } catch (err) {
          console.log(err);
        }
      });

      socket.on('transport-recv-connect', async ({ dtlsParameters }) => {
        try {
          const consumerTransport = getConsumerTransport(userId);

          if (!consumerTransport) return;

          console.log('SFU: found consumer transport');
          await consumerTransport.connect({
            dtlsParameters,
          });
        } catch (err) {
          console.log(err);
        }
      });

      socket.on(
        'transport-produce',
        async ({ kind, rtpParameters }, callback) => {
          try {
            if (!activeGroup) return;

            const producerTransport = getProducerTransport(userId);

            // Producer not found or already produced
            if (!producerTransport) return;

            console.log('SFU: transport produce', activeGroup);
            const producer = await producerTransport.produce({
              kind,
              rtpParameters,
            });

            addProducer(activeGroup, userId, producer, kind);

            producer.on('transportclose', () => {
              console.log('transportclose close');
              producer.close();
            });

            //mediaIo?.to(activeGroup).emit(`newProducer:${userId}`, kind.audio ? "audio" : "video");
            mediaIo?.to(activeGroup).emit(`newProducer:${userId}`, kind);

            // Send back to the client the Producer's id
            callback({ id: producer.id });
          } catch (err) {
            console.log(err);
          }
        },
      );

      socket.on(
        'consume',
        async ({ rtpCapabilities, targetId, kind }, callback) => {
          try {
            if (!activeGroup) return;

            console.log('SFU: consume start', kind);
            const producer = getProducer(activeGroup, targetId, kind);
            if (!producer) return;

            const router = await getRouter(activeGroup, worker);
            // check if the router can consume the specified producer
            const canConsume = router.canConsume({
              producerId: producer.id,
              rtpCapabilities,
            });
            console.log('SFU: can consume', canConsume);
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
                console.log('transport close from consumer');
              });

              consumer.on('producerclose', () => {
                console.log('producer of consumer closed');
              });

              // from the consumer extract the following params
              // to send back to the Client
              const params = {
                id: consumer.id,
                producerId: producer.id,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
              };

              // send the parameters to the client
              callback({ params });
            }
          } catch (err) {
            console.log(err);
            callback({
              params: {
                error: err,
              },
            });
          }
        },
      );

      socket.on('consumer-resume', async ({ targetId, kind }) => {
        try {
          if (!activeGroup) return;

          const consumer = getConsumer(activeGroup, userId, targetId, kind);
          if (!consumer) return;
          console.log('resume', consumer.id, kind);
          await consumer.resume();
        } catch (err) {
          console.log(err);
        }
      });

      socket.on('getRoomProducers', async () => {
        try {
          if (!activeGroup) return;

          const roomProducers = getRoomProducers(activeGroup);
          console.log('room producers:', roomProducers, activeGroup);
          if (!roomProducers) return;

          roomProducers.map((producer) => {
            mediaIo
              ?.to(userId)
              .emit(
                `newProducer:${producer.user_id}`,
                producer.kind.audio ? 'audio' : 'video',
              );
          });
        } catch (err) {
          console.log(err);
        }
      });

      socket.on('removeMyProducer', async ({ kind }) => {
        try {
          if (!activeGroup) return;

          removeProducer(activeGroup, userId, kind);
          mediaIo?.to(activeGroup).emit(`removeProducer:${userId}`, kind);
        } catch (err) {
          console.log(err);
        }
      });

      socket.on('disconnect', async () => {
        if (!activeGroup) return;
        onDisconnect(activeGroup, userId);
      });
    } catch (err) {
      console.log(err);
    }
  });
};

export const getMediaIoIo = () => mediaIo;
