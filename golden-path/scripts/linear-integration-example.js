#!/usr/bin/env node

/**
 * Linear API Integration Example Script (Node.js)
 * 
 * This script demonstrates how to interact with Linear's GraphQL API using Node.js
 * 
 * Prerequisites:
 * - Node.js 18+
 * - LINEAR_API_KEY environment variable set
 * 
 * Usage:
 *   export LINEAR_API_KEY=your-api-key
 *   export LINEAR_TEAM_ID=your-team-id  # Optional
 *   node linear-integration-example.js
 */

const https = require('https');

const LINEAR_API_URL = 'api.linear.app';
const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const LINEAR_TEAM_ID = process.env.LINEAR_TEAM_ID;

if (!LINEAR_API_KEY) {
  console.error('Error: LINEAR_API_KEY environment variable is not set');
  console.error('Please set it with: export LINEAR_API_KEY=your-api-key');
  process.exit(1);
}

/**
 * Make a GraphQL request to Linear API
 */
async function linearQuery(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });
    
    const options = {
      hostname: LINEAR_API_URL,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Authorization': LINEAR_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.errors) {
            reject(new Error(JSON.stringify(result.errors)));
          } else {
            resolve(result.data);
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

/**
 * Example 1: Query teams
 */
async function queryTeams() {
  console.log('\n📋 Example 1: Querying teams...\n');
  
  const query = `
    query {
      teams {
        nodes {
          id
          name
          key
        }
      }
    }
  `;

  try {
    const data = await linearQuery(query);
    data.teams.nodes.forEach((team) => {
      console.log(`  • ${team.name} (${team.key})`);
      console.log(`    ID: ${team.id}\n`);
    });
  } catch (error) {
    console.error('Error querying teams:', error.message);
  }
}

/**
 * Example 2: Query issues for a team
 */
async function queryIssues() {
  if (!LINEAR_TEAM_ID) {
    console.log('\n⚠️  Skipping issue queries (LINEAR_TEAM_ID not set)\n');
    return;
  }

  console.log('\n📋 Example 2: Querying issues...\n');
  
  const query = `
    query($teamId: ID!) {
      issues(filter: { team: { id: { eq: $teamId } } }, first: 5) {
        nodes {
          id
          title
          state {
            name
            type
          }
        }
      }
    }
  `;

  try {
    const data = await linearQuery(query, { teamId: LINEAR_TEAM_ID });
    if (data.issues.nodes.length === 0) {
      console.log('  No issues found\n');
    } else {
      data.issues.nodes.forEach((issue) => {
        console.log(`  • ${issue.title}`);
        console.log(`    State: ${issue.state.name} (${issue.state.type})\n`);
      });
    }
  } catch (error) {
    console.error('Error querying issues:', error.message);
  }
}

/**
 * Example 3: Create an issue
 */
async function createIssue() {
  if (!LINEAR_TEAM_ID) {
    console.log('\n⚠️  Skipping issue creation (LINEAR_TEAM_ID not set)\n');
    return;
  }

  console.log('\n📋 Example 3: Creating a test issue...\n');
  
  const mutation = `
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          title
          url
        }
      }
    }
  `;

  const variables = {
    input: {
      teamId: LINEAR_TEAM_ID,
      title: 'Test Issue from Node.js Script',
      description: 'This is a test issue created by the Linear integration example script',
      priority: 2,
    },
  };

  try {
    const data = await linearQuery(mutation, variables);
    if (data.issueCreate.success) {
      const issue = data.issueCreate.issue;
      console.log('  ✓ Issue created successfully!');
      console.log(`  Title: ${issue.title}`);
      console.log(`  URL: ${issue.url}\n`);
    } else {
      console.error('  ✗ Failed to create issue\n');
    }
  } catch (error) {
    console.error('Error creating issue:', error.message);
  }
}

/**
 * Example 4: Query issue states
 */
async function queryIssueStates() {
  if (!LINEAR_TEAM_ID) {
    console.log('\n⚠️  Skipping state queries (LINEAR_TEAM_ID not set)\n');
    return;
  }

  console.log('\n📋 Example 4: Querying issue states...\n');
  
  const query = `
    query($teamId: String!) {
      team(id: $teamId) {
        states {
          nodes {
            id
            name
            type
          }
        }
      }
    }
  `;

  try {
    const data = await linearQuery(query, { teamId: LINEAR_TEAM_ID });
    data.team.states.nodes.forEach((state) => {
      console.log(`  • ${state.name} (${state.type})`);
      console.log(`    ID: ${state.id}\n`);
    });
  } catch (error) {
    console.error('Error querying states:', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Linear API Integration Examples\n');
  console.log('=' .repeat(50));

  await queryTeams();
  await queryIssues();
  await createIssue();
  await queryIssueStates();

  console.log('=' .repeat(50));
  console.log('\n✅ Examples completed!\n');
  console.log('To use Linear API in your code:');
  console.log('1. Set LINEAR_API_KEY environment variable');
  console.log('2. Optionally set LINEAR_TEAM_ID for team-specific operations');
  console.log('3. Use the linearQuery function with GraphQL queries');
}

// Run examples
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

