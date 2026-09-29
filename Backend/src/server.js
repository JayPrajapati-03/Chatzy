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

  // Auto-detect and write IP to Frontend/.env to fix mobile connection completely automatically
  const os = require('os');
  const fs = require('fs');
  const path = require('path');
  const networkInterfaces = os.networkInterfaces();
  let localIP = '127.0.0.1';
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal && !interfaceName.toLowerCase().includes('vmware') && !interfaceName.toLowerCase().includes('virtual')) {
        localIP = iface.address;
      }
    }
  }

  // Auto-update the Frontend .env file
  try {
    const envPath = path.join(__dirname, '../../Frontend/.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/EXPO_PUBLIC_API_URL=.*/g, `EXPO_PUBLIC_API_URL=http://${localIP}:${env.PORT}`);
    fs.writeFileSync(envPath, envContent);
    logger.info(`✅ Automatically updated Frontend/.env with IP: ${localIP}`);
  } catch (err) {
    logger.error('Could not auto-update Frontend/.env, please check paths.', err);
  }

  server.listen(env.PORT, () => {
    logger.info(`=========================================`);
    logger.info(` Chatzy Backend Server Running on Port: ${env.PORT}`);
    logger.info(` Environment: ${env.NODE_ENV}`);
    logger.info(` Local: http://localhost:${env.PORT}`);
    logger.info(` On Your Network: http://${localIP}:${env.PORT}`);
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
