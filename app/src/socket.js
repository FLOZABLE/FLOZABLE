import { io } from 'socket.io-client';

const serverOrigin = process.env.REACT_APP_ORIGIN;
const socket = io('http://localhost:3000', { autoConnect: false });

export { socket };