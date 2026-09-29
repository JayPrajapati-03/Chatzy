const { Server } = require('socket.io');
const env = require('../config/env');
const logger = require('../utils/logger');
const { registerChatHandlers } = require('./chatHandler');

const initSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: env.CLIENT_ORIGIN === '*' ? true : env.CLIENT_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);
    registerChatHandlers(io, socket);
  });

  return io;
};

module.exports = initSocketIO;
