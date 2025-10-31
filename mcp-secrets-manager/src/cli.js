#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { table } from 'table';
import { SecretsManagerMCPServer } from './mcp-server.js';

/**
 * CLI interface for AWS Secrets Manager MCP
 */
class SecretsManagerCLI {
  constructor() {
    this.program = new Command();
    this.server = new SecretsManagerMCPServer();
    this.setupCommands();
  }

  setupCommands() {
    this.program
      .name('mcp-secrets')
      .description('CLI for AWS Secrets Manager MCP Server')
      .version('1.0.0');

    // Interactive mode
    this.program
      .command('interactive')
      .alias('i')
      .description('Start interactive mode for managing secrets')
      .action(() => this.startInteractiveMode());

    // Server mode
    this.program
      .command('server')
      .alias('s')
      .description('Start MCP server for Claude integration')
      .option('-r, --region <region>', 'AWS region', 'us-east-1')
      .option('-p, --profile <profile>', 'AWS profile name')
      .option('--access-key-id <key>', 'AWS access key ID')
      .option('--secret-access-key <key>', 'AWS secret access key')
      .action((options) => this.startServerMode(options));

    // Quick setup for todo app
    this.program
      .command('setup-todo')
      .description('Quick setup for Todo App secrets')
      .option('-r, --region <region>', 'AWS region', 'us-east-1')
      .action((options) => this.setupTodoApp(options));

    // List secrets
    this.program
      .command('list')
      .description('List all secrets')
      .option('-p, --pattern <pattern>', 'Filter by name pattern')
      .option('-t, --tag <tag>', 'Filter by tag (format: key:value)')
      .option('--include-deleted', 'Include secrets scheduled for deletion')
      .action((options) => this.listSecrets(options));

    // Get secret
    this.program
      .command('get <name>')
      .description('Get a secret value')
      .option('-v, --version <version>', 'Get specific version stage', 'AWSCURRENT')
      .option('--show', 'Show the actual secret value (use with caution)')
      .action((name, options) => this.getSecret(name, options));

    // Create secret
    this.program
      .command('create <name>')
      .description('Create a new secret')
      .option('-v, --value <value>', 'Secret value')
      .option('-f, --file <file>', 'Read secret value from file')
      .option('-d, --description <description>', 'Secret description')
      .option('--json', 'Treat value as JSON')
      .action((name, options) => this.createSecret(name, options));

    // Initialize AWS
    this.program
      .command('init')
      .description('Initialize AWS credentials')
      .option('-r, --region <region>', 'AWS region', 'us-east-1')
      .option('-p, --profile <profile>', 'AWS profile name')
      .option('--access-key-id <key>', 'AWS access key ID')
      .option('--secret-access-key <key>', 'AWS secret access key')
      .action((options) => this.initializeAWS(options));
  }

