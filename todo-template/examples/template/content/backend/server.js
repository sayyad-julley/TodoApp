const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
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
  try {
    // Set dynamic service name
    const serviceName = process.env.SERVICE_NAME || 'todo-api';
    process.env.AWS_XRAY_TRACING_NAME = serviceName;

    // Set daemon address for X-Ray trace collection
    // In AWS ECS/Lambda, the SDK auto-detects the daemon address
    // Only set localhost for local development if not already configured
    if (!process.env.AWS_XRAY_DAEMON_ADDRESS && isDev) {
      process.env.AWS_XRAY_DAEMON_ADDRESS = 'localhost:2000';
    }

    // Enable debug logging if configured
    if (process.env.AWS_XRAY_DEBUG_MODE === '1') {
      console.log('X-Ray enabled with debug mode');
      console.log(`X-Ray daemon address: ${process.env.AWS_XRAY_DAEMON_ADDRESS || 'auto-detect (AWS environment)'}`);
      console.log(`X-Ray service name: ${serviceName}`);
    }

    // CRITICAL: Initialize X-Ray SDK - required for traces to be sent
    // Without this call, the SDK cannot establish connection to daemon or send traces
    AWSXRay.init();

    // Capture outbound HTTP/S globally
    AWSXRay.captureHTTPsGlobal(http);
    AWSXRay.captureHTTPsGlobal(https);

    // Capture AWS SDK v2 (used in secrets-manager.js)
    AWSXRay.captureAWS(require('aws-sdk'));

    console.log(`✅ AWS X-Ray configured successfully`);
    console.log(`   Service: ${serviceName}`);
    console.log(`   Daemon: ${process.env.AWS_XRAY_DAEMON_ADDRESS || 'auto-detect (AWS environment)'}`);
    console.log(`   Mode: Automatic (initialized explicitly)`);
  } catch (error) {
    console.error('❌ Failed to initialize AWS X-Ray:', error.message);
    console.error('   X-Ray tracing will be disabled. Traces will not be sent.');
    console.error('   Check that X-Ray daemon is running and IAM permissions are correct.');
  }
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
  origin: process.env.FRONTEND_URL || 'http://localhost:5143',
  credentials: true
}));

// X-Ray Express middleware for incoming request tracing
// IMPORTANT: Place early in middleware chain to capture all requests
if (enableXRay) {
  app.use(XRayExpress.openSegment(process.env.SERVICE_NAME || 'todo-api'));
  
  // Middleware to enhance trace context and propagate to frontend
  app.use((req, res, next) => {
    try {
      const segment = AWSXRay.getSegment();
      
      if (segment) {
        // Add metadata about incoming request source
        if (req.headers['x-trace-service']) {
          segment.addAnnotation('upstream_service', req.headers['x-trace-service']);
        }
        if (req.headers['x-trace-origin']) {
          segment.addAnnotation('trace_origin', req.headers['x-trace-origin']);
        }
        
        // Add custom metadata
        segment.addMetadata('request', {
          method: req.method,
          path: req.path,
          userAgent: req.headers['user-agent']
        });
        
        // Enhanced debug logging
        if (process.env.AWS_XRAY_DEBUG_MODE === '1') {
          console.log(`🔍 X-Ray segment created for ${req.method} ${req.path}`);
          console.log(`   Segment ID: ${segment.id}`);
          console.log(`   Trace ID: ${segment.trace_id}`);
          
          res.on('finish', () => {
            try {
              const traceHeader = res.getHeader('X-Amzn-Trace-Id');
              if (traceHeader) {
                console.log('📤 X-Ray trace header in response:', traceHeader);
              } else {
                console.warn('⚠️  No X-Amzn-Trace-Id header in response');
              }
              
              // Log segment status
              if (segment.isClosed()) {
                console.log('✅ Segment closed successfully');
              } else {
                console.warn('⚠️  Segment not closed after response');
              }
            } catch (err) {
              console.error('❌ Error in X-Ray response handler:', err.message);
            }
          });
        }
      } else {
        if (process.env.AWS_XRAY_DEBUG_MODE === '1') {
          console.warn(`⚠️  No X-Ray segment available for ${req.method} ${req.path}`);
        }
      }
    } catch (error) {
      // Log error but don't break the request
      if (process.env.AWS_XRAY_DEBUG_MODE === '1') {
        console.error('❌ X-Ray segment access error:', error.message);
      }
    }
    
    next();
  });
}

