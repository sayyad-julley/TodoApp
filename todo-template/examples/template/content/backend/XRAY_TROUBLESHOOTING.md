# AWS X-Ray Troubleshooting Guide

## Quick Diagnostic Steps

### 1. Check X-Ray Status
```bash
curl http://localhost:5000/health/xray
```

Expected response should show:
- `xrayEnabled: true`
- `hasActiveSegment: true` (when called during a request)
- `segmentId` and `traceId` (when segment exists)

### 2. Test Daemon Connectivity
```bash
curl http://localhost:5000/test/xray/daemon
```

This verifies UDP connectivity to the X-Ray daemon.

### 3. Create Test Trace
```bash
curl http://localhost:5000/test/xray
```

This creates a test trace and returns the trace ID. Use this trace ID to search in AWS X-Ray console.

### 4. Check Server Logs

With `AWS_XRAY_DEBUG_MODE=1` enabled, you should see:
- `✅ AWS X-Ray configured successfully` on startup
- `🔍 X-Ray segment created for GET /api/todos` for each request
- `📤 X-Ray trace header in response: Root=...` showing trace headers
- `✅ Segment closed successfully` after responses

## Common Issues and Solutions

### Issue 1: No Segments Being Created

**Symptoms:**
- `/health/xray` shows `hasActiveSegment: false`
- No debug logs showing segment creation
- `/test/xray` returns "No active segment"

**Possible Causes:**
1. X-Ray middleware not properly configured
2. `openSegment` called after routes
3. `AWSXRay.init()` not called

**Solutions:**
- Verify `ENABLE_XRAY=true` is set
- Check server startup logs for "✅ AWS X-Ray configured successfully"
- Ensure `openSegment` is called before routes
- Verify `AWSXRay.init()` is called in initialization block

### Issue 2: Segments Created But Not Sent to Daemon

**Symptoms:**
- Segments are created (debug logs show segment IDs)
- But traces don't appear in X-Ray console

**Possible Causes:**
1. X-Ray daemon not running
2. Daemon not reachable from backend
3. AWS credentials missing or incorrect
4. IAM permissions insufficient

**Solutions:**

**Check if daemon is running:**
```bash
# Docker
docker ps | grep xray-daemon

# Local
lsof -i :2000
```

**Test daemon connectivity:**
```bash
curl http://localhost:5000/test/xray/daemon
```

**Check AWS credentials:**
```bash
aws sts get-caller-identity
```

**Verify IAM permissions:**
- `xray:PutTraceSegments`
- `xray:PutTelemetryRecords`
- `xray:GetSamplingRules`
- `xray:GetSamplingTargets`

### Issue 3: Daemon Running But Not Receiving Traces

**Symptoms:**
- Daemon is running
- Backend can connect to daemon
- But no traces in console

**Possible Causes:**
1. Daemon not sending to AWS (network/permissions)
2. Wrong AWS region
3. Daemon logs show errors

**Solutions:**

**Check daemon logs:**
```bash
# Docker
docker logs todoapp-xray-daemon

# Local
tail -f ~/.xray-daemon/xray.log
```

Look for:
- "Successfully sent batch of X segments" (good)
- "Failed to send batch" or "AccessDenied" (bad - check permissions)

**Verify AWS region:**
- Ensure daemon is configured for correct region
- Check `AWS_REGION` environment variable
- Verify region in AWS X-Ray console matches

### Issue 4: Traces Appear But Not Immediately

**Symptoms:**
- Everything seems configured correctly
- But traces don't show up right away

**Solutions:**
- X-Ray console has a 30-60 second delay
- Wait 1-2 minutes after making requests
- Use the trace ID from `/test/xray` to search directly
- Check if sampling rules are filtering out traces

### Issue 5: Docker-Specific Issues

**Symptoms:**
- Works locally but not in Docker
- Daemon connectivity fails

**Solutions:**

**Verify network:**
- Ensure backend and xray-daemon are on same Docker network
- Check `depends_on: xray-daemon` in docker-compose.yml
- Verify `AWS_XRAY_DAEMON_ADDRESS=xray-daemon:2000` (not localhost)

**Check AWS credentials:**
- Docker containers need AWS credentials mounted
- Verify volume mount: `${HOME}/.aws:/root/.aws:ro`
- Or use IAM roles (ECS/EC2)

## Step-by-Step Verification

### Step 1: Verify Initialization
```bash
# Check server logs for:
✅ AWS X-Ray configured successfully
   Service: todo-api
   Daemon: localhost:2000 (or xray-daemon:2000)
   Mode: Automatic (initialized explicitly)
```

### Step 2: Verify Middleware
```bash
# Make a request and check logs for:
🔍 X-Ray segment created for GET /api/todos
   Segment ID: 1-xxxxx-xxxxx
   Trace ID: 1-xxxxx-xxxxx
```

### Step 3: Verify Segment Closing
```bash
# Check logs for:
📤 X-Ray trace header in response: Root=1-xxxxx-xxxxx
✅ Segment closed successfully
```

### Step 4: Verify Daemon
```bash
# Check daemon logs for:
2024-xx-xx Successfully sent batch of 1 segments
```

### Step 5: Check AWS Console
1. Go to: https://console.aws.amazon.com/xray/
2. Select correct region
3. Search for service: `todo-api`
4. Use trace ID from `/test/xray` to search directly

## Debug Mode

Enable detailed logging:

```bash
export AWS_XRAY_DEBUG_MODE=1
```

This will show:
- Segment creation for each request
- Segment IDs and trace IDs
- Trace headers in responses
- Segment closing status
- Any errors accessing segments

## Test Endpoints Summary

| Endpoint | Purpose |
|----------|---------|
| `/health/xray` | Check X-Ray configuration and status |
| `/test/xray/daemon` | Test daemon connectivity |
| `/test/xray` | Create test trace and get trace ID |

## Next Steps if Still Not Working

1. **Check X-Ray SDK version:**
   ```bash
   npm list aws-xray-sdk-core aws-xray-sdk-express
   ```

2. **Review AWS X-Ray documentation:**
   - https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-nodejs.html

3. **Check AWS Service Health:**
   - Ensure X-Ray service is available in your region

4. **Review CloudWatch Logs:**
   - Check for any X-Ray-related errors

5. **Contact Support:**
   - If all else fails, check AWS X-Ray forums or support

---

## Summary

This troubleshooting guide covers the most common X-Ray integration issues. For additional help, refer to the [AWS X-Ray Developer Guide](https://docs.aws.amazon.com/xray/latest/devguide/) and check the application logs for detailed error messages.

