const {createWorker} = require('mediasoup');
const {io} = require('./socket');
const { groupCache } = require("./services/redisLoader");
const os = require("os");
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
]

async function startMediasoup() {
  const workers = [];
  for (let i = 0; i < Object.keys(os.cpus()).length; i++) {
    let worker = await createWorker({
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

    workers.push({ worker, router });
  }

  return workers;
};

(async() => {
  const workers = await startMediasoup();
  console.log(workers)
})();

startMediasoup();