  async startInteractiveMode() {
    console.log(chalk.blue('🔐 AWS Secrets Manager Interactive Mode'));
    console.log(chalk.gray('Configure your AWS credentials first.\n'));

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Initialize AWS credentials', value: 'init' },
          { name: 'List all secrets', value: 'list' },
          { name: 'Get a secret', value: 'get' },
          { name: 'Create a new secret', value: 'create' },
          { name: 'Update a secret', value: 'update' },
          { name: 'Delete a secret', value: 'delete' },
          { name: 'Setup Todo App secrets', value: 'setup-todo' },
          { name: 'Exit', value: 'exit' }
        ]
      }
    ]);

    switch (action) {
      case 'init':
        await this.interactiveInit();
        break;
      case 'list':
        await this.interactiveList();
        break;
      case 'get':
        await this.interactiveGet();
        break;
      case 'create':
        await this.interactiveCreate();
        break;
      case 'update':
        await this.interactiveUpdate();
        break;
      case 'delete':
        await this.interactiveDelete();
        break;
      case 'setup-todo':
        await this.setupTodoApp();
        break;
      case 'exit':
        console.log(chalk.green('Goodbye!'));
        process.exit(0);
    }
  }

  async interactiveInit() {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'authMethod',
        message: 'How would you like to authenticate?',
        choices: [
          { name: 'AWS Profile (recommended)', value: 'profile' },
          { name: 'Access Keys', value: 'keys' },
          { name: 'Environment Variables', value: 'env' }
        ]
      },
      {
        type: 'input',
        name: 'region',
        message: 'AWS region:',
        default: 'us-east-1'
      }
    ]);

    let initOptions = { region: answers.region };

    if (answers.authMethod === 'profile') {
      const { profile } = await inquirer.prompt([
        {
          type: 'input',
          name: 'profile',
          message: 'AWS profile name:',
          default: 'default'
        }
      ]);
      initOptions.profile = profile;
    } else if (answers.authMethod === 'keys') {
      const keyAnswers = await inquirer.prompt([
        {
          type: 'password',
          name: 'accessKeyId',
          message: 'AWS Access Key ID:'
        },
        {
          type: 'password',
          name: 'secretAccessKey',
          message: 'AWS Secret Access Key:'
        }
      ]);
      initOptions.accessKeyId = keyAnswers.accessKeyId;
      initOptions.secretAccessKey = keyAnswers.secretAccessKey;
    }

    await this.initializeAWS(initOptions);
  }

  async interactiveList() {
    await this.listSecrets({});
  }

  async interactiveGet() {
    const secrets = await this.server.secretsOps.listSecrets({ maxResults: 100 });
    const choices = secrets.secrets.map(secret => ({
      name: `${secret.Name} ${secret.Description ? `- ${secret.Description}` : ''}`,
      value: secret.Name
    }));

    if (choices.length === 0) {
      console.log(chalk.yellow('No secrets found.'));
      return;
    }

    const { secretName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'secretName',
        message: 'Select a secret:',
        choices
      }
    ]);

    await this.getSecret(secretName, { show: true });
  }

  async interactiveCreate() {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Secret name:',
        validate: input => input.trim() !== '' || 'Name is required'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description (optional):'
      },
      {
        type: 'list',
        name: 'valueType',
        message: 'Value type:',
        choices: [
          { name: 'Plain Text', value: 'text' },
          { name: 'JSON', value: 'json' }
        ]
      },
      {
        type: 'password',
        name: 'value',
        message: 'Secret value:',
        when: (answers) => answers.valueType === 'text',
        validate: input => input.trim() !== '' || 'Value is required'
      },
      {
        type: 'input',
        name: 'jsonValue',
        message: 'JSON value:',
        when: (answers) => answers.valueType === 'json',
        validate: input => {
          try {
            JSON.parse(input);
            return true;
          } catch {
            return 'Invalid JSON';
          }
        }
      }
    ]);

    const options = {
      description: answers.description,
      json: answers.valueType === 'json'
    };

    const value = answers.valueType === 'json' ? answers.jsonValue : answers.value;
    await this.createSecret(answers.name, { ...options, value });
  }

  async interactiveUpdate() {
    console.log(chalk.blue('Update secret functionality coming soon!'));
  }

  async interactiveDelete() {
    console.log(chalk.blue('Delete secret functionality coming soon!'));
  }

  async startServerMode(options) {
    console.log(chalk.blue('🚀 Starting AWS Secrets Manager MCP Server...'));

    const result = await this.server.initializeAWS(options);

    if (!result.success) {
      console.error(chalk.red('❌ Failed to initialize AWS:'), result.error);
      process.exit(1);
    }

    console.log(chalk.green('✅ AWS initialized successfully'));
    console.log(chalk.gray('Server configuration:'), JSON.stringify(result.config, null, 2));
    console.log(chalk.blue('\n🔗 Starting MCP server on stdio...'));
    console.log(chalk.gray('You can now use this server with Claude Desktop or other MCP clients.\n'));

    await this.server.start();
  }

  async setupTodoApp(options = {}) {
    console.log(chalk.blue('🚀 Setting up Todo App secrets...'));

    // Initialize AWS first if needed
    if (options.region || process.env.AWS_REGION) {
      await this.initializeAWS({ region: options.region || 'us-east-1' });
    }

    const secrets = [
      {
        name: 'todoapp/database/credentials',
        description: 'Database credentials for todo application',
        prompt: 'Enter database credentials (JSON format)',
        example: '{"username": "admin", "password": "password", "host": "localhost", "port": 5432, "database": "todoapp"}'
      },
      {
        name: 'todoapp/jwt/secret',
        description: 'JWT signing secret',
        prompt: 'Enter JWT secret',
        example: 'your-super-secure-jwt-secret-key'
      }
    ];

    for (const secretConfig of secrets) {
      console.log(chalk.yellow(`\n📝 Setting up ${secretConfig.name}`));
      console.log(chalk.gray(`Description: ${secretConfig.description}`));
      console.log(chalk.gray(`Example: ${secretConfig.example}`));

      const { value } = await inquirer.prompt([
        {
          type: 'password',
          name: 'value',
          message: secretConfig.prompt,
          validate: input => input.trim() !== '' || 'Value is required'
        }
      ]);

      try {
        await this.server.secretsOps.createSecret(secretConfig.name, value, {
          description: secretConfig.description
        });
        console.log(chalk.green(`✅ Created secret: ${secretConfig.name}`));
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(chalk.yellow(`⚠️  Secret already exists: ${secretConfig.name}`));
          const { update } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'update',
              message: 'Would you like to update it?',
              default: false
            }
          ]);

          if (update) {
            await this.server.secretsOps.updateSecret(secretConfig.name, value);
            console.log(chalk.green(`✅ Updated secret: ${secretConfig.name}`));
          }
        } else {
          console.error(chalk.red(`❌ Failed to create secret: ${error.message}`));
        }
      }
    }

    console.log(chalk.green('\n🎉 Todo App secrets setup complete!'));
    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.gray('1. Set environment variables in your application:'));
    console.log(chalk.gray('   DB_SECRET_ARN=arn:aws:secretsmanager:region:account-id:secret:todoapp/database/credentials-xxxxx'));
    console.log(chalk.gray('   JWT_SECRET_ARN=arn:aws:secretsmanager:region:account-id:secret:todoapp/jwt/secret-xxxxx'));
    console.log(chalk.gray('2. Update your application code to fetch secrets from AWS Secrets Manager'));
  }

  async initializeAWS(options) {
    console.log(chalk.blue('🔐 Initializing AWS credentials...'));

    const result = await this.server.initializeAWS(options);

    if (result.success) {
      console.log(chalk.green('✅ AWS initialized successfully'));
      console.log(chalk.gray('Configuration:'), JSON.stringify(result.config, null, 2));
    } else {
      console.error(chalk.red('❌ Failed to initialize AWS:'), result.error);
      process.exit(1);
    }

    return result;
  }

  async listSecrets(options) {
    console.log(chalk.blue('📋 Listing secrets...'));

    try {
      const result = await this.server.secretsOps.listSecrets({
        includePlannedDeletion: options.includeDeleted,
        maxResults: 100
      });

      if (result.secrets.length === 0) {
        console.log(chalk.yellow('No secrets found.'));
        return;
      }

      const data = [
        ['Name', 'Description', 'Last Changed', 'Rotation Enabled']
      ];

      result.secrets.forEach(secret => {
        data.push([
          secret.Name,
          secret.Description || 'N/A',
          secret.LastChangedDate ? new Date(secret.LastChangedDate).toLocaleDateString() : 'N/A',
          secret.RotationEnabled ? 'Yes' : 'No'
        ]);
      });

      console.log(chalk.green(`\nFound ${result.secrets.length} secrets:\n`));
      console.log(table(data, {
        border: {
          topBody: '─',
          topJoin: '┬',
          topLeft: '┌',
          topRight: '┐',
          bottomBody: '─',
          bottomJoin: '┴',
          bottomLeft: '└',
          bottomRight: '┘',
          bodyLeft: '│',
          bodyRight: '│',
          bodyJoin: '│',
          joinBody: '─',
          joinLeft: '├',
          joinRight: '┤',
          joinJoin: '┼'
        }
      }));
    } catch (error) {
      console.error(chalk.red('❌ Failed to list secrets:'), error.message);
    }
  }

  async getSecret(name, options) {
    console.log(chalk.blue(`🔍 Getting secret: ${name}`));

    try {
      const result = await this.server.secretsOps.getSecretValue(name, options.version);

      if (options.show) {
        console.log(chalk.green('\nSecret value:'));
        if (result.secretString) {
          try {
            const parsed = JSON.parse(result.secretString);
            console.log(JSON.stringify(parsed, null, 2));
          } catch {
            console.log(result.secretString);
          }
        } else if (result.secretBinary) {
          console.log(chalk.yellow('[Binary data - cannot display]'));
        }
      } else {
        console.log(chalk.yellow('\n⚠️  Secret value hidden for security. Use --show to display the actual value.'));
      }

      console.log(chalk.blue('\nSecret metadata:'));
      console.log(chalk.gray(`Name: ${result.name}`));
      console.log(chalk.gray(`ARN: ${result.arn}`));
      console.log(chalk.gray(`Version ID: ${result.versionId}`));
      console.log(chalk.gray(`Version Stages: ${result.versionStages?.join(', ') || 'N/A'}`));
      console.log(chalk.gray(`Created: ${result.createdDate ? new Date(result.createdDate).toLocaleString() : 'N/A'}`));
    } catch (error) {
      console.error(chalk.red('❌ Failed to get secret:'), error.message);
    }
  }

  async createSecret(name, options) {
    console.log(chalk.blue(`📝 Creating secret: ${name}`));

    let secretValue = options.value;

    if (options.file) {
      const fs = await import('fs/promises');
      try {
        secretValue = await fs.readFile(options.file, 'utf-8');
      } catch (error) {
        console.error(chalk.red('❌ Failed to read file:'), error.message);
        return;
      }
    }

    if (!secretValue) {
      console.error(chalk.red('❌ Secret value is required'));
      return;
    }

    try {
      const result = await this.server.secretsOps.createSecret(name, secretValue, {
        description: options.description
      });

      console.log(chalk.green('✅ Secret created successfully!'));
      console.log(chalk.gray(`Name: ${result.name}`));
      console.log(chalk.gray(`ARN: ${result.arn}`));
      console.log(chalk.gray(`Version ID: ${result.versionId}`));
    } catch (error) {
      console.error(chalk.red('❌ Failed to create secret:'), error.message);
    }
  }

  run() {
    this.program.parse();
  }
}

// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new SecretsManagerCLI();
  cli.run();
}

export { SecretsManagerCLI };