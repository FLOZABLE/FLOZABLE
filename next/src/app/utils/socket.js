import { io } from 'socket.io-client';
import config from './config';

const socket = io(config.server, { autoConnect: false, withCredentials: true });

export { socket };