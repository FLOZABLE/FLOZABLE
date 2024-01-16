import { io } from 'socket.io-client';

const extensionSocket = io(`${process.env.REACT_APP_ORIGIN}/extension`, { autoConnect: false });

export { extensionSocket };