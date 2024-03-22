import { io } from 'socket.io-client';

const socket = io(process.env.SERVER, { autoConnect: false });

export { socket };