#!/usr/bin/env node

/**
 * Script to generate multiple demo X-Ray traces
 * Usage: node scripts/generate-demo-traces.js [count]
 */

const http = require('http');

// Try to detect the correct port
function detectPort() {
  const envPort = process.env.PORT || process.env.API_PORT;
  if (envPort) {
    return parseInt(envPort);
  }
  // Default to 5000, but allow override via API_URL
  return null;
}

const BASE_URL = process.env.API_URL || 'http://localhost';
const DEFAULT_PORT = detectPort() || 5000;
const API_URL = process.env.API_URL || `${BASE_URL}:${DEFAULT_PORT}`;
const TRACE_COUNT = parseInt(process.argv[2]) || 5;
const DELAY_BETWEEN_TRACES = 1000; // 1 second

// Try multiple ports if default fails
// Try 5001 first since that's where the server often runs when 5000 is occupied
const PORTS_TO_TRY = [5001, DEFAULT_PORT, 3000, 8000];

async function checkDemoEndpoint(port) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}:${port}/demo/xray`;
    const req = http.get(url, { timeout: 2000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        // Check if this is the correct server (has /demo/xray endpoint)
        // Accept 200 (success) or 400 with JSON error (X-Ray disabled but endpoint exists)
        const isValid = res.statusCode === 200 || 
                       (res.statusCode === 400 && (data.includes('xrayEnabled') || data.includes('traceId') || data.trim().startsWith('{')));
        if (isValid) {
          console.log(`   ✅ Port ${port}: /demo/xray returns ${res.statusCode}`);
        }
        resolve(isValid);
      });
    });
    req.on('error', (err) => {
      // Connection error - port not available
      resolve(false);
    });
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.setTimeout(2000);
  });
}

async function findServerPort() {
  // If API_URL is explicitly set, use it
  if (process.env.API_URL) {
    const url = new URL(process.env.API_URL);
    return parseInt(url.port) || DEFAULT_PORT;
  }
  
  console.log(`   Checking ports: ${PORTS_TO_TRY.join(', ')}`);
  
  // First, try to find a server with /demo/xray endpoint (preferred)
  for (const port of PORTS_TO_TRY) {
    const hasDemoEndpoint = await checkDemoEndpoint(port);
    if (hasDemoEndpoint) {
      console.log(`   ✅ Found /demo/xray endpoint on port ${port}`);
      return port;
    }
  }
  
  console.log(`   ⚠️  No /demo/xray endpoint found, checking for /health...`);
  
  // If no server with /demo/xray found, try to find any server with /health
  for (const port of PORTS_TO_TRY) {
    try {
      const url = `${BASE_URL}:${port}/health`;
      await new Promise((resolve, reject) => {
        const req = http.get(url, { timeout: 2000 }, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`Status ${res.statusCode}`));
          }
        });
        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
        req.setTimeout(2000);
      });
      console.log(`   ⚠️  Found server on port ${port} but /demo/xray endpoint not available`);
      return port;
    } catch (error) {
      continue;
    }
  }
  
  console.log(`   ⚠️  No server found, defaulting to port ${DEFAULT_PORT}`);
  // Default to the first port if none found
  return DEFAULT_PORT;
}

async function generateTrace(traceNumber, serverPort) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}:${serverPort}/demo/xray`;
    
    console.log(`📊 Generating trace ${traceNumber}/${TRACE_COUNT}...`);
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Check for HTTP errors
        if (res.statusCode !== 200) {
          console.error(`  ❌ HTTP ${res.statusCode}: ${data.substring(0, 200)}`);
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 100)}`));
          return;
        }
        
        try {
          const result = JSON.parse(data);
          if (result.traceId) {
            console.log(`  ✅ Trace ID: ${result.traceId}`);
            console.log(`  📝 Operations: ${result.operations.length}`);
            console.log(`  ⏱️  Duration: ${result.totalDuration}`);
            resolve(result);
          } else if (result.error) {
            console.error(`  ❌ Error from server: ${result.error}`);
            console.error(`  📝 Message: ${result.message || 'No message'}`);
            reject(new Error(result.message || result.error));
          } else {
            console.error(`  ❌ Invalid response: ${data.substring(0, 200)}`);
            reject(new Error('Invalid response - no traceId'));
          }
        } catch (error) {
          console.error(`  ❌ Parse error: ${error.message}`);
          console.error(`  📝 Response was: ${data.substring(0, 200)}`);
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.error(`  ❌ Request failed: ${error.message}`);
      reject(error);
    });
  });
}

async function generateAllTraces() {
  console.log(`🚀 Generating ${TRACE_COUNT} demo traces...`);
  console.log(`🔍 Detecting server port...`);
  
  const serverPort = await findServerPort();
  const serverUrl = `${BASE_URL}:${serverPort}`;
  
  console.log(`✅ Found server on port ${serverPort}`);
  console.log(`🌐 API URL: ${serverUrl}`);
  console.log('');
  
  // Verify X-Ray is enabled
  try {
    const healthUrl = `${serverUrl}/health/xray`;
    const healthCheck = await new Promise((resolve, reject) => {
      http.get(healthUrl, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
    
    if (!healthCheck.xrayEnabled) {
      console.error('⚠️  WARNING: X-Ray is disabled on the server!');
      console.error('   Set ENABLE_XRAY=true in .env and restart the server.');
      console.error('');
    }
  } catch (error) {
    console.warn(`⚠️  Could not verify X-Ray status: ${error.message}`);
  }
  
  const results = [];
  
  let successCount = 0;
  let failureCount = 0;
  
  for (let i = 1; i <= TRACE_COUNT; i++) {
    try {
      const result = await generateTrace(i, serverPort);
      results.push(result);
      successCount++;
      
      // Wait before next trace (except for the last one)
      if (i < TRACE_COUNT) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_TRACES));
      }
    } catch (error) {
      failureCount++;
      console.error(`  ❌ Failed to generate trace ${i}: ${error.message}`);
      // Don't exit on error - continue with remaining traces
    }
  }
  
  // Show warning if all traces failed
  if (results.length === 0 && TRACE_COUNT > 0) {
    console.error('');
    console.error('⚠️  WARNING: All trace generation attempts failed!');
    console.error('   Please check:');
    console.error('   1. Server is running on the detected port');
    console.error('   2. X-Ray is enabled (check /health/xray endpoint)');
    console.error('   3. /demo/xray endpoint exists (server may need restart)');
    console.error('   4. Network connectivity to server');
    console.error('');
    console.error('   Try testing the endpoint directly:');
    console.error(`   curl http://localhost:${serverPort}/demo/xray`);
    console.error('');
  }
  
  console.log('');
  console.log('✨ Demo trace generation complete!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`  - Successful traces: ${successCount}`);
  console.log(`  - Failed traces: ${failureCount}`);
  console.log(`  - Total operations: ${results.reduce((sum, r) => sum + (r.operations?.length || 0), 0)}`);
  
  if (results.length > 0) {
    console.log('');
    console.log('🔍 View traces in AWS X-Ray console:');
    console.log(`  - Service: todo-api`);
    console.log(`  - Region: us-east-1 (or your configured region)`);
    console.log(`  - Wait 30-60 seconds for traces to appear`);
    console.log('');
    console.log('Trace IDs:');
    results.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.traceId}`);
    });
  }
}

// Run the script
generateAllTraces().catch((error) => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});

