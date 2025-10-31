# AWS Secrets Manager MCP CLI

A comprehensive MCP (Model Context Protocol) server and CLI tool for managing AWS Secrets Manager. This tool provides both an MCP server for integration with Claude and other AI assistants, as well as a standalone CLI for interactive secret management.

## Features

- 🔐 **Secure Authentication**: Support for AWS profiles, access keys, and environment variables
- 🛠️ **Complete Secret Management**: Create, read, update, delete, and list secrets
- 🔍 **Advanced Search**: Search secrets by name patterns and tags
- 🎯 **Todo App Integration**: Quick setup for your Todo App secrets
- 🌐 **MCP Server**: Full integration with Claude Desktop and other MCP clients
- 💻 **Interactive CLI**: User-friendly command-line interface
- 🔒 **Security-First**: Built-in validation and error handling
- 📝 **Comprehensive Logging**: Detailed operation feedback

## Installation

1. Navigate to the MCP Secrets Manager directory:
```bash
cd mcp-secrets-manager
```

2. Install dependencies:
```bash
npm install
```

3. Make the CLI executable (optional):
```bash
chmod +x src/cli.js
```

## Quick Start

### 1. Interactive Mode

Start the interactive CLI for guided secret management:

```bash
node src/cli.js interactive
```

### 2. Quick Todo App Setup

Automatically set up secrets for your Todo App:

```bash
node src/cli.js setup-todo
```

### 3. MCP Server Mode

Start the MCP server for Claude integration:

```bash
node src/cli.js server --region us-east-1
```

Or with access keys:

```bash
node src/cli.js server --region us-east-1 --access-key-id YOUR_KEY --secret-access-key YOUR_SECRET
```

## CLI Commands

### Interactive Mode

```bash
# Start interactive mode
node src/cli.js interactive
# or
node src/cli.js i
```

### Server Mode

```bash
# Start MCP server (will prompt for credentials)
node src/cli.js server

# Start with specific region
node src/cli.js server --region us-west-2

# Start with AWS profile
node src/cli.js server --profile my-profile

# Start with access keys
node src/cli.js server --access-key-id AKIA... --secret-access-key ...
```

### Todo App Setup

```bash
# Quick setup for Todo App secrets
node src/cli.js setup-todo

# With specific region
node src/cli.js setup-todo --region us-east-1
```

### Initialize AWS

```bash
# Initialize with AWS profile
node src/cli.js init --profile default

# Initialize with access keys
node src/cli.js init --access-key-id AKIA... --secret-access-key ...

# Initialize with specific region
node src/cli.js init --region us-east-1
```

### List Secrets

```bash
# List all secrets
node src/cli.js list

# List with name pattern filter
node src/cli.js list --pattern "todoapp/*"

# List including deleted secrets
node src/cli.js list --include-deleted

# List by tag
node src/cli.js list --tag "environment:production"
```

### Get Secret

```bash
# Get secret metadata (value hidden)
node src/cli.js get todoapp/jwt/secret

# Get and show actual secret value
node src/cli.js get todoapp/jwt/secret --show

# Get specific version
node src/cli.js get todoapp/jwt/secret --version AWSPREVIOUS
```

### Create Secret

```bash
# Create from command line
node src/cli.js create my-secret --value "my-secret-value" --description "My secret"

# Create from file
node src/cli.js create my-secret --file ./secret.txt

# Create JSON secret
node src/cli.js create db-config --value '{"host":"localhost","port":5432}' --json --description "Database config"
```

## MCP Server Usage

### Claude Desktop Integration

1. Add the MCP server to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "aws-secrets-manager": {
      "command": "node",
      "args": ["/path/to/mcp-secrets-manager/src/index.js"],
      "env": {
        "AWS_REGION": "us-east-1",
        "AWS_PROFILE": "your-profile"
      }
    }
  }
}
```

2. Restart Claude Desktop

3. Available MCP tools:
   - `init_aws`: Initialize AWS credentials
   - `list_secrets`: List all secrets with filtering
   - `get_secret`: Get secret value
   - `create_secret`: Create new secret
   - `update_secret`: Update existing secret
   - `delete_secret`: Delete secret
   - `describe_secret`: Get secret metadata
   - `search_secrets`: Search secrets by pattern

### Example MCP Usage

```
User: Initialize AWS and list all secrets for my todo app

Assistant: I'll help you initialize AWS and list your todo app secrets.

[Uses init_aws tool with your credentials]

