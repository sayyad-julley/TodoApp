import AWS from 'aws-sdk';

// X-Ray will capture this AWS SDK instance when initialized from server.js
// If this file is used independently, it will work without X-Ray capture

/**
 * AWS Secrets Manager integration for the Todo App
 */
export class SecretsManager {
  constructor(region = process.env.AWS_REGION || 'us-east-1') {
    this.client = new AWS.SecretsManager({ region });
  }

  /**
   * Basic validation to detect placeholder/invalid ARNs so we can fall back locally
   */
  isArnUsable(arn) {
    if (!arn) return false;
    // Treat common placeholders / angle-bracket examples as unusable
    if (arn.includes('<') || arn.includes('>')) return false;
    // Rough ARN format check for Secrets Manager
    const arnPattern = /^arn:aws(-[a-z]+)?:secretsmanager:[a-z0-9-]+:\d{12}:secret:[A-Za-z0-9/_+=.@!-]+$/;
    return arnPattern.test(arn);
  }

  /**
   * Get database configuration from AWS Secrets Manager
   */
  async getDatabaseConfig() {
    // Prefer explicit local override for development
    if (process.env.MONGO_URI) {
      return { uri: process.env.MONGO_URI };
    }
    if (!this.isArnUsable(process.env.DB_SECRET_ARN)) {
      // Fallback to environment variables
      return {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/todoapp'
      };
    }

    try {
      const secret = await this.client.getSecretValue({
        SecretId: process.env.DB_SECRET_ARN
      }).promise();

      const credentials = JSON.parse(secret.SecretString);

      let uri;

      // Handle different connection formats
      if (credentials.uri) {
        // Direct URI format (for MongoDB Atlas)
        uri = credentials.uri;
      } else {
        // Individual credential components (for self-hosted MongoDB)
        uri = `mongodb://${credentials.username}:${credentials.password}@${credentials.host}:${credentials.port || 27017}/${credentials.database}`;
      }

      return { uri };
    } catch (error) {
      console.error('Failed to retrieve database credentials from Secrets Manager:', error);
      // Fallback to environment variables instead of throwing when ARN is present but unusable in local/dev
      const fallbackUri = process.env.MONGO_URI || 'mongodb://localhost:27017/todoapp';
      return { uri: fallbackUri };
    }
  }

  /**
   * Get JWT secret from AWS Secrets Manager
   */
  async getJWTSecret() {
    // Prefer explicit local override for development
    if (process.env.JWT_SECRET) {
      return process.env.JWT_SECRET;
    }
    if (!this.isArnUsable(process.env.JWT_SECRET_ARN)) {
      throw new Error('JWT_SECRET is not set and no JWT_SECRET_ARN provided');
    }

    try {
      const secret = await this.client.getSecretValue({
        SecretId: process.env.JWT_SECRET_ARN
      }).promise();

      return secret.SecretString;
    } catch (error) {
      console.error('Failed to retrieve JWT secret from Secrets Manager:', error);
      // Fallback to environment variable instead of throwing when ARN is present but unusable in local/dev
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not set and failed to retrieve from Secrets Manager');
      }
      return process.env.JWT_SECRET;
    }
  }
}

// Create singleton instance
export const secretsManager = new SecretsManager();

// Convenience functions
export const getDatabaseConfig = () => secretsManager.getDatabaseConfig();
export const getJWTSecret = () => secretsManager.getJWTSecret();