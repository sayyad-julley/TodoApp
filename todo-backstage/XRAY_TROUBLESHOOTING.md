# AWS X-Ray Troubleshooting Guide

## Issue: X-Ray Traces Not Displaying

### Current Status

✅ **X-Ray Daemon**: Running on port 2000
✅ **X-Ray SDK**: Initialized in Backstage backend
⚠️ **Traces**: Not appearing in AWS X-Ray console

### Root Cause Analysis

The X-Ray SDK is initialized and configured to capture:
- ✅ Outbound HTTP/HTTPS calls (to external services)
- ❌ Incoming HTTP requests (Backstage's new backend system doesn't use Express middleware)

### Solutions

#### 1. Verify AWS Credentials

X-Ray daemon needs AWS credentials to send traces to AWS:

```bash
# Check if AWS credentials are configured
aws sts get-caller-identity

# If not configured, set credentials:
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
export AWS_DEFAULT_REGION=us-east-1
```

#### 2. Check X-Ray Daemon Logs

```bash
tail -f ~/.xray-daemon/xray.log
```

Look for:
- ✅ "Successfully sent batch" - traces are being sent
- ❌ "Error sending batch" - check AWS credentials/permissions
- ❌ "Connection refused" - daemon not running

#### 3. Verify IAM Permissions

The X-Ray daemon needs permissions to write to X-Ray:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "xray:PutTraceSegments",
        "xray:PutTelemetryRecords"
      ],
      "Resource": "*"
    }
  ]
}
```

Or use the managed policy: `AWSXRayDaemonWriteAccess`

#### 4. Test Outbound HTTP Calls

X-Ray is configured to capture outbound HTTP/HTTPS calls. Make requests from Backstage that call external APIs:

```bash
# Test from Backstage backend (calls GitHub API, etc.)
curl http://localhost:7007/api/catalog/entities
```

#### 5. Check Service Name in X-Ray Console

Traces appear under the service name configured:
- Service name: `backstage-backend` (from `SERVICE_NAME` env var)
- Region: `us-east-1` (from X-Ray daemon config)

#### 6. Verify Daemon Address

```bash
# Check if daemon is accessible
netstat -an | grep 2000

# Test connection
nc -zv localhost 2000
```

#### 7. Enable Debug Mode

```bash
export AWS_XRAY_DEBUG_MODE=1
# Restart Backstage backend
```

This will show detailed X-Ray SDK logs.

### Current Limitations

**Backstage Backend System**: The new Backstage backend system (`@backstage/backend-defaults`) doesn't use Express middleware directly, so incoming request segments aren't automatically created. X-Ray will capture:
- ✅ Outbound HTTP/HTTPS calls (to GitHub, external APIs, etc.)
- ❌ Incoming HTTP requests (need infrastructure-level tracing)

### Workarounds

1. **Infrastructure-Level Tracing**: Use AWS API Gateway or Application Load Balancer with X-Ray enabled
2. **Manual Segment Creation**: Create segments manually in request handlers (see example below)
3. **Outbound Calls Only**: Monitor outbound calls to external services (GitHub, etc.)

### Testing Manual Segment Creation

To verify X-Ray is working, you can manually create segments:

```typescript
const AWSXRay = require('aws-xray-sdk-core');
const segment = AWSXRay.getSegment() || AWSXRay.createSegment('test-segment');
segment.addMetadata('test', 'manual-segment');
segment.close();
```

### Expected Behavior

With current setup:
- ✅ Outbound HTTP calls to GitHub API → Traced
- ✅ Outbound HTTPS calls to external services → Traced  
- ❌ Incoming requests to Backstage → Not traced (limitation)

### Next Steps

1. **Verify AWS credentials** are configured
2. **Check X-Ray daemon logs** for successful batch sends
3. **Make outbound API calls** from Backstage to generate traces
4. **Check AWS X-Ray console** for `backstage-backend` service
5. **Enable debug mode** if issues persist

### Resources

- [AWS X-Ray Troubleshooting](https://docs.aws.amazon.com/xray/latest/devguide/xray-troubleshooting.html)
- [X-Ray Daemon Documentation](https://docs.aws.amazon.com/xray/latest/devguide/xray-daemon.html)
- [X-Ray SDK Node.js](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-nodejs.html)