[Uses list_secrets tool with filter for "todoapp/*"]

Found 2 secrets:
1. todoapp/database/credentials - Database credentials for todo application
2. todoapp/jwt/secret - JWT signing secret

Would you like me to get the value of any of these secrets or help you create new ones?
```

## Configuration

### Environment Variables

- `AWS_REGION`: AWS region (default: us-east-1)
- `AWS_PROFILE`: AWS profile name
- `AWS_ACCESS_KEY_ID`: AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key
- `AWS_SESSION_TOKEN`: AWS session token (for temporary credentials)

### AWS Profiles

Create or update `~/.aws/credentials`:

```ini
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY

[my-profile]
aws_access_key_id = ANOTHER_ACCESS_KEY_ID
aws_secret_access_key = ANOTHER_SECRET_ACCESS_KEY
```

### AWS Configuration

Create or update `~/.aws/config`:

```ini
[default]
region = us-east-1

[profile my-profile]
region = us-west-2
```

## Todo App Integration

This MCP server is designed to work seamlessly with your Todo App's Secrets Manager setup.

### Required Secrets

1. **Database Credentials**: `todoapp/database/credentials`
   ```json
   {
     "username": "your_db_user",
     "password": "your_secure_password",
     "host": "your-rds-endpoint.region.rds.amazonaws.com",
     "port": 5432,
     "database": "todoapp"
   }
   ```

2. **JWT Secret**: `todoapp/jwt/secret`
   ```
   your-super-secure-jwt-secret-key
   ```

### Environment Variables for Your App

```bash
DB_SECRET_ARN=arn:aws:secretsmanager:region:account-id:secret:todoapp/database/credentials-xxxxx
JWT_SECRET_ARN=arn:aws:secretsmanager:region:account-id:secret:todoapp/jwt/secret-xxxxx
AWS_REGION=us-east-1
```

### Code Integration Example

```javascript
// In your backend/src/config/database.js
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getDatabaseConfig() {
  const secret = await secretsManager.getSecretValue({
    SecretId: process.env.DB_SECRET_ARN
  }).promise();

  return JSON.parse(secret.SecretString);
}
```

## Security Best Practices

1. **Use IAM Roles**: Prefer IAM roles over access keys when running on AWS infrastructure
2. **Least Privilege**: Grant only necessary permissions to your IAM roles/users
3. **Enable Rotation**: Use automatic rotation for database credentials
4. **Monitor Access**: Use CloudTrail to monitor secret access
5. **Secure Storage**: Never commit secrets to version control
6. **Use Environment-Specific Secrets**: Separate secrets for dev, staging, and production

### Required IAM Permissions

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
        "arn:aws:secretsmanager:region:account-id:secret:todoapp/*"
      ]
    }
  ]
}
```

## Development

### Running Tests

```bash
npm test
```

### Development Mode

```bash
# Watch mode for development
npm run dev
```

### Project Structure

```
mcp-secrets-manager/
├── src/
│   ├── index.js           # MCP server entry point
│   ├── cli.js             # CLI interface
│   ├── mcp-server.js      # MCP server implementation
│   ├── aws-config.js      # AWS configuration
│   ├── secrets-operations.js # Secrets Manager operations
│   └── utils/
│       └── error-handler.js   # Error handling utilities
├── test/
│   └── test.js            # Test suite
├── package.json
└── README.md
```

## Troubleshooting

### Common Issues

1. **Credentials Not Found**
   ```
   Error: AWS credentials not found or invalid
   ```
   Solution: Configure AWS credentials using environment variables, AWS profile, or access keys.

2. **Permission Denied**
   ```
   Error: You do not have permission to perform this action
   ```
   Solution: Check your IAM permissions and ensure you have access to Secrets Manager.

3. **Secret Not Found**
   ```
   Error: Secret 'my-secret' not found
   ```
   Solution: Verify the secret name exists and you're in the correct region.

4. **Network Timeout**
   ```
   Error: Request timed out
   ```
   Solution: Check your internet connection and try again.

### Debug Mode

Enable debug logging by setting the DEBUG environment variable:

```bash
DEBUG=aws-secrets-manager node src/cli.js list
```

### Getting Help

- Check the AWS Secrets Manager documentation: https://docs.aws.amazon.com/secretsmanager/
- Review the IAM permissions guide: https://docs.aws.amazon.com/IAM/latest/UserGuide/
- For issues specific to this tool, check the error messages and ensure proper AWS configuration.

## License

MIT License - see LICENSE file for details.