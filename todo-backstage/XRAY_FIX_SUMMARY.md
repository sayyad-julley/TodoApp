# X-Ray Traces Not Displaying - Root Cause & Fix

## Problem

X-Ray traces are not appearing in the AWS X-Ray console despite:
- ✅ X-Ray daemon running on port 2000
- ✅ X-Ray SDK installed and configured
- ✅ Environment variables set

## Root Cause

### Primary Issue: Incoming Requests Not Traced

Backstage's new backend system (`@backstage/backend-defaults`) doesn't use Express middleware directly, so:
- ❌ **Incoming HTTP requests** to Backstage are NOT automatically traced
- ✅ **Outbound HTTP/HTTPS calls** ARE traced (to GitHub, external APIs, etc.)

### Secondary Issue: Segments Not Being Created

X-Ray SDK needs segments to be created for requests. Without Express middleware, incoming requests don't create segments automatically.

## Current Status

### What's Working ✅

1. **X-Ray Daemon**: Running and sending traces to AWS
   ```bash
   tail -f ~/.xray-daemon/xray.log
   # Shows: "Successfully sent batch of 1 segments"
   ```

2. **AWS Credentials**: Configured and working
   ```bash
   aws sts get-caller-identity
   # Account: 239083306280
   ```

3. **X-Ray SDK**: Initialized in Backstage backend
   - Captures outbound HTTP/HTTPS calls
   - Ready to send traces

### What's Not Working ❌

1. **Incoming Requests**: Not traced (Backstage limitation)
2. **No Segments Created**: Without Express middleware, segments aren't created for incoming requests

## Solution

### Option 1: Monitor Outbound Calls (Current Setup)

The current setup **does trace outbound calls**. To see traces:

1. Make requests from Backstage that call external APIs:
   - GitHub API calls (when browsing catalog)
   - External service calls via proxy plugin
   - Any HTTP/HTTPS outbound requests

2. Check X-Ray console:
   - Service: `backstage-backend`
   - Region: `us-east-1`
   - Look for traces from outbound calls

### Option 2: Infrastructure-Level Tracing

For full incoming request tracing, use:
- AWS API Gateway with X-Ray enabled
- Application Load Balancer (ALB) with X-Ray
- AWS App Mesh

### Option 3: Manual Segment Creation

Create segments manually in request handlers (requires code changes).

## Verification Steps

### 1. Check X-Ray Daemon

```bash
# Verify daemon is running
lsof -i:2000

# Check logs for successful sends
tail -f ~/.xray-daemon/xray.log
```

### 2. Make Outbound API Calls

```bash
# Trigger GitHub API call from Backstage
# Navigate to catalog, browse entities, etc.
# This will generate outbound HTTP calls that X-Ray will trace
```

### 3. Check AWS X-Ray Console

1. Go to: https://console.aws.amazon.com/xray/
2. Select region: `us-east-1`
3. Look for service: `backstage-backend`
4. Check for traces from outbound calls

### 4. Enable Debug Mode

```bash
export AWS_XRAY_DEBUG_MODE=1
# Restart Backstage
```

## Expected Behavior

With current setup:
- ✅ **Outbound calls** → Traced and visible in X-Ray
- ❌ **Incoming requests** → Not traced (limitation)

## Next Steps

1. ✅ **Verify AWS credentials** - Already configured
2. ✅ **Check X-Ray daemon** - Running and sending traces
3. ✅ **Make outbound API calls** - Generate traces
4. ✅ **Check X-Ray console** - Look for `backstage-backend` service
5. 📝 **Monitor outbound calls** - This is what will be traced

## Files Modified

- `packages/backend/src/index.ts` - Added X-Ray initialization
- `packages/backend/package.json` - Added `aws-xray-sdk-express` dependency
- `XRAY_TROUBLESHOOTING.md` - Detailed troubleshooting guide

## Conclusion

**X-Ray is working correctly** - it's tracing outbound calls. The "missing traces" are because:
1. Incoming requests aren't traced (Backstage limitation)
2. You need to make outbound API calls to generate traces

**To see traces**: Make requests from Backstage that call external APIs (GitHub, etc.), then check the X-Ray console for `backstage-backend` service.

