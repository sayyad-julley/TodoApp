# AWS X-Ray and GuardDuty Setup Guide

This guide covers setting up AWS X-Ray for distributed tracing and AWS GuardDuty for threat detection in your golden path project.

## AWS X-Ray Setup

### Purpose

AWS X-Ray provides distributed tracing and performance monitoring, helping you:
- Understand request flows across services
- Identify performance bottlenecks
- Debug production issues
- Monitor service dependencies

### Installation

#### Backend Setup

Install the X-Ray SDK in your backend:

```bash
cd backend
npm install aws-xray-sdk-core aws-xray-sdk-express
```

**Location**: `/golden-path/templates/fullstack-todo/backend/server.js`

#### Instrumentation

Add X-Ray middleware to your Express application:

```javascript
const AWSXRay = require('aws-xray-sdk-core');
const express = require('express');
const xrayExpress = require('aws-xray-sdk-express');

const app = express();

// Enable X-Ray
app.use(xrayExpress.openSegment('TodoApp'));

// Your routes here
app.use('/api', routes);

// Close segments
app.use(xrayExpress.closeSegment());
```

### Configuring X-Ray Daemon

#### Local Development

Download and run the X-Ray daemon locally:

```bash
# macOS
curl https://s3.dualstack.us-east-1.amazonaws.com/aws-xray-assets.us-east-1/xray-daemon/aws-xray-daemon-macos-3.x.zip -o xray-daemon.zip
unzip xray-daemon.zip
sudo ./xray-daemon -n us-east-1

# Linux
wget https://s3.dualstack.us-east-1.amazonaws.com/aws-xray-assets.us-east-1/xray-daemon/aws-xray-daemon-linux-amd64-3.x.zip
unzip aws-xray-daemon-linux-amd64-3.x.zip
sudo ./xray-daemon -n us-east-1
```

#### Container Deployment

For ECS deployments, the X-Ray daemon is typically deployed as a sidecar container. The CloudFormation template handles this automatically.

### Instrumenting Components

#### Express Middleware

X-Ray automatically captures Express middleware, but you can add custom segments:

```javascript
const AWSXRay = require('aws-xray-sdk-core');

app.get('/api/todos', async (req, res) => {
  const segment = AWSXRay.getSegment();
  const subsegment = segment.addNewSubsegment('database-query');
  
  try {
    const todos = await db.query('SELECT * FROM todos');
    subsegment.close();
    res.json(todos);
  } catch (error) {
    subsegment.addError(error);
    subsegment.close();
    throw error;
  }
});
```

#### Database Calls

Capture database queries:

```javascript
const AWSXRay = require('aws-xray-sdk-core');
const pg = require('pg');

const pgXray = AWSXRay.capturePostgres(pg);
const client = new pgXray.Client(config);
```

### Viewing Traces

1. Open AWS X-Ray Console
2. Navigate to "Service Map" to see service dependencies
3. Use "Traces" to view individual request traces
4. Filter by service name, time range, or error status

### Setting Up Alarms

Create CloudWatch alarms for X-Ray metrics:

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name todoapp-high-latency \
  --alarm-description "Alert when API latency exceeds 1 second" \
  --metric-name Latency \
  --namespace AWS/XRay \
  --statistic Average \
  --period 300 \
  --threshold 1000 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1
```

## AWS GuardDuty Setup

### Purpose

AWS GuardDuty provides intelligent threat detection:
- Monitors AWS account activity
- Detects unauthorized access attempts
- Identifies compromised instances
- Alerts on suspicious API calls

### Enabling GuardDuty

#### Via AWS Console

1. Navigate to AWS GuardDuty in the console
2. Click "Enable GuardDuty"
3. Review and accept the service terms
4. GuardDuty begins monitoring immediately

#### Via CloudFormation

The monitoring CloudFormation template includes GuardDuty setup:

**Location**: `/golden-path/templates/fullstack-todo/.aws/cloudformation/monitoring.yml`

```bash
aws cloudformation create-stack \
  --stack-name todoapp-monitoring \
  --template-body file://.aws/cloudformation/monitoring.yml \
  --capabilities CAPABILITY_NAMED_IAM
