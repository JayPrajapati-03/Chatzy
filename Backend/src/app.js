const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const env = require('./config/env');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false // Allow inline scripts for demo test client
  })
);

// CORS configuration
app.use(
  cors({
    origin: env.CLIENT_ORIGIN === '*' ? true : env.CLIENT_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serve test client static assets
app.use('/test', express.static(path.join(__dirname, '../public')));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      nodeEnv: env.NODE_ENV
    },
    message: 'Chatzy API is healthy and operational'
  });
});

// Mount API routes
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      appName: 'Chatzy API',
      version: '1.0.0',
      docs: '/health',
      testClient: '/test/test-client.html'
    },
    message: 'Welcome to Chatzy Real-Time Chat API'
  });
});

// Middleware for 404 and global error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
