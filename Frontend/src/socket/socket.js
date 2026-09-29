import { io } from 'socket.io-client';
import { API_URL } from '../utils/constants';

let socket = null;

/**
 * Returns the singleton Socket.io client, creating it if needed.
 * Call connect() to actually open the connection.
 */
const getSocket = () => {
  if (!socket) {
    socket = io(API_URL, {
      // Do NOT autoConnect — we connect manually after login
      autoConnect: false,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });
  }
  return socket;
};

/**
 * Open the socket connection.
 */
export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

/**
 * Gracefully close the socket and destroy the singleton so a fresh
 * connection is created on the next login.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default getSocket;