```

### Configuring Findings Notifications

#### SNS Topic Setup

Create an SNS topic for GuardDuty findings:

```bash
aws sns create-topic --name guardduty-findings

# Subscribe to topic
aws sns subscribe \
  --topic-arn arn:aws:sns:region:account-id:guardduty-findings \
  --protocol email \
  --notification-endpoint your-email@example.com
```

#### CloudWatch Events Rule

Create an event rule to send findings to SNS:

```bash
aws events put-rule \
  --name guardduty-findings-rule \
  --event-pattern '{"source":["aws.guardduty"]}' \
  --state ENABLED

aws events put-targets \
  --rule guardduty-findings-rule \
  --targets "Id"="1","Arn"="arn:aws:sns:region:account-id:guardduty-findings"
```

### Integrating with Security Incident Response

1. **Create an Incident Response Playbook**
   - Document response procedures for different finding types
   - Define escalation paths
   - Set up automated remediation where appropriate

2. **Integrate with SIEM**
   - Forward GuardDuty findings to your SIEM
   - Create correlation rules
   - Set up automated responses

3. **Regular Reviews**
   - Review findings weekly
   - Tune detection rules
   - Update response procedures

### Best Practices

- **Enable GuardDuty in all regions** you use
- **Review findings regularly** (daily for production)
- **Set up automated responses** for common threats
- **Integrate with incident response** workflows
- **Monitor GuardDuty costs** (first 30 days free, then $0.10 per GB analyzed)
- **Keep data sources enabled** (CloudTrail, VPC Flow Logs, DNS logs)

### Common Finding Types

**Unauthorized API Calls**
- Unusual API calls from new IP addresses
- Attempts to access restricted resources
- API calls from unusual geolocations

**Compromised Instances**
- Communication with known malicious IPs
- Unusual outbound traffic patterns
- Instance compromise indicators

**Reconnaissance**
- Port scanning attempts
- Brute force login attempts
- EC2 instance exposed to the internet

## Cost Considerations

### X-Ray Costs

- **Free Tier**: First 100,000 traces per month free
- **Traces**: $5.00 per million traces after free tier
- **Retrieval**: $0.50 per million traces retrieved
- **Storage**: $0.0300000000 per GB per month

### GuardDuty Costs

- **Free Trial**: First 30 days free
- **VPC Flow Logs Analysis**: $0.10 per GB analyzed
- **CloudTrail Events**: $0.10 per GB analyzed
- **DNS Logs**: $0.10 per GB analyzed

**Tip**: Enable only the data sources you need to control costs.

## Troubleshooting

### X-Ray Issues

**No Traces Appearing**
- Verify X-Ray daemon is running
- Check IAM permissions for X-Ray PutTraceSegments
- Verify service name matches in traces
- Check CloudWatch logs for X-Ray errors

**High Latency**
- Review X-Ray sampling rules (reduce sampling rate if needed)
- Check daemon connectivity
- Verify network connectivity to X-Ray service

### GuardDuty Issues

**No Findings**
- Verify GuardDuty is enabled in your region
- Check that data sources are enabled
- Ensure CloudTrail is enabled and logging
- Verify VPC Flow Logs are enabled if monitoring network traffic

**Too Many False Positives**
- Review and suppress findings from trusted sources
- Create filter rules for known-good IPs
- Adjust sensitivity thresholds
- Use trusted IP lists

## Additional Resources

- [AWS X-Ray Documentation](https://docs.aws.amazon.com/xray/)
- [AWS GuardDuty Documentation](https://docs.aws.amazon.com/guardduty/)
- [X-Ray Best Practices](https://docs.aws.amazon.com/xray/latest/devguide/xray-best-practices.html)
- [GuardDuty Best Practices](https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_best-practices.html)
