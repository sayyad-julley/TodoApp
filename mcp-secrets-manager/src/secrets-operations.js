import {
  ListSecretsCommand,
  GetSecretValueCommand,
  CreateSecretCommand,
  UpdateSecretCommand,
  DeleteSecretCommand,
  RestoreSecretCommand,
  DescribeSecretCommand
} from '@aws-sdk/client-secrets-manager';

/**
 * AWS Secrets Manager operations wrapper
 */
export class SecretsOperations {
  constructor(client) {
    this.client = client;
  }

  /**
   * List all secrets with optional filtering
   */
  async listSecrets(options = {}) {
    const {
      filters = [],
      maxResults = 100,
      nextToken = null,
      includePlannedDeletion = false
    } = options;

    try {
      const command = new ListSecretsCommand({
        Filters: filters,
        MaxResults: maxResults,
        NextToken: nextToken,
        IncludePlannedDeletion: includePlannedDeletion
      });

      const response = await this.client.send(command);

      return {
        secrets: response.SecretList || [],
        nextToken: response.NextToken,
        totalCount: response.SecretList?.length || 0
      };
    } catch (error) {
      throw new Error(`Failed to list secrets: ${error.message}`);
    }
  }

  /**
   * Get secret value by name or ARN
   */
  async getSecretValue(secretId, versionStage = 'AWSCURRENT') {
    try {
      const command = new GetSecretValueCommand({
        SecretId: secretId,
        VersionStage: versionStage
      });

      const response = await this.client.send(command);

      return {
        name: response.Name,
        arn: response.ARN,
        versionId: response.VersionId,
        secretString: response.SecretString,
        secretBinary: response.SecretBinary,
        versionStages: response.VersionStages,
        createdDate: response.CreatedDate
      };
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        throw new Error(`Secret '${secretId}' not found`);
      }
      throw new Error(`Failed to get secret value: ${error.message}`);
    }
  }

  /**
   * Create a new secret
   */
  async createSecret(name, secretValue, options = {}) {
    const {
      description = '',
      tags = [],
      secretString = null,
      secretBinary = null,
      requestRotationType = 'IMMEDIATELY',
      rotationRules = null,
      rotationLambdaARN = null
    } = options;

    try {
      const params = {
        Name: name,
        Description: description,
        Tags: tags
      };

      // Use either secretString or secretBinary
      if (secretString) {
        params.SecretString = secretString;
      } else if (secretBinary) {
        params.SecretBinary = secretBinary;
      } else {
        // Default to secretString if secretValue is provided as string/object
        params.SecretString = typeof secretValue === 'string'
          ? secretValue
          : JSON.stringify(secretValue);
      }

      // Add rotation settings if provided
      if (rotationRules) {
        params.RotationRules = rotationRules;
      }
      if (rotationLambdaARN) {
        params.RotationLambdaARN = rotationLambdaARN;
      }

      const command = new CreateSecretCommand(params);
      const response = await this.client.send(command);

      return {
        name: response.Name,
        arn: response.ARN,
        versionId: response.VersionId
      };
    } catch (error) {
      if (error.name === 'ResourceExistsException') {
        throw new Error(`Secret '${name}' already exists`);
      }
      throw new Error(`Failed to create secret: ${error.message}`);
    }
  }

  /**
   * Update an existing secret
   */
  async updateSecret(secretId, secretValue, options = {}) {
    const {
      description = null,
      secretString = null,
      secretBinary = null,
      versionStages = ['AWSCURRENT']
    } = options;

    try {
      const params = {
        SecretId: secretId
      };

      // Use either secretString or secretBinary
      if (secretString !== null) {
        params.SecretString = secretString;
      } else if (secretBinary !== null) {
        params.SecretBinary = secretBinary;
      } else {
        // Default to secretString if secretValue is provided as string/object
        params.SecretString = typeof secretValue === 'string'
          ? secretValue
          : JSON.stringify(secretValue);
      }

      if (description) {
        params.Description = description;
      }

      if (versionStages) {
        params.VersionStages = versionStages;
      }

      const command = new UpdateSecretCommand(params);
      const response = await this.client.send(command);

      return {
        name: response.Name,
        arn: response.ARN,
        versionId: response.VersionId
      };
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        throw new Error(`Secret '${secretId}' not found`);
      }
      throw new Error(`Failed to update secret: ${error.message}`);
    }
  }

  /**
   * Delete a secret
   */
  async deleteSecret(secretId, options = {}) {
    const {
      forceDeleteWithoutRecovery = false,
      recoveryWindowInDays = 30
    } = options;

    try {
      const params = {
        SecretId: secretId
      };

      if (forceDeleteWithoutRecovery) {
        params.ForceDeleteWithoutRecovery = true;
      } else {
        params.RecoveryWindowInDays = recoveryWindowInDays;
      }

      const command = new DeleteSecretCommand(params);
      const response = await this.client.send(command);

      return {
        name: response.Name,
        arn: response.ARN,
        deletionDate: response.DeletionDate
      };
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        throw new Error(`Secret '${secretId}' not found`);
      }
      throw new Error(`Failed to delete secret: ${error.message}`);
    }
  }

  /**
   * Restore a previously deleted secret
   */
  async restoreSecret(secretId) {
    try {
      const command = new RestoreSecretCommand({
        SecretId: secretId
      });

      const response = await this.client.send(command);

      return {
        name: response.Name,
        arn: response.ARN
      };
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        throw new Error(`Secret '${secretId}' not found`);
      }
      throw new Error(`Failed to restore secret: ${error.message}`);
    }
  }

  /**
   * Get detailed information about a secret
   */
  async describeSecret(secretId) {
    try {
      const command = new DescribeSecretCommand({
        SecretId: secretId
      });

      const response = await this.client.send(command);

      return {
        name: response.Name,
        arn: response.ARN,
        description: response.Description,
        lastChangedDate: response.LastChangedDate,
        lastAccessedDate: response.LastAccessedDate,
        nextRotationDate: response.NextRotationDate,
        rotationEnabled: response.RotationEnabled,
        rotationLambdaARN: response.RotationLambdaARN,
        rotationRules: response.RotationRules,
        tags: response.Tags,
        versions: response.VersionIdsToStages,
        owningService: response.OwningService,
        createdDate: response.CreatedDate,
        primaryRegion: response.PrimaryRegion,
        deletedDate: response.DeletedDate
      };
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        throw new Error(`Secret '${secretId}' not found`);
      }
      throw new Error(`Failed to describe secret: ${error.message}`);
    }
  }

  /**
   * Search secrets by name pattern
   */
  async searchSecrets(namePattern, options = {}) {
    const filters = [
      {
        Key: 'name',
        Values: [namePattern]
      }
    ];

    return this.listSecrets({
      ...options,
      filters
    });
  }

  /**
   * Get secrets by tag
   */
  async getSecretsByTag(tagKey, tagValue, options = {}) {
    const filters = [
      {
        Key: 'tag-key',
        Values: [tagKey]
      },
      {
        Key: 'tag-value',
        Values: [tagValue]
      }
    ];

    return this.listSecrets({
      ...options,
      filters
    });
  }
}