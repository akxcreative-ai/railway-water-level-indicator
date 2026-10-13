import { io } from 'socket.io-client';

const SOCKET_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? '/'
  : 'https://railway-water-level-indicator.onrender.com';

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) return connectSocket();
  return socket;
};
