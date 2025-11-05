/**
 * AWS X-Ray Tracing Utility for Frontend
 * 
 * This module provides X-Ray trace context generation and propagation
 * for browser-based applications. It creates trace IDs and propagates
 * them via HTTP headers to enable distributed tracing across frontend
 * and backend services.
 */

/**
 * Generate a random hex string of specified length
 */
function generateRandomHex(length) {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * Generate X-Ray trace ID in format: 1-<timestamp>-<random>
 * Format: 1-<8 hex digits>-<24 hex digits>
 */
function generateTraceId() {
  // Get current timestamp in seconds, convert to hex (8 hex digits)
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  // Generate 24 hex digit random string
  const random = generateRandomHex(24);
  return `1-${timestamp}-${random}`;
}

/**
 * Generate X-Ray segment ID (16 hex digits)
 */
function generateSegmentId() {
  return generateRandomHex(16);
}

/**
 * X-Ray Trace Context Manager
 * Manages trace context for the current browser session
 */
class XRayTraceContext {
  constructor() {
    this.traceId = null;
    this.parentSegmentId = null;
    this.sampled = true; // Default to sampled
    this.serviceName = 'todo-frontend';
    this.enabled = this.shouldEnable();
    this.init();
  }

  /**
   * Check if X-Ray should be enabled
   */
  shouldEnable() {
    // Enable by default in production, or if explicitly enabled
    const env = import.meta.env?.MODE || 'development';
    const explicit = import.meta.env?.VITE_ENABLE_XRAY === 'true';
    return explicit || env === 'production';
  }

  /**
   * Initialize trace context
   */
  init() {
    if (!this.enabled) {
      return;
    }

    // Generate new trace ID if not exists
    if (!this.traceId) {
      this.traceId = generateTraceId();
    }

    // Try to get service name from environment
    if (import.meta.env?.VITE_SERVICE_NAME) {
      this.serviceName = import.meta.env.VITE_SERVICE_NAME;
    }

    if (import.meta.env?.VITE_XRAY_DEBUG === 'true') {
      console.log('✅ X-Ray Tracing initialized for frontend');
      console.log(`   Service: ${this.serviceName}`);
      console.log(`   Trace ID: ${this.traceId}`);
    }
  }

  /**
   * Start a new trace or continue existing one
   */
  startTrace() {
    if (!this.enabled) {
      return null;
    }

    // Generate new parent segment for this request
    this.parentSegmentId = generateSegmentId();
    return {
      traceId: this.traceId,
      parentSegmentId: this.parentSegmentId,
      sampled: this.sampled
    };
  }

  /**
   * Generate X-Amzn-Trace-Id header value
   * Format: Root=1-<timestamp>-<random>;Parent=<segment-id>;Sampled=<0|1>
   */
  generateTraceHeader() {
    if (!this.enabled || !this.traceId) {
      return null;
    }

    const parts = [`Root=${this.traceId}`];
    
    if (this.parentSegmentId) {
      parts.push(`Parent=${this.parentSegmentId}`);
    }
    
    parts.push(`Sampled=${this.sampled ? '1' : '0'}`);
    
    return parts.join(';');
  }

  /**
   * Continue trace from backend response headers
   * This allows us to maintain trace continuity across requests
   */
  continueTrace(traceHeader) {
    if (!this.enabled || !traceHeader) {
      return;
    }

    // Parse X-Amzn-Trace-Id header
    // Format: Root=1-<timestamp>-<random>;Parent=<segment-id>;Sampled=<0|1>
    const parts = traceHeader.split(';');
    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 'Root') {
        this.traceId = value;
      } else if (key === 'Parent') {
        // Use backend's segment as parent for next request
        this.parentSegmentId = value;
      } else if (key === 'Sampled') {
        this.sampled = value === '1';
      }
    }

    if (import.meta.env?.VITE_XRAY_DEBUG === 'true') {
      console.log('📡 Continuing trace from backend:', {
        traceId: this.traceId,
        parentSegmentId: this.parentSegmentId,
        sampled: this.sampled
      });
    }
  }

  /**
   * Add trace metadata to request config
   */
  addTraceToRequest(config) {
    if (!this.enabled) {
      return config;
    }

    const traceHeader = this.generateTraceHeader();
    if (traceHeader) {
      config.headers = config.headers || {};
      config.headers['X-Amzn-Trace-Id'] = traceHeader;
      
      // Also add custom headers for service identification
      config.headers['X-Trace-Service'] = this.serviceName;
      config.headers['X-Trace-Origin'] = 'frontend';

      if (import.meta.env?.VITE_XRAY_DEBUG === 'true') {
        console.log('📤 Adding X-Ray trace header:', traceHeader);
      }
    }

    return config;
  }

  /**
   * Extract trace context from response headers
   */
  extractTraceFromResponse(response) {
    if (!this.enabled || !response?.headers) {
      return;
    }

    const traceHeader = response.headers['x-amzn-trace-id'] || 
                       response.headers['X-Amzn-Trace-Id'];
    
    if (traceHeader) {
      this.continueTrace(traceHeader);
    }
  }

  /**
   * Get current trace context info (for debugging)
   */
  getTraceInfo() {
    if (!this.enabled) {
      return { enabled: false };
    }

    return {
      enabled: true,
      traceId: this.traceId,
      parentSegmentId: this.parentSegmentId,
      sampled: this.sampled,
      serviceName: this.serviceName
    };
  }
}

// Create singleton instance
const xrayContext = new XRayTraceContext();

/**
 * Export functions and instance
 */
export default xrayContext;

export {
  generateTraceId,
  generateSegmentId,
  XRayTraceContext
};

