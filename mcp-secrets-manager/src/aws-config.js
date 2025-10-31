import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { fromEnv, fromIni } from '@aws-sdk/credential-providers';

/**
 * AWS Secrets Manager configuration and client initialization
 */
export class AWSConfig {
  constructor(options = {}) {
    this.region = options.region || process.env.AWS_REGION || 'us-east-1';
    this.profile = options.profile || process.env.AWS_PROFILE;
    this.accessKeyId = options.accessKeyId || process.env.AWS_ACCESS_KEY_ID;
    this.secretAccessKey = options.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;
    this.sessionToken = options.sessionToken || process.env.AWS_SESSION_TOKEN;
  }

  /**
   * Create and configure AWS Secrets Manager client
   */
  createClient() {
    const clientConfig = {
      region: this.region
    };

    // Configure credentials based on available authentication methods
    if (this.accessKeyId && this.secretAccessKey) {
      // Use direct credentials (access keys)
      clientConfig.credentials = {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
        ...(this.sessionToken && { sessionToken: this.sessionToken })
      };
    } else if (this.profile) {
      // Use AWS profile
      clientConfig.credentials = fromIni({ profile: this.profile });
    } else {
      // Use default credential provider chain (environment, EC2/ECS, etc.)
      clientConfig.credentials = fromEnv();
    }

    return new SecretsManagerClient(clientConfig);
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    const errors = [];

    if (!this.region) {
      errors.push('AWS region is required');
    }

    // Check if any authentication method is available
    const hasDirectCredentials = this.accessKeyId && this.secretAccessKey;
    const hasProfile = this.profile;
    const hasEnvCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

    if (!hasDirectCredentials && !hasProfile && !hasEnvCredentials) {
      errors.push('No AWS credentials found. Please provide access keys, profile, or configure environment variables');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get configuration summary (for debugging, excludes sensitive data)
   */
  getConfigSummary() {
    return {
      region: this.region,
      profile: this.profile || 'default',
      hasAccessKeyId: !!this.accessKeyId,
      hasSecretAccessKey: !!this.secretAccessKey,
      hasSessionToken: !!this.sessionToken,
      credentialSource: this.accessKeyId ? 'direct' : (this.profile ? 'profile' : 'environment')
    };
  }
}