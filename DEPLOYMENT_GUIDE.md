# AWS Secrets Manager Deployment Guide

This guide provides everything you need to deploy your Todo App and Backstage with AWS Secrets Manager integration.

## 🎯 Overview

Your secrets are now created in AWS Secrets Manager:

- **Todo App Secrets**:
  - `todoapp/jwt/secret` - JWT signing secret
  - `todoapp/database/credentials` - Database connection credentials

- **Backstage Secrets**:
  - `backstage/backend/secret` - Backend shared secret
  - `backstage/github/token` - GitHub access token (placeholder)
  - `backstage/traycer/api-key` - Traycer API key (placeholder)

## 📋 Environment Variables

### Production Environment

Copy these environment variables to your production deployment:

```bash
# AWS Configuration
AWS_REGION=us-east-1

# Todo App Secrets Manager ARNs
JWT_SECRET_ARN=arn:aws:secretsmanager:us-east-1:239083306280:secret:todoapp/jwt/secret-W1SvYU
DB_SECRET_ARN=arn:aws:secretsmanager:us-east-1:239083306280:secret:todoapp/database/credentials-6xWgqS

# Backstage Secrets Manager ARNs
GITHUB_TOKEN_ARN=arn:aws:secretsmanager:us-east-1:239083306280:secret:backstage/github/token-tmDRmK
TRAYCER_API_KEY_ARN=arn:aws:secretsmanager:us-east-1:239083306280:secret:backstage/traycer/api-key-TmNw9K
BACKEND_SECRET_ARN=arn:aws:secretsmanager:us-east-1:239083306280:secret:backstage/backend/secret-JC4KlJ

# Other App Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com
```

### Development Environment (Optional)

For local development, you can use direct environment variables:

```bash
# Direct secrets (only for development)
JWT_SECRET=your_jwt_secret_here
MONGO_URI=mongodb://localhost:27017/todoapp

# Backstage development secrets
GITHUB_TOKEN=your_github_token_here
TRAYCER_API_KEY=your_traycer_api_key_here
BACKEND_SECRET=your_backend_secret_here
```

## 🔐 IAM Permissions

### Required IAM Policy

Your deployment runtime role needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": [
        "arn:aws:secretsmanager:us-east-1:239083306280:secret:todoapp/*",
        "arn:aws:secretsmanager:us-east-1:239083306280:secret:backstage/*"
      ]
    }
  ]
}
```

### Create IAM Role

1. Go to AWS IAM Console
2. Create a new role with the policy above
3. Attach the role to your deployment (EC2, ECS, Lambda, etc.)

## 🚀 Deployment Steps

### 1. Update Placeholders

Before deploying, update the placeholder secrets:

```bash
# Update GitHub token
aws secretsmanager update-secret \
  --secret-id backstage/github/token \
  --secret-string "your_actual_github_token" \
  --region us-east-1

# Update Traycer API key
aws secretsmanager update-secret \
  --secret-id backstage/traycer/api-key \
  --secret-string "your_actual_traycer_api_key" \
  --region us-east-1

# Update database credentials if needed
aws secretsmanager update-secret \
  --secret-id todoapp/database/credentials \
  --secret-string '{"username":"your_db_user","password":"your_secure_password","host":"your-db-host","port":27017,"database":"todoapp"}' \
  --region us-east-1
```

### 2. Install Dependencies

```bash
# In your backend directory
npm install aws-sdk

# For Todo App backend
cd golden-path/templates/fullstack-todo/backend
npm install aws-sdk
```

### 3. Deploy Application

Deploy with your preferred method (Docker, ECS, EC2, etc.) with the environment variables set.

## 📱 Application Integration

### Todo App Backend

Your backend is already configured to use Secrets Manager:

```javascript
// Database configuration
import { connectToDatabase } from './config/database.js';
// Automatically tries Secrets Manager first, falls back to MONGO_URI

// JWT configuration
import { generateToken, verifyToken } from './utils/jwt.js';
// Automatically tries Secrets Manager first, falls back to JWT_SECRET
```

### Backstage Configuration

Update your `app-config.yaml` to reference secrets:

```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}

traycer:
  apiUrl: ${TRAYCER_API_URL:-https://api.traycer.ai}
  apiKey: ${TRAYCER_API_KEY}

# auth:
#   keys:
#     - secret: ${BACKEND_SECRET}
```

## 🔍 Testing the Integration

### 1. Test Todo App

```bash
# Test database connection
node -e "
const { connectToDatabase } = require('./config/database.js');
connectToDatabase().then(() => console.log('✅ Database connection successful'));
"

# Test JWT functionality
node -e "
const { generateToken } = require('./utils/jwt.js');
generateToken({ userId: 'test' }).then(token => console.log('✅ JWT generation successful'));
"
```

### 2. Test Backstage

```bash
# Test GitHub token
aws secretsmanager get-secret-value \
  --secret-id backstage/github/token \
  --region us-east-1 \
  --query SecretString \
  --output text
```

## 🛠️ Management Operations

### Update Secrets

```bash
# Update JWT secret
aws secretsmanager update-secret \
  --secret-id todoapp/jwt/secret \
  --secret-string "new_jwt_secret_here" \
  --region us-east-1

# Update database credentials
aws secretsmanager update-secret \
  --secret-id todoapp/database/credentials \
  --secret-string '{"username":"new_user","password":"new_password","host":"new-host","port":27017,"database":"todoapp"}' \
  --region us-east-1
```

### Rotate Secrets

For critical secrets like database credentials, enable automatic rotation:

```bash
aws secretsmanager rotate-secret \
  --secret-id todoapp/database/credentials \
  --rotation-lambda-arn your-lambda-function-arn \
  --rotation-rules AutomaticallyAfterDays=30 \
  --region us-east-1
```

### Monitor Secret Access

```bash
# Check CloudTrail for secret access
aws logs filter-log-events \
  --log-group-name /aws/cloudtrail/your-cloudtrail-log \
  --filter-pattern "{ $.eventSource = \"secretsmanager.amazonaws.com\" }"
```

## 🔒 Security Best Practices

1. **Use Least Privilege**: Only grant necessary IAM permissions
2. **Enable Rotation**: Set up automatic rotation for database credentials
3. **Monitor Access**: Use CloudTrail to track secret access
4. **Use VPC Endpoints**: For production, use VPC endpoints for Secrets Manager
5. **Encrypt Secrets**: Secrets Manager automatically encrypts all secrets
6. **Regular Audits**: Periodically review access patterns and permissions

## 🚨 Troubleshooting

### Common Issues

1. **"Access Denied"**
   - Verify IAM role has the required permissions
   - Check that the secret ARNs are correct

2. **"Secret Not Found"**
   - Ensure the secret exists in the correct region (us-east-1)
   - Verify the secret name is exact

3. **"Connection Timeout"**
   - Check VPC configuration if using private subnets
   - Verify security group allows outbound HTTPS (443)

4. **"Invalid Token"**
   - Ensure the runtime environment variables are set correctly
   - Verify the IAM role is attached to the deployment

### Debug Mode

Enable debug logging:

```bash
DEBUG=aws-sdk node your-app.js
```

## 📞 Support

For issues with:
- **AWS Secrets Manager**: Check AWS Console and CloudTrail logs
- **Application Integration**: Check application logs and environment variables
- **IAM Permissions**: Verify role policies and attachments

Your secrets are now properly configured and your applications are ready to use AWS Secrets Manager! 🎉