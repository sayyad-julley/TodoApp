#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { LinearMCPServer } = require('./mcp-server.js');
const { LinearOperations } = require('./linear-operations.js');

const program = new Command();

program
  .name('mcp-linear')
  .description('Linear MCP Server - Model Context Protocol server for Linear project management')
  .version('1.0.0');

program
  .command('start')
  .description('Start the Linear MCP server (stdio mode)')
  .action(async () => {
    try {
      console.log(chalk.blue('🚀 Starting Linear MCP Server...'));
      const server = new LinearMCPServer();
      await server.start();
    } catch (error) {
      console.error(chalk.red('❌ Failed to start server:'), error.message);
      process.exit(1);
    }
  });

program
  .command('test')
  .description('Test Linear API connection')
  .option('-k, --api-key <key>', 'Linear API key (or set LINEAR_API_KEY env var)')
  .action(async (options) => {
    try {
      const apiKey = options.apiKey || process.env.LINEAR_API_KEY;

      if (!apiKey) {
        console.error(chalk.red('❌ Linear API key is required'));
        console.error(chalk.yellow('💡 Set LINEAR_API_KEY environment variable or use --api-key option'));
        process.exit(1);
      }

      console.log(chalk.blue('🔍 Testing Linear API connection...'));

      const linearOps = new LinearOperations(apiKey);
      const validation = await linearOps.validateApiKey();

      if (validation.valid) {
        console.log(chalk.green('✅ API connection successful!'));
        console.log(chalk.gray(`User: ${validation.user.name} (${validation.user.email})`));

        // Test basic queries
        console.log(chalk.blue('\n📋 Testing basic operations...'));

        const teams = await linearOps.queryTeams();
        console.log(chalk.green(`✅ Found ${teams.totalCount} teams`));

        if (teams.totalCount > 0) {
          const issues = await linearOps.queryIssues({ teamId: teams.teams[0].id, first: 5 });
          console.log(chalk.green(`✅ Found ${issues.totalCount} recent issues in team "${teams.teams[0].name}"`));
        }

        console.log(chalk.green('\n🎉 All tests passed! Your Linear MCP server is ready to use.'));
      } else {
        console.error(chalk.red('❌ API connection failed:'), validation.error);
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('❌ Test failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('setup')
  .description('Interactive setup for Linear API key')
  .action(async () => {
    try {
      console.log(chalk.blue('🔧 Linear MCP Server Setup\n'));

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'apiKey',
          message: 'Enter your Linear Personal API Key:',
          validate: (input) => {
            if (!input.trim()) {
              return 'API key is required';
            }
            if (!input.startsWith('lin_api_')) {
              return 'Linear API keys should start with "lin_api_"';
            }
            return true;
          }
        },
        {
          type: 'confirm',
          name: 'testConnection',
          message: 'Test the API connection?',
          default: true
        }
      ]);

      if (answers.testConnection) {
        console.log(chalk.blue('\n🔍 Testing API connection...'));

        const linearOps = new LinearOperations(answers.apiKey);
        const validation = await linearOps.validateApiKey();

        if (validation.valid) {
          console.log(chalk.green('✅ API connection successful!'));
          console.log(chalk.gray(`User: ${validation.user.name} (${validation.user.email})`));

          const teams = await linearOps.queryTeams();
          console.log(chalk.green(`✅ Found ${teams.totalCount} teams in your workspace`));

          console.log(chalk.green('\n🎉 Setup complete!'));
          console.log(chalk.yellow('\nTo use the MCP server:'));
          console.log(chalk.gray('1. Add this to your Claude Desktop configuration:'));
          console.log(chalk.white('```json'));
          console.log(chalk.white('{'));
          console.log(chalk.white('  "mcpServers": {'));
          console.log(chalk.white('    "linear": {'));
          console.log(chalk.white('      "command": "node",'));
          console.log(chalk.white(`      "args": ["${process.argv[1]}"],`));
          console.log(chalk.white('      "env": {'));
          console.log(chalk.white(`        "LINEAR_API_KEY": "${answers.apiKey}"`));
          console.log(chalk.white('      }'));
          console.log(chalk.white('    }'));
          console.log(chalk.white('  }'));
          console.log(chalk.white('}'));
          console.log(chalk.white('```'));

          console.log(chalk.yellow('\nOr set the environment variable:'));
          console.log(chalk.white(`export LINEAR_API_KEY="${answers.apiKey}"`));
          console.log(chalk.gray('Then run: mcp-linear start'));
        } else {
          console.error(chalk.red('❌ API connection failed:'), validation.error);
          process.exit(1);
        }
      } else {
        console.log(chalk.yellow('\n⚠️  Skipped connection test'));
        console.log(chalk.yellow('Your API key:'), answers.apiKey);
      }
    } catch (error) {
      console.error(chalk.red('❌ Setup failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('demo')
  .description('Run a demo of Linear operations')
  .option('-k, --api-key <key>', 'Linear API key (or set LINEAR_API_KEY env var)')
  .action(async (options) => {
    try {
      const apiKey = options.apiKey || process.env.LINEAR_API_KEY;

      if (!apiKey) {
        console.error(chalk.red('❌ Linear API key is required'));
        console.error(chalk.yellow('💡 Run "mcp-linear setup" to configure your API key'));
        process.exit(1);
      }

      console.log(chalk.blue('🎭 Linear MCP Server Demo\n'));

      const linearOps = new LinearOperations(apiKey);

      // Validate API key
      const validation = await linearOps.validateApiKey();
      if (!validation.valid) {
        console.error(chalk.red('❌ Invalid API key:'), validation.error);
        process.exit(1);
      }

      console.log(chalk.green(`✅ Connected as ${validation.user.name}\n`));

      // Demo operations
      console.log(chalk.blue('📋 Querying teams...'));
      const teams = await linearOps.queryTeams();
      console.log(chalk.green(`Found ${teams.totalCount} teams:`));
      teams.teams.forEach(team => {
        console.log(chalk.gray(`  • ${team.name} (${team.key}) - ${team.description || 'No description'}`));
      });

      if (teams.totalCount > 0) {
        const firstTeam = teams.teams[0];
        console.log(chalk.blue(`\n📋 Querying issues from team "${firstTeam.name}"...`));
        const issues = await linearOps.queryIssues({ teamId: firstTeam.id, first: 5 });
        console.log(chalk.green(`Found ${issues.totalCount} recent issues:`));
        issues.issues.forEach(issue => {
          console.log(chalk.gray(`  • ${issue.identifier}: ${issue.title} (${issue.state?.name || 'No state'})`));
        });

        console.log(chalk.blue('\n📋 Getting team states...'));
        const states = await linearOps.getTeamStates(firstTeam.id);
        console.log(chalk.green(`Found ${states.totalCount} states:`));
        states.states.forEach(state => {
          console.log(chalk.gray(`  • ${state.name} (${state.type})`));
        });
      }

      console.log(chalk.green('\n✨ Demo completed successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Demo failed:'), error.message);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}