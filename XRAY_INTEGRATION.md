# AWS X-Ray Integration Guide

This document describes the AWS X-Ray integration implemented across the TodoApp project components to provide distributed tracing and monitoring capabilities.

## Overview

AWS X-Ray has been integrated into the following components:

1. **Express Todo API** (`golden-path/templates/fullstack-todo/backend/`)
2. **React Todo Frontend** (`golden-path/templates/fullstack-todo/frontend/`)
3. **Backstage Backend** (`todo-backstage/packages/backend/`)
4. **MCP Secrets Manager Server** (`mcp-secrets-manager/`)

## Features Implemented

### 1. Express Todo API (`golden-path/templates/fullstack-todo/backend/`)

#### X-Ray SDK Initialization
- **File**: `server.js`
- **Features**:
  - X-Ray SDK initialization with dynamic naming
  - Express middleware for incoming request tracing
  - Global HTTP/HTTPS capture for outbound calls
  - AWS SDK v2 capture for Secrets Manager integration.

#### Key Components
```javascript
// X-Ray SDK imports and initialization
const AWSXRay = require('aws-xray-sdk-core');
const captureExpress = require('aws-xray-sdk-express');
const captureHttps = require('aws-xray-sdk-core').captureHTTPS;
const captureAWS = require('aws-xray-sdk-core').captureAWS;

// Initialize X-Ray
AWSXRay.init();
captureHttps();
const AWS = captureAWS(require('aws-sdk'));

// Dynamic service naming
const serviceName = process.env.SERVICE_NAME || 'todo-api';
process.env.AWS_XRAY_TRACING_NAME = serviceName;
```

#### MongoDB Integration
- **File**: `src/config/database.js`
- **Features**:
  - Manual subsegment creation for MongoDB connection attempts
  - Connection metadata and error tracking
  - Success/failure annotations

#### Secrets Manager Integration
- **File**: `src/config/secrets-manager.js`
- **Features**:
  - AWS SDK v2 automatically captured by X-Ray
  - Secrets Manager calls traced as downstream service calls

### 2. React Todo Frontend (`golden-path/templates/fullstack-todo/frontend/`)

#### X-Ray Trace Context Generation
- **File**: `src/utils/xray.js`
- **Features**:
  - Manual trace ID generation following X-Ray format
  - Trace context propagation via HTTP headers
  - Automatic trace header injection in all API requests
  - Trace context continuation from backend responses

#### Key Components
```javascript
// X-Ray trace context manager
import xrayContext from './utils/xray.js';

// Generate trace ID: 1-<timestamp>-<random>
const traceId = generateTraceId();

// Add trace headers to requests
xrayContext.addTraceToRequest(config);

// Continue trace from backend response
xrayContext.extractTraceFromResponse(response);
```

#### Axios Integration
- **File**: `src/utils/api.js`
- **Features**:
  - Automatic trace header injection in request interceptors
  - Trace context extraction from response interceptors
  - Seamless integration with existing API calls

#### Trace Header Format
The frontend generates and propagates X-Ray trace headers in the format:
```
X-Amzn-Trace-Id: Root=1-<timestamp>-<random>;Parent=<segment-id>;Sampled=1
```

The backend automatically continues the trace using these headers, creating a distributed trace across frontend and backend services.

### 3. Backstage Backend (`todo-backstage/packages/backend/`)

#### Process-level X-Ray Initialization
- **File**: `src/index.ts`
- **Features**:
  - X-Ray SDK initialization at process startup
  - Dynamic service naming
  - Automatic capture of outbound HTTP/AWS SDK calls

```typescript
// X-Ray SDK for Node.js
const AWSXRay = require('aws-xray-sdk-core');

// Initialize X-Ray at process level
AWSXRay.init();

// Set dynamic service name for Backstage backend
const serviceName = process.env.SERVICE_NAME || 'backstage-backend';
process.env.AWS_XRAY_TRACING_NAME = serviceName;
```

### 4. MCP Secrets Manager Server (`mcp-secrets-manager/`)

#### Manual Segment Management
- **File**: `src/mcp-server.js`
- **Features**:
  - Process-level X-Ray initialization
  - Manual segment and subsegment creation for MCP operations
  - Custom annotations and metadata for tool operations

#### Key Operations Traced
- `init_aws`: AWS credential initialization
- `list_secrets`: Secrets Manager list operations
- `get_secret`: Secret retrieval operations
- Error handling and propagation

```javascript
// Example of manual segment creation
async handleGetSecret(args) {
  const segment = AWSXRay.getSegment() || AWSXRay.addNewSegment('GetSecret');

  try {
    const subsegment = segment.addNewSubsegment('GetSecret');
    subsegment.addAnnotation('operation', 'get_secret');
    subsegment.addMetadata('args', { secretId, versionStage });

    const result = await this.secretsOps.getSecretValue(secretId, versionStage);

    subsegment.addAnnotation('success', 'true');
    subsegment.addMetadata('response', { /* sanitized response */ });

    return response;
  } finally {
    if (segment === AWSXRay.getSegment()) {
      segment.close();
    }
  }
}
```

## Configuration

### Environment Variables

#### Backend Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `SERVICE_NAME` | X-Ray service name for dynamic naming | `todo-api` |
| `ENABLE_XRAY` | Enable X-Ray tracing (set to `true` in dev) | `false` (dev), `true` (prod) |
| `AWS_XRAY_TRACING_NAME` | X-Ray segment name override | Set from `SERVICE_NAME` |
| `AWS_XRAY_DAEMON_ADDRESS` | X-Ray daemon address | `localhost:2000` (dev), auto-detect (AWS) |
| `AWS_XRAY_DEBUG_MODE` | Enable X-Ray debug logging | `0` |
| `AWS_REGION` | AWS region for X-Ray daemon | `us-east-1` |

#### Frontend Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_ENABLE_XRAY` | Enable X-Ray tracing in frontend | `false` (dev), `true` (prod) |
| `VITE_SERVICE_NAME` | Frontend service name for X-Ray | `todo-frontend` |
| `VITE_XRAY_DEBUG` | Enable X-Ray debug logging in frontend | `false` |

### AWS X-Ray Daemon

For local development and testing, ensure the X-Ray daemon is running:

```bash
# Using Docker
docker run -d -p 2000:2000 --name xray-daemon amazon/aws-xray-daemon

# Or install locally
curl https://s3.dualstack.us-east-2.amazonaws.com/aws-xray-assets.us-east-2/xray-daemon/aws-xray-daemon-3.x.zip -o aws-xray-daemon.zip
unzip aws-xray-daemon.zip && ./xray -o
```

### AWS IAM Permissions

Ensure the following AWS IAM permissions are available for X-Ray:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "xray:PutTraceSegments",
                "xray:PutTelemetryRecords",
                "xray:GetSamplingRules",
                "xray:GetSamplingTargets"
            ],
            "Resource": "*"
        }
    ]
}
```

## Tracing Features

### 1. Request Tracing
- Incoming HTTP requests automatically traced
- Request/response metadata captured
- Error and exception tracking

### 2. Frontend-to-Backend Tracing
- Frontend API calls automatically traced with trace headers
- Backend continues traces from frontend headers
- Distributed tracing across frontend and backend services
- Trace context propagation via `X-Amzn-Trace-Id` header

### 3. Downstream Service Calls
- AWS SDK v2 calls to Secrets Manager
- HTTP/HTTPS outbound calls
- MongoDB connection operations

### 4. Custom Annotations
- Service operation names
- Success/failure status
- Request counts and metadata
- Upstream service identification (frontend → backend)
- Trace origin tracking

### 5. Error Handling
- Automatic error propagation
- Exception details captured
- Fault flagging for failed operations

## Monitoring and Analysis

### X-Ray Console
View traces in the AWS X-Ray Console:
1. Navigate to AWS X-Ray service
2. View Service Map for distributed tracing
3. Analyze traces for performance bottlenecks
4. Set up alarms and notifications

### Key Metrics to Monitor
- Request latency by service (frontend and backend)
- End-to-end request latency (frontend → backend)
- Error rates and fault detection across services
- Downstream service dependency health
- Database connection performance
- Frontend API call patterns and performance

## Development Notes

### Local Development
- X-Ray traces are automatically disabled if no daemon is available
- Services continue to function normally without X-Ray
- Use environment variables to configure service names

### Security Considerations
- Sensitive data (passwords, secrets) is masked in X-Ray metadata
- Only non-sensitive request/response data is captured
- AWS credentials are not logged or traced

### Performance Impact
- Minimal overhead for trace collection
- Asynchronous segment submission
- Automatic sampling to control trace volume

## Troubleshooting

### Common Issues

1. **Traces not appearing in X-Ray**
   - Verify X-Ray daemon is running
   - Check IAM permissions
   - Ensure proper AWS credentials configuration

2. **Missing frontend traces**
   - Verify `VITE_ENABLE_XRAY=true` is set in frontend environment
   - Check browser console for X-Ray initialization messages
   - Ensure trace headers are being sent (check Network tab in browser dev tools)

3. **Missing downstream service traces**
   - Verify AWS SDK capture is properly configured
   - Check if service calls are made within X-Ray segments

4. **High overhead**
   - Adjust sampling rules in X-Ray console
   - Review custom metadata being added to segments

### Debug Logging
Enable debug logging for X-Ray:

```bash
export AWS_XRAY_DEBUG_MODE=1
export AWS_XRAY_LOG_LEVEL=debug
```

## Frontend X-Ray Integration Details

### How It Works

1. **Trace Generation**: Frontend generates X-Ray-compatible trace IDs on initialization
2. **Header Injection**: All API requests automatically include `X-Amzn-Trace-Id` header
3. **Backend Continuation**: Backend Express middleware automatically continues traces from headers
4. **Response Propagation**: Backend includes trace context in response headers for frontend continuation

### Browser Compatibility

The frontend X-Ray integration uses manual instrumentation since AWS X-Ray SDK for JavaScript is primarily designed for Node.js. The implementation:
- Generates trace IDs following X-Ray format
- Propagates trace context via standard HTTP headers
- Works in all modern browsers
- No additional dependencies required

### Enabling Frontend Tracing

To enable X-Ray tracing in the frontend:

```bash
# Development
VITE_ENABLE_XRAY=true npm run dev

# Production (default enabled)
npm run build
```

Or set in `.env` file:
```bash
VITE_ENABLE_XRAY=true
VITE_SERVICE_NAME=todo-frontend
VITE_XRAY_DEBUG=true
```

## Future Enhancements

1. **Advanced Sampling Rules**: Configure custom sampling based on request characteristics
2. **Custom Metrics**: Add business-relevant metrics and annotations
3. **Integration with CloudWatch**: Set up automated alerts and dashboards
4. **OpenTelemetry Migration**: Consider migrating to AWS Distro for OpenTelemetry for enhanced browser support
5. **Real User Monitoring (RUM)**: Integrate X-Ray with CloudWatch RUM for frontend performance monitoring

## References

- [AWS X-Ray Developer Guide](https://docs.aws.amazon.com/xray/)
- [AWS X-Ray SDK for Node.js](https://github.com/aws/aws-xray-sdk-node)
- [X-Ray Best Practices](https://docs.aws.amazon.com/xray/latest/devguide/xray-best-practices.html)