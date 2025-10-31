# MCP Server Setup Guide

This guide walks you through setting up the AWS Secrets Manager MCP server with Claude Desktop.

## Prerequisites

1. **AWS Account**: Active AWS account with Secrets Manager access
2. **IAM Permissions**: Appropriate permissions for Secrets Manager operations
3. **Node.js**: Version 18 or higher
4. **Claude Desktop**: Installed and configured

## Step 1: Install Dependencies

Navigate to the MCP server directory and install dependencies:

```bash
cd mcp-secrets-manager
npm install
```

## Step 2: Configure AWS Credentials

Choose one of the following authentication methods:

### Option A: AWS Profile (Recommended)

Configure AWS CLI with your profile:

```bash
aws configure --profile your-profile-name
```

This will prompt for:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (use `us-east-1` for this project)
- Default output format

### Option B: Environment Variables

Set environment variables:

```bash
export AWS_ACCESS_KEY_ID=your_access_key_id
export AWS_SECRET_ACCESS_KEY=your_secret_access_key
export AWS_REGION=us-east-1
```

### Option C: Direct Configuration in Claude Desktop

Add credentials directly to the MCP server configuration (less secure).

## Step 3: Configure Claude Desktop

1. Locate your Claude Desktop configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the AWS Secrets Manager MCP server to your configuration:

```json
{
  "mcpServers": {
    "aws-secrets-manager": {
      "command": "node",
      "args": ["/Users/julley/TodoApp-GoldenPath/mcp-secrets-manager/src/index.js"],
      "env": {
        "AWS_REGION": "us-east-1",
        "AWS_PROFILE": "your-profile-name"
      }
    }
  }
}
```

**Important**: Update the path to match your actual project location.

### Alternative Configuration (without AWS profile)

If you prefer to use access keys directly:

```json
{
  "mcpServers": {
    "aws-secrets-manager": {
      "command": "node",
      "args": ["/Users/julley/TodoApp-GoldenPath/mcp-secrets-manager/src/index.js"],
      "env": {
        "AWS_REGION": "us-east-1",
        "AWS_ACCESS_KEY_ID": "your_access_key_id",
        "AWS_SECRET_ACCESS_KEY": "your_secret_access_key"
      }
    }
  }
}
```

## Step 4: Restart Claude Desktop

Completely quit and restart Claude Desktop to load the new MCP server configuration.

## Step 5: Verify Installation

1. Open Claude Desktop
2. Start a new conversation
3. Try initializing the AWS connection:

```
User: Help me initialize the AWS Secrets Manager connection

Assistant: I'll help you initialize the AWS Secrets Manager connection. Let me start by setting up the AWS credentials.

[Claude will use the init_aws tool to verify the connection]

Great! The AWS Secrets Manager is now connected. I can help you:
- List all your secrets
- Get specific secret values
- Create new secrets
- Update existing secrets
- Delete secrets

What would you like to do with your secrets?
```

## Step 6: Test with Todo App Secrets

Try managing your Todo App secrets:

```
User: List all secrets related to my todo app

Assistant: I'll search for secrets related to your todo app.

[Claude will use list_secrets tool with appropriate filters]

Found the following todo app secrets:
1. todoapp/database/credentials - Database credentials for todo application
2. todoapp/jwt/secret - JWT signing secret

Would you like me to retrieve the values of any of these secrets or help you create new ones?
```

## Available MCP Tools

Once configured, Claude will have access to these tools:

1. **init_aws**: Initialize AWS connection
2. **list_secrets**: List secrets with optional filtering
3. **get_secret**: Retrieve a specific secret value
4. **create_secret**: Create a new secret
5. **update_secret**: Update an existing secret
6. **delete_secret**: Delete a secret
7. **describe_secret**: Get secret metadata without value
8. **search_secrets**: Search secrets by name pattern

## Security Considerations

### Best Practices

1. **Use AWS Profiles**: Configure credentials using AWS profiles rather than hardcoding keys
2. **Least Privilege**: Grant only necessary IAM permissions
3. **Region Specificity**: Use the correct AWS region (us-east-1 for this project)
4. **Credential Rotation**: Regularly rotate your AWS credentials

### IAM Permissions

Ensure your AWS credentials have these minimum permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret",
        "secretsmanager:ListSecrets",
        "secretsmanager:CreateSecret",
        "secretsmanager:UpdateSecret",
        "secretsmanager:DeleteSecret"
      ],
      "Resource": [
        "arn:aws:secretsmanager:us-east-1:account-id:secret:todoapp/*"
      ]
    }
  ]
}
```

## Troubleshooting

### Common Issues

#### 1. "AWS credentials not found or invalid"

**Solution**: Verify your AWS credentials are properly configured:
- Check AWS profile configuration: `aws configure list --profile your-profile`
- Verify environment variables are set correctly
- Ensure credentials have the required permissions

#### 2. "Permission denied" errors

**Solution**: Check your IAM permissions:
- Verify the user/role has Secrets Manager permissions
- Ensure the permissions cover the correct region and resources
- Check if any specific resource restrictions are blocking access

#### 3. "Secret not found" errors

**Solution**:
- Verify the secret name is correct
- Ensure you're looking in the right AWS region (us-east-1)
- Check if the secret exists in your AWS account

#### 4. MCP server not loading

**Solution**:
- Verify the file path in your Claude configuration is correct
- Check that Node.js is installed and accessible
- Ensure all dependencies are installed (`npm install`)
- Restart Claude Desktop completely

### Debug Mode

Enable debug logging by setting the DEBUG environment variable in your Claude configuration:

```json
{
  "mcpServers": {
    "aws-secrets-manager": {
      "command": "node",
      "args": ["/path/to/mcp-secrets-manager/src/index.js"],
      "env": {
        "AWS_REGION": "us-east-1",
        "AWS_PROFILE": "your-profile",
        "DEBUG": "aws-secrets-manager"
      }
    }
  }
}
```

## Integration Examples

### Example 1: Setting up Todo App secrets

```
User: I need to set up secrets for my todo app. Can you help me create the database credentials and JWT secret?

Assistant: I'll help you set up the Todo App secrets. Let me create the required secrets for you.

[Claude will use create_secret tool to create:
1. todoapp/database/credentials with your database details
2. todoapp/jwt/secret with a secure random key]

I've created both secrets for your Todo App:
- Database credentials: todoapp/database/credentials
- JWT secret: todoapp/jwt/secret

You'll need to update your application's environment variables with:
- DB_SECRET_ARN=[the ARN I'll provide]
- JWT_SECRET_ARN=[the ARN I'll provide]
- AWS_REGION=us-east-1

Would you like me to show you the ARNs for these secrets?
```

### Example 2: Retrieving and using secrets

```
User: Get my database credentials for the todo app

Agent: I'll retrieve your database credentials from AWS Secrets Manager.

[Claude uses get_secret tool]

I've retrieved your database credentials. For security reasons, here's how you can use them in your application:

In your backend/src/config/database.js:
```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager({ region: 'us-east-1' });

async function getDatabaseConfig() {
  const secret = await secretsManager.getSecretValue({
    SecretId: process.env.DB_SECRET_ARN
  }).promise();

  return JSON.parse(secret.SecretString);
}
```

Remember to set the DB_SECRET_ARN environment variable in your application.
```

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your AWS credentials and permissions
3. Ensure Claude Desktop is properly configured
4. Check that all dependencies are installed

For additional help, you can also use the standalone CLI:

```bash
cd mcp-secrets-manager
node src/cli.js interactive
```