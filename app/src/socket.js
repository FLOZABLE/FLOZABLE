import { io } from 'socket.io-client';

const serverOrigin = process.env.REACT_APP_ORIGIN;
const socket = io.connect(process.env.REACT_APP_SERVER_ORIGIN, { autoConnect: false });

export { socket };