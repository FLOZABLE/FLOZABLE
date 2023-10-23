import { io } from 'socket.io-client';

const mediaSocket = io(process.env.REACT_APP_MEDIASOCKET, { autoConnect: false });

export { mediaSocket };