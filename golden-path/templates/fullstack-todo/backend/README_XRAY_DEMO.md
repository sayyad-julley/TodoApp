# X-Ray Demo Traces

This guide explains how to generate demo traces for AWS X-Ray.

## Demo Endpoint

A new `/demo/xray` endpoint has been added that generates comprehensive X-Ray traces with multiple operations:

### Features

The demo endpoint creates traces with:
1. **Database Query Simulation** - Simulates MongoDB query with 50ms duration
2. **External API Call** - Simulates HTTP request to external service (120ms)
3. **Data Processing** - Includes nested subsegments:
   - Validation (30ms)
   - Transformation (40ms)
4. **Cache Operation** - Simulates Redis cache hit (5ms)
5. **Error Handling Demo** - Demonstrates error capture and recovery

### Usage

#### Single Trace

```bash
curl http://localhost:5000/demo/xray
```

#### Generate Multiple Traces

Use the script to generate multiple traces:

```bash
# Generate 5 traces (default)
node scripts/generate-demo-traces.js

# Generate 10 traces
node scripts/generate-demo-traces.js 10
```

#### Using the Script

```bash
cd golden-path/templates/fullstack-todo/backend
node scripts/generate-demo-traces.js 5
```

## Viewing Traces in AWS X-Ray Console

1. Go to [AWS X-Ray Console](https://console.aws.amazon.com/xray/)
2. Select your region (default: us-east-1)
3. Look for service: `todo-api`
4. Wait 30-60 seconds for traces to appear
5. Click on a trace to see the detailed trace map with all subsegments

## Trace Structure

Each demo trace includes:
- **Segment**: Main request segment with annotations and metadata
- **Subsegments**: Multiple operation subsegments
- **Nested Subsegments**: Data processing with validation and transformation
- **Annotations**: Custom metadata for filtering and searching
- **Metadata**: Detailed operation information

## Example Response

```json
{
  "traceId": "1-67890abcdef-1234567890abcdef",
  "operations": [
    { "name": "Database Query", "duration": "50ms", "status": "success" },
    { "name": "External API Call", "duration": "120ms", "status": "success" },
    { "name": "Data Processing", "duration": "70ms", "subOperations": ["Validation", "Transformation"], "status": "success" },
    { "name": "Cache Operation", "duration": "5ms", "status": "success", "cacheHit": true },
    { "name": "Error Handling Demo", "duration": "20ms", "status": "handled", "errorHandled": true }
  ],
  "totalDuration": "~265ms",
  "segmentId": "abc123",
  "instructions": [...]
}
```

## Troubleshooting

If the endpoint returns "Cannot GET /demo/xray":
1. Restart the backend server to pick up the new code
2. Verify X-Ray is enabled: `curl http://localhost:5000/health/xray`
3. Check server logs for any errors

## Other X-Ray Endpoints

- `GET /health/xray` - X-Ray configuration and status
- `GET /test/xray` - Simple test trace
- `GET /test/xray/daemon` - Test daemon connectivity

