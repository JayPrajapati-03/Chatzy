const http = require('http');
const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const initSocketIO = require('./sockets');
const logger = require('./utils/logger');

// Create HTTP server instance
const server = http.createServer(app);

// Initialize Socket.io and attach to Express app for controller access
const io = initSocketIO(server);
app.set('io', io);

// Start server
const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  server.listen(env.PORT, () => {
    logger.info(`=========================================`);
    logger.info(` Chatzy Backend Server Running on Port: ${env.PORT}`);
    logger.info(` Environment: ${env.NODE_ENV}`);
    logger.info(` Health check: http://localhost:${env.PORT}/health`);
    logger.info(` Test Client: http://localhost:${env.PORT}/test/test-client.html`);
    logger.info(`=========================================`);
  });
};

// Graceful shutdown handling
const handleShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP & Socket.io server closed.');
    process.exit(0);
  });

  // Force close if graceful timeout exceeded
  setTimeout(() => {
    logger.error('Forcing shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

startServer();
