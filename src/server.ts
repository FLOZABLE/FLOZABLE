import http from 'http';

import app from './app';
import config from './config/config';
import { initSocket } from './sockets/io';

import './schedulers/rankingScheduler';
import './schedulers/botScheduler';
import './sockets/index';

import { registerMainIoEvents } from './sockets/mainIo';
import { registerMediaIoIoEvents } from './sockets/mediaIo';

const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

// Initialize socket.io
initSocket(server);

registerMainIoEvents();
registerMediaIoIoEvents();
