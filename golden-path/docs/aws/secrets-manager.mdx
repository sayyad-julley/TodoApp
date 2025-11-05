# AWS Secrets Manager Setup Guide

This guide walks you through setting up AWS Secrets Manager for secure credential storage in your golden path project.

## Prerequisites

- AWS account with appropriate permissions
- AWS CLI installed and configured (`aws configure`)
- IAM permissions for Secrets Manager operations

## Step-by-Step Instructions

### 1. Create Secrets

#### Database Credentials

Create a secret for your database connection:

```bash
aws secretsmanager create-secret \
  --name todoapp/database/credentials \
  --description "Database credentials for todo application" \
  --secret-string '{
    "username": "your_db_user",
    "password": "your_secure_password",
    "host": "your-rds-endpoint.region.rds.amazonaws.com",
    "port": 5432,
    "database": "todoapp"
  }'
```

#### JWT Secret

Create a secret for JWT signing:

```bash
aws secretsmanager create-secret \
  --name todoapp/jwt/secret \
  --description "JWT signing secret" \
  --secret-string "your-super-secure-jwt-secret-key"
```

### 2. Using the Setup Script

The template includes a setup script that automates secret creation:

```bash
cd .aws/scripts
chmod +x setup-secrets.sh
./setup-secrets.sh
```

The script will:
- Prompt for database credentials
- Generate a secure JWT secret
- Create secrets in AWS Secrets Manager
- Output secret ARNs for configuration

**Location**: `/golden-path/templates/fullstack-todo/.aws/scripts/setup-secrets.sh`

### 3. IAM Permissions

Your application's IAM role needs permissions to read secrets:

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
        "arn:aws:secretsmanager:region:account-id:secret:todoapp/*"
      ]
    }
  ]
}
```

### 4. Accessing Secrets from Application

#### Backend Configuration

Reference the database configuration file:

**Location**: `/golden-path/templates/fullstack-todo/backend/src/config/database.js`

```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getDatabaseConfig() {
  const secret = await secretsManager.getSecretValue({
    SecretId: process.env.DB_SECRET_ARN
  }).promise();
  
  return JSON.parse(secret.SecretString);
}
```

#### JWT Configuration

Reference the JWT configuration file:

**Location**: `/golden-path/templates/fullstack-todo/backend/src/config/jwt.js`

```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getJWTSecret() {
  const secret = await secretsManager.getSecretValue({
    SecretId: process.env.JWT_SECRET_ARN
  }).promise();
  
  return secret.SecretString;
}
```

### 5. Environment Variables

Set these environment variables in your deployment:

```bash
DB_SECRET_ARN=arn:aws:secretsmanager:region:account-id:secret:todoapp/database/credentials-xxxxx
JWT_SECRET_ARN=arn:aws:secretsmanager:region:account-id:secret:todoapp/jwt/secret-xxxxx
AWS_REGION=us-east-1
```

### 6. Rotation Policies

Enable automatic rotation for database credentials:

```bash
aws secretsmanager enable-rotation \
  --secret-id todoapp/database/credentials \
  --rotation-lambda-arn arn:aws:lambda:region:account-id:function:rotate-db-credentials
```

### 7. Best Practices

- **Never commit secrets** to version control
- **Use separate secrets** for different environments (dev, staging, prod)
- **Enable rotation** for long-lived credentials
- **Restrict IAM permissions** using least privilege principle
- **Monitor secret access** using CloudTrail
- **Use secret naming conventions** (e.g., `app/service/secret-name`)

### 8. Cost Considerations

- **Secrets Manager pricing**: $0.40 per secret per month
- **API calls**: $0.05 per 10,000 API calls
- **Consider costs** when creating many secrets
- **Use Parameter Store** for non-sensitive configuration (free tier available)

### 9. Troubleshooting

#### Common Issues

**Permission Denied**
- Verify IAM role has `secretsmanager:GetSecretValue` permission
- Check resource ARN matches the secret ARN exactly

**Secret Not Found**
- Verify secret name/ARN is correct
- Ensure secret exists in the same region as your application
- Check CloudTrail logs for access attempts

**Timeout Errors**
- Verify VPC endpoint is configured if using private subnets
- Check security group rules allow outbound HTTPS (443)
- Ensure NAT Gateway is configured if needed

**Cost Concerns**
- Consider AWS Systems Manager Parameter Store for non-sensitive configs
- Review secret access patterns to optimize API calls
- Use secret caching in application code

## Additional Resources

- [AWS Secrets Manager Documentation](https://docs.aws.amazon.com/secretsmanager/)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Secret Rotation](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html)
