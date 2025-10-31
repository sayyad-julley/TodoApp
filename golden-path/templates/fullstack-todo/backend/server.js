const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// AWS X-Ray SDK
const AWSXRay = require('aws-xray-sdk-core');
const XRayExpress = require('aws-xray-sdk-express');
const http = require('http');
const https = require('https');

// Toggle X-Ray (enabled in production by default; opt-in via ENABLE_XRAY in dev)
const isDev = (process.env.NODE_ENV || 'development') === 'development';
const enableXRay = String(process.env.ENABLE_XRAY || '').toLowerCase() === 'true' || !isDev;

// Configure X-Ray daemon address and service name when enabled
if (enableXRay) {
  // Set daemon address for X-Ray trace collection
  process.env.AWS_XRAY_DAEMON_ADDRESS = process.env.AWS_XRAY_DAEMON_ADDRESS || 'localhost:2000';

  // Set dynamic service name
  const serviceName = process.env.SERVICE_NAME || 'todo-api';
  process.env.AWS_XRAY_TRACING_NAME = serviceName;

  // Enable debug logging if configured
  if (process.env.AWS_XRAY_DEBUG_MODE === '1') {
    console.log('X-Ray enabled with debug mode');
    console.log(`X-Ray daemon address: ${process.env.AWS_XRAY_DAEMON_ADDRESS}`);
    console.log(`X-Ray service name: ${serviceName}`);
  }

  // Capture outbound HTTP/S globally
  AWSXRay.captureHTTPsGlobal(http);
  AWSXRay.captureHTTPsGlobal(https);

  // Capture AWS SDK v2 (used in secrets-manager.js)
  AWSXRay.captureAWS(require('aws-sdk'));
} else {
  console.log('X-Ray disabled - set ENABLE_XRAY=true to enable tracing');
}

const { connectToDatabase } = require('./src/config/database');

const authRoutes = require('./src/routes/authRoutes');
const todoRoutes = require('./src/routes/todoRoutes');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const allowStartWithoutDb = String(process.env.START_WITHOUT_DB || '').toLowerCase() === 'true'
  || (process.env.NODE_ENV || 'development') === 'development';

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// X-Ray Express middleware for incoming request tracing
if (enableXRay) {
  app.use(XRayExpress.openSegment(process.env.SERVICE_NAME || 'todo-api'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Close X-Ray segment after all routes and error handling
if (enableXRay) {
  app.use(XRayExpress.closeSegment());
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

function startServerWithRetry(initialPort, maxRetries = 10) {
  return new Promise((resolve) => {
    let currentPort = Number(initialPort);
    let attempt = 0;
    const tryListen = () => {
      const server = app.listen(currentPort, '0.0.0.0', () => {
        console.log(`Server running on port ${currentPort}${allowStartWithoutDb ? ' (starting without waiting for DB)' : ''}`);
        resolve({ server, port: currentPort });
      });
      server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE' && attempt < maxRetries) {
          attempt += 1;
          currentPort += 1;
          console.warn(`Port in use, retrying on ${currentPort} (attempt ${attempt}/${maxRetries})`);
          setTimeout(tryListen, 200);
        } else {
          throw err;
        }
      });
    };
    tryListen();
  });
}

if (allowStartWithoutDb) {
  // Start server immediately; attempt DB connection in background
  startServerWithRetry(PORT);
  connectToDatabase().catch((err) => {
    console.error('Deferred MongoDB connection error:', err && err.message ? err.message : err);
  });
} else {
  connectToDatabase().then(() => {
    startServerWithRetry(PORT);
  });
}

module.exports = app;
