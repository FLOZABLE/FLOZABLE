import { io } from 'socket.io-client';

const serverOrigin = process.env.REACT_APP_ORIGIN;
const socket = io(process.env.REACT_APP_SOCKET_ORIGIN, { autoConnect: false });

export { socket };