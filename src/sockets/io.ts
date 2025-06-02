import http from 'http';
import { Server as IOServer } from 'socket.io';

import config from '../config/config';

let io: IOServer | null = null;

export const initSocket = (server: http.Server) => {
  io = new IOServer(server, {
    cors: {
      origin: config.socketOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
    },
    allowEIO3: true,
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds
    connectTimeout: 45000, // Connection timeout
  });
};

export const getIO = () => {
  return io;
};