// Rate limiting (after X-Ray to ensure traces include rate limit info)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

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

// X-Ray diagnostics endpoint (for troubleshooting)
app.get('/health/xray', (req, res) => {
  if (!enableXRay) {
    return res.json({
      xrayEnabled: false,
      message: 'X-Ray is disabled. Set ENABLE_XRAY=true to enable.'
    });
  }

  try {
    const segment = AWSXRay.getSegment();
    const xrayInfo = {
      xrayEnabled: true,
      serviceName: process.env.SERVICE_NAME || 'todo-api',
      daemonAddress: process.env.AWS_XRAY_DAEMON_ADDRESS || 'auto-detect (AWS environment)',
      tracingName: process.env.AWS_XRAY_TRACING_NAME,
      hasActiveSegment: !!segment,
      segmentId: segment ? segment.id : null,
      traceId: segment ? segment.trace_id : null,
      mode: AWSXRay.isAutomaticMode() ? 'automatic' : 'manual',
      timestamp: new Date().toISOString()
    };
    res.json(xrayInfo);
  } catch (error) {
    res.status(500).json({
      xrayEnabled: true,
      error: error.message,
      stack: process.env.AWS_XRAY_DEBUG_MODE === '1' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// X-Ray daemon connectivity test
app.get('/test/xray/daemon', async (req, res) => {
  if (!enableXRay) {
    return res.status(400).json({
      error: 'X-Ray is disabled',
      message: 'Set ENABLE_XRAY=true to enable tracing'
    });
  }

  const daemonAddress = process.env.AWS_XRAY_DAEMON_ADDRESS || 'localhost:2000';
  const [host, port] = daemonAddress.split(':');
  
  const dgram = require('dgram');
  const client = dgram.createSocket('udp4');
  
  // Test UDP connectivity to daemon
  const testMessage = Buffer.from('test');
  
  client.on('error', (err) => {
    client.close();
    res.status(500).json({
      error: 'Daemon connectivity test failed',
      message: err.message,
      daemonAddress: daemonAddress,
      host: host,
      port: port
    });
  });

  client.send(testMessage, parseInt(port), host, (err) => {
    client.close();
    if (err) {
      res.status(500).json({
        error: 'Failed to send test to daemon',
        message: err.message,
        daemonAddress: daemonAddress,
        troubleshooting: [
          'Check if X-Ray daemon is running',
          'Verify daemon address is correct',
          'Check network connectivity',
          'For Docker: Ensure xray-daemon service is running',
          'For local: Run ./setup-xray.sh or docker run -d -p 2000:2000 amazon/aws-xray-daemon'
        ]
      });
    } else {
      res.json({
        success: true,
        message: 'Daemon appears reachable',
        daemonAddress: daemonAddress,
        host: host,
        port: port,
        note: 'UDP connectivity test completed (daemon may not respond to test messages)'
      });
    }
  });
});

// X-Ray test endpoint - forces segment creation and provides detailed diagnostics
app.get('/test/xray', (req, res) => {
  if (!enableXRay) {
    return res.status(400).json({
      error: 'X-Ray is disabled',
      message: 'Set ENABLE_XRAY=true to enable tracing'
    });
  }

  try {
    const segment = AWSXRay.getSegment();
    
    if (!segment) {
      return res.status(500).json({
        error: 'No active segment',
        message: 'X-Ray middleware may not be properly configured',
        diagnostics: {
          xrayEnabled: enableXRay,
          serviceName: process.env.SERVICE_NAME || 'todo-api',
          daemonAddress: process.env.AWS_XRAY_DAEMON_ADDRESS || 'auto-detect',
          mode: AWSXRay.isAutomaticMode() ? 'automatic' : 'manual'
        },
        troubleshooting: [
          'Verify X-Ray middleware is properly configured',
          'Check that openSegment is called before routes',
          'Ensure AWSXRay.init() was called during startup',
          'Check server logs for X-Ray initialization messages'
        ]
      });
    }

    // Add test metadata
    segment.addAnnotation('test', 'true');
    segment.addMetadata('test_request', {
      endpoint: '/test/xray',
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent']
    });

    // Create a test subsegment
    const subsegment = segment.addNewSubsegment('test-operation');
    subsegment.addAnnotation('operation', 'test');
    
    // Simulate some work
    setTimeout(() => {
      subsegment.close();
      
      res.json({
        success: true,
        message: 'Test trace created successfully',
        segmentInfo: {
          segmentId: segment.id,
          traceId: segment.trace_id,
          isClosed: segment.isClosed(),
          name: segment.name
        },
        instructions: [
          'This request should create a trace in AWS X-Ray',
          'Wait 30-60 seconds and check the AWS X-Ray console',
          `Look for service: ${process.env.SERVICE_NAME || 'todo-api'}`,
          'Search for trace ID: ' + segment.trace_id
        ],
        nextSteps: [
          'Check /test/xray/daemon to verify daemon connectivity',
          'Check /health/xray for full X-Ray configuration',
          'Review server logs for X-Ray debug messages (if AWS_XRAY_DEBUG_MODE=1)',
          'Verify AWS credentials have X-Ray permissions',
          'Check X-Ray daemon logs for errors'
        ]
      });
    }, 100);
  } catch (error) {
    res.status(500).json({
      error: 'X-Ray test failed',
      message: error.message,
      stack: process.env.AWS_XRAY_DEBUG_MODE === '1' ? error.stack : undefined
    });
  }
});

// Demo endpoint - generates comprehensive X-Ray traces with multiple operations
app.get('/demo/xray', async (req, res) => {
  if (!enableXRay) {
    return res.status(400).json({
      error: 'X-Ray is disabled',
      message: 'Set ENABLE_XRAY=true to enable tracing'
    });
  }

  try {
    const segment = AWSXRay.getSegment();
    
    if (!segment) {
      return res.status(500).json({
        error: 'No active segment',
        message: 'X-Ray middleware may not be properly configured'
      });
    }

    // Add demo annotations
    segment.addAnnotation('demo', 'true');
    segment.addAnnotation('demo_type', 'comprehensive');
    segment.addMetadata('demo_request', {
      endpoint: '/demo/xray',
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    const traceId = segment.trace_id;
    const results = {
      traceId: traceId,
      operations: [],
      startTime: new Date().toISOString()
    };

    // Operation 1: Simulate database query
    const dbSubsegment = segment.addNewSubsegment('Database Query');
    dbSubsegment.addAnnotation('operation', 'database_query');
    dbSubsegment.addAnnotation('service', 'mongodb');
    dbSubsegment.addMetadata('query', {
      collection: 'todos',
      operation: 'find',
      filter: { userId: 'demo-user' }
    });
    
    await new Promise(resolve => setTimeout(resolve, 50));
    dbSubsegment.addAnnotation('success', 'true');
    dbSubsegment.addMetadata('result', { count: 5, duration: '50ms' });
    dbSubsegment.close();
    results.operations.push({ name: 'Database Query', duration: '50ms', status: 'success' });

    // Operation 2: Simulate external API call
    const apiSubsegment = segment.addNewSubsegment('External API Call');
    apiSubsegment.addAnnotation('operation', 'http_request');
    apiSubsegment.addAnnotation('service', 'external-api');
    apiSubsegment.addMetadata('http', {
      method: 'GET',
      url: 'https://api.example.com/data',
      statusCode: 200
    });
    
    await new Promise(resolve => setTimeout(resolve, 120));
    apiSubsegment.addAnnotation('success', 'true');
    apiSubsegment.addMetadata('response', { 
      statusCode: 200,
      bodySize: 1024,
      duration: '120ms'
    });
    apiSubsegment.close();
    results.operations.push({ name: 'External API Call', duration: '120ms', status: 'success' });

    // Operation 3: Simulate data processing with nested subsegments
    const processingSubsegment = segment.addNewSubsegment('Data Processing');
    processingSubsegment.addAnnotation('operation', 'data_processing');
    
    // Nested subsegment: Data validation
    const validationSubsegment = processingSubsegment.addNewSubsegment('Validation');
    validationSubsegment.addAnnotation('step', 'validation');
    await new Promise(resolve => setTimeout(resolve, 30));
    validationSubsegment.addAnnotation('items_validated', 10);
    validationSubsegment.close();
    
    // Nested subsegment: Data transformation
    const transformSubsegment = processingSubsegment.addNewSubsegment('Transformation');
    transformSubsegment.addAnnotation('step', 'transformation');
    await new Promise(resolve => setTimeout(resolve, 40));
    transformSubsegment.addAnnotation('items_transformed', 10);
    transformSubsegment.close();
    
    processingSubsegment.addAnnotation('success', 'true');
    processingSubsegment.addMetadata('processing', {
      itemsProcessed: 10,
      totalDuration: '70ms'
    });
    processingSubsegment.close();
    results.operations.push({ name: 'Data Processing', duration: '70ms', subOperations: ['Validation', 'Transformation'], status: 'success' });

    // Operation 4: Simulate cache operation
    const cacheSubsegment = segment.addNewSubsegment('Cache Operation');
    cacheSubsegment.addAnnotation('operation', 'cache');
    cacheSubsegment.addAnnotation('cache_type', 'redis');
    cacheSubsegment.addMetadata('cache', {
      action: 'get',
      key: 'todos:user:demo-user',
      hit: true
    });
    
    await new Promise(resolve => setTimeout(resolve, 5));
    cacheSubsegment.addAnnotation('cache_hit', 'true');
    cacheSubsegment.close();
    results.operations.push({ name: 'Cache Operation', duration: '5ms', status: 'success', cacheHit: true });

    // Operation 5: Simulate error scenario (with error handling)
    const errorSubsegment = segment.addNewSubsegment('Error Handling Demo');
    errorSubsegment.addAnnotation('operation', 'error_demo');
    
    try {
      // Simulate a recoverable error
      await new Promise((_, reject) => setTimeout(() => reject(new Error('Simulated error')), 20));
    } catch (err) {
      errorSubsegment.addAnnotation('error_handled', 'true');
      errorSubsegment.addError(err);
      errorSubsegment.addMetadata('error_recovery', {
        strategy: 'fallback',
        fallbackValue: 'default-data'
      });
    } finally {
      errorSubsegment.close();
    }
    results.operations.push({ name: 'Error Handling Demo', duration: '20ms', status: 'handled', errorHandled: true });

    // Add final annotations
    segment.addAnnotation('total_operations', results.operations.length);
    segment.addMetadata('demo_summary', {
      totalOperations: results.operations.length,
      successfulOperations: results.operations.filter(op => op.status === 'success').length,
      errorHandled: true
    });

    results.endTime = new Date().toISOString();
    results.totalDuration = '~265ms';
    results.segmentId = segment.id;
    results.message = 'Demo trace created successfully with multiple operations';
    results.instructions = [
      'This demo trace includes:',
      '- Database query simulation',
      '- External API call simulation',
      '- Data processing with nested subsegments',
      '- Cache operation',
      '- Error handling demonstration',
      '',
      'View this trace in AWS X-Ray console:',
      `- Service: ${process.env.SERVICE_NAME || 'todo-api'}`,
      `- Trace ID: ${traceId}`,
      '- Wait 30-60 seconds for traces to appear',
      '- Look for nested subsegments in the trace map'
    ];

    res.json(results);
  } catch (error) {
    res.status(500).json({
      error: 'X-Ray demo failed',
      message: error.message,
      stack: process.env.AWS_XRAY_DEBUG_MODE === '1' ? error.stack : undefined
    });
  }
});

// Serve static files from React app in production
const publicPath = path.join(__dirname, 'public');
const fs = require('fs');
if (fs.existsSync(publicPath) && !isDev) {
  // Serve static files
  app.use(express.static(publicPath));
  
  // Serve React app for all non-API routes (SPA routing)
  app.get('*', (req, res, next) => {
    // Skip if it's an API route
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Error handling
app.use(errorHandler);

// Close X-Ray segment after all routes and error handling
// This must be after errorHandler to ensure all responses close segments
if (enableXRay) {
  app.use(XRayExpress.closeSegment());
}

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
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
