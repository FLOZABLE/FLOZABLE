import { io } from 'socket.io-client';

const mediaSocket = io(process.env.NEXT_PUBLIC_MEDIA_SOCKET, { autoConnect: false });

export { mediaSocket };