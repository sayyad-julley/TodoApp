import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { AWSConfig } from './aws-config.js';
import { SecretsOperations } from './secrets-operations.js';

// X-Ray SDK for Node.js
const AWSXRay = require('aws-xray-sdk-core');

// Initialize X-Ray at process level
AWSXRay.init();

// Set dynamic service name for MCP server
const serviceName = process.env.SERVICE_NAME || 'mcp-secrets-manager';
process.env.AWS_XRAY_TRACING_NAME = serviceName;

console.log('X-Ray initialized for MCP Secrets Manager server');

/**
 * MCP Server for AWS Secrets Manager
 */
class SecretsManagerMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'aws-secrets-manager',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.awsConfig = null;
    this.secretsOps = null;
    this.setupToolHandlers();
  }

  /**
   * Initialize AWS configuration
   */
  async initializeAWS(options = {}) {
    try {
      this.awsConfig = new AWSConfig(options);
      const validation = this.awsConfig.validateConfig();

      if (!validation.isValid) {
        throw new Error(`AWS Configuration invalid: ${validation.errors.join(', ')}`);
      }

      const client = this.awsConfig.createClient();
      this.secretsOps = new SecretsOperations(client);

      return {
        success: true,
        config: this.awsConfig.getConfigSummary()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Setup tool handlers
   */
  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_secrets',
            description: 'List all secrets in AWS Secrets Manager with optional filtering',
            inputSchema: {
              type: 'object',
              properties: {
                filters: {
                  type: 'array',
                  description: 'Array of filters to apply (e.g., [{Key: "name", Values: ["my-secret*"]}])',
                  items: {
                    type: 'object',
                    properties: {
                      Key: { type: 'string' },
                      Values: { type: 'array', items: { type: 'string' } }
                    }
                  }
                },
                maxResults: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 100)',
                  default: 100
                },
                includePlannedDeletion: {
                  type: 'boolean',
                  description: 'Include secrets scheduled for deletion',
                  default: false
                }
              }
            }
          },
          {
            name: 'get_secret',
            description: 'Get the value of a specific secret',
            inputSchema: {
              type: 'object',
              properties: {
                secretId: {
                  type: 'string',
                  description: 'The name or ARN of the secret to retrieve'
                },
                versionStage: {
                  type: 'string',
                  description: 'The version stage to retrieve (default: AWSCURRENT)',
                  default: 'AWSCURRENT'
                }
              },
              required: ['secretId']
            }
          },
          {
            name: 'create_secret',
            description: 'Create a new secret in AWS Secrets Manager',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'The name of the secret'
                },
                secretValue: {
                  type: 'string',
                  description: 'The secret value (JSON string or plain text)'
                },
                description: {
                  type: 'string',
                  description: 'Description of the secret'
                },
                tags: {
                  type: 'array',
                  description: 'Tags to apply to the secret',
                  items: {
                    type: 'object',
                    properties: {
                      Key: { type: 'string' },
                      Value: { type: 'string' }
                    }
                  }
                }
              },
              required: ['name', 'secretValue']
            }
          },
          {
            name: 'update_secret',
            description: 'Update an existing secret',
            inputSchema: {
              type: 'object',
              properties: {
                secretId: {
                  type: 'string',
                  description: 'The name or ARN of the secret to update'
                },
                secretValue: {
                  type: 'string',
                  description: 'The new secret value'
                },
                description: {
                  type: 'string',
                  description: 'Updated description of the secret'
                }
              },
              required: ['secretId', 'secretValue']
            }
          },
          {
            name: 'delete_secret',
            description: 'Delete a secret from AWS Secrets Manager',
            inputSchema: {
              type: 'object',
              properties: {
                secretId: {
                  type: 'string',
                  description: 'The name or ARN of the secret to delete'
                },
                forceDelete: {
                  type: 'boolean',
                  description: 'Force immediate deletion without recovery window',
                  default: false
                },
                recoveryWindowDays: {
                  type: 'number',
                  description: 'Number of days for recovery window (default: 30)',
                  default: 30
                }
              },
              required: ['secretId']
            }
          },
          {
            name: 'describe_secret',
            description: 'Get detailed information about a secret without retrieving its value',
            inputSchema: {
              type: 'object',
              properties: {
                secretId: {
                  type: 'string',
                  description: 'The name or ARN of the secret to describe'
                }
              },
              required: ['secretId']
            }
          },
          {
            name: 'search_secrets',
            description: 'Search for secrets by name pattern',
            inputSchema: {
              type: 'object',
              properties: {
                namePattern: {
                  type: 'string',
                  description: 'Name pattern to search for (supports wildcards)'
                },
                maxResults: {
                  type: 'number',
                  description: 'Maximum number of results to return',
                  default: 50
                }
              },
              required: ['namePattern']
            }
          },
          {
            name: 'init_aws',
            description: 'Initialize AWS configuration with credentials',
            inputSchema: {
              type: 'object',
              properties: {
                region: {
                  type: 'string',
                  description: 'AWS region (default: us-east-1)',
                  default: 'us-east-1'
                },
                accessKeyId: {
                  type: 'string',
                  description: 'AWS access key ID'
                },
                secretAccessKey: {
                  type: 'string',
                  description: 'AWS secret access key'
                },
                profile: {
                  type: 'string',
                  description: 'AWS profile name'
                }
              }
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Initialize AWS if not already done
        if (!this.secretsOps && name !== 'init_aws') {
          throw new Error('AWS not initialized. Please call init_aws first with your credentials.');
        }

        switch (name) {
          case 'init_aws':
            return await this.handleInitAWS(args);

          case 'list_secrets':
            return await this.handleListSecrets(args);

          case 'get_secret':
            return await this.handleGetSecret(args);

          case 'create_secret':
            return await this.handleCreateSecret(args);

          case 'update_secret':
            return await this.handleUpdateSecret(args);

          case 'delete_secret':
            return await this.handleDeleteSecret(args);

          case 'describe_secret':
            return await this.handleDescribeSecret(args);

          case 'search_secrets':
            return await this.handleSearchSecrets(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async handleInitAWS(args) {
    const segment = AWSXRay.getSegment() || AWSXRay.addNewSegment('InitAWS');

    try {
      const subsegment = segment.addNewSubsegment('InitializeAWS');
      subsegment.addAnnotation('operation', 'init_aws');
      subsegment.addMetadata('args', { ...args, accessKeyId: args.accessKeyId ? '[REDACTED]' : null, secretAccessKey: args.secretAccessKey ? '[REDACTED]' : null });

      const result = await this.initializeAWS(args);

      subsegment.addAnnotation('success', result.success ? 'true' : 'false');
      if (result.config) {
        subsegment.addMetadata('config', result.config);
      }
      if (!result.success) {
        subsegment.addError(new Error(result.error));
      }

      if (result.success) {
        return {
          content: [
            {
              type: 'text',
              text: `AWS Secrets Manager initialized successfully.\nConfiguration: ${JSON.stringify(result.config, null, 2)}`
            }
          ]
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to initialize AWS: ${result.error}`
            }
          ],
          isError: true
        };
      }
    } finally {
      if (segment === AWSXRay.getSegment()) {
        segment.close();
      }
    }
  }

  async handleListSecrets(args) {
    const segment = AWSXRay.getSegment() || AWSXRay.addNewSegment('ListSecrets');

    try {
      const subsegment = segment.addNewSubsegment('ListSecrets');
      subsegment.addAnnotation('operation', 'list_secrets');
      subsegment.addMetadata('args', { ...args, filters: args.filters ? '[FILTERED]' : null });

      const result = await this.secretsOps.listSecrets(args);

      subsegment.addAnnotation('count', result.totalCount.toString());
      subsegment.addMetadata('response', { totalCount: result.totalCount, secretsCount: result.secrets?.length || 0 });

      return {
        content: [
          {
            type: 'text',
            text: `Found ${result.totalCount} secrets:\n\n${JSON.stringify(result, null, 2)}`
          }
        ]
      };
    } catch (error) {
      const subsegment = segment.addNewSubsegment('ListSecrets');
      subsegment.addAnnotation('operation', 'list_secrets');
      subsegment.addError(error);
      throw error;
    } finally {
      if (segment === AWSXRay.getSegment()) {
        segment.close();
      }
    }
  }

  async handleGetSecret(args) {
    const segment = AWSXRay.getSegment() || AWSXRay.addNewSegment('GetSecret');
    const { secretId, versionStage } = args;

    try {
      const subsegment = segment.addNewSubsegment('GetSecret');
      subsegment.addAnnotation('operation', 'get_secret');
      subsegment.addMetadata('args', { secretId, versionStage });

      const result = await this.secretsOps.getSecretValue(secretId, versionStage);

      subsegment.addAnnotation('success', 'true');
      subsegment.addMetadata('response', {
        name: result.name,
        arn: result.arn,
        versionId: result.versionId,
        hasSecretString: !!result.secretString,
        hasSecretBinary: !!result.secretBinary,
        versionStages: result.versionStages
      });

      // Mask sensitive values in the response
      const maskedResult = { ...result };
      if (maskedResult.secretString) {
        maskedResult.secretString = '[REDACTED - Actual value retrieved but hidden for security]';
      }
      if (maskedResult.secretBinary) {
        maskedResult.secretBinary = '[REDACTED - Binary data retrieved but hidden for security]';
      }

      return {
        content: [
          {
            type: 'text',
            text: `Secret retrieved successfully:\n\n${JSON.stringify(maskedResult, null, 2)}\n\nNote: Actual secret value has been masked for security. Use with caution in your application.`
          }
        ]
      };
    } catch (error) {
      const subsegment = segment.addNewSubsegment('GetSecret');
      subsegment.addAnnotation('operation', 'get_secret');
      subsegment.addMetadata('args', { secretId, versionStage });
      subsegment.addError(error);
      throw error;
    } finally {
      if (segment === AWSXRay.getSegment()) {
        segment.close();
      }
    }
  }

  async handleCreateSecret(args) {
    const result = await this.secretsOps.createSecret(args.name, args.secretValue, {
      description: args.description,
      tags: args.tags
    });

    return {
      content: [
        {
          type: 'text',
          text: `Secret created successfully:\n\n${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async handleUpdateSecret(args) {
    const result = await this.secretsOps.updateSecret(args.secretId, args.secretValue, {
      description: args.description
    });

    return {
      content: [
        {
          type: 'text',
          text: `Secret updated successfully:\n\n${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async handleDeleteSecret(args) {
    const { secretId, forceDelete, recoveryWindowDays } = args;
    const result = await this.secretsOps.deleteSecret(secretId, {
      forceDeleteWithoutRecovery: forceDelete,
      recoveryWindowInDays: recoveryWindowDays
    });

    return {
      content: [
        {
          type: 'text',
          text: `Secret deletion initiated:\n\n${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async handleDescribeSecret(args) {
    const result = await this.secretsOps.describeSecret(args.secretId);

    return {
      content: [
        {
          type: 'text',
          text: `Secret details:\n\n${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  async handleSearchSecrets(args) {
    const result = await this.secretsOps.searchSecrets(args.namePattern, {
      maxResults: args.maxResults
    });

    return {
      content: [
        {
          type: 'text',
          text: `Search results (${result.totalCount} found):\n\n${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }

  /**
   * Start the MCP server
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('AWS Secrets Manager MCP server running on stdio');
  }
}

export { SecretsManagerMCPServer };