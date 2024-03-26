import { io } from 'socket.io-client';
import config from './config';

const socket = io(config.server, { autoConnect: false });

export { socket };