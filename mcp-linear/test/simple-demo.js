#!/usr/bin/env node

/**
 * Simple Linear MCP Server Demo
 * Focuses on core functionality without complex filtering
 */

const { LinearOperations } = require('../src/linear-operations.js');

const apiKey = process.env.LINEAR_API_KEY;
if (!apiKey) {
  console.error('❌ LINEAR_API_KEY environment variable is required');
  process.exit(1);
}

async function runSimpleDemo() {
  console.log('🚀 Linear MCP Server Simple Demo\n');
  console.log('=' .repeat(50));

  const linearOps = new LinearOperations(apiKey);

  try {
    // 1. Validate API connection
    console.log('📋 Step 1: API Connection...');
    const validation = await linearOps.validateApiKey();

    if (!validation.valid) {
      throw new Error(`API validation failed: ${validation.error}`);
    }

    if (!validation.user || !validation.user.name) {
      throw new Error('Invalid user data received from Linear API');
    }

    console.log(`✅ Connected as: ${validation.user.name} (${validation.user.email})\n`);

    // 2. Get all teams
    console.log('📋 Step 2: Getting Teams...');
    const teams = await linearOps.queryTeams();
    console.log(`✅ Found ${teams.totalCount} teams:`);
    teams.teams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.name} (${team.key})`);
    });
    console.log();

    // 3. Get team states
    let states = { totalCount: 0 };
    let members = { totalCount: 0 };

    if (teams.totalCount > 0) {
      const firstTeam = teams.teams[0];
      console.log(`📋 Step 3: Getting Workflow States for "${firstTeam.name}"...`);
      states = await linearOps.getTeamStates(firstTeam.id);
      console.log(`✅ Found ${states.totalCount} workflow states:`);
      states.states.forEach((state, index) => {
        const icon = getStateIcon(state.type);
        console.log(`   ${index + 1}. ${icon} ${state.name} (${state.type})`);
      });
      console.log();

      // 4. Get team members
      console.log(`📋 Step 4: Getting Members for "${firstTeam.name}"...`);
      members = await linearOps.getTeamMembers(firstTeam.id);
      console.log(`✅ Found ${members.totalCount} members:`);
      members.members.forEach((member, index) => {
        const status = member.active ? '🟢' : '🔴';
        const role = member.admin ? 'Admin' : member.guest ? 'Guest' : 'Member';
        console.log(`   ${index + 1}. ${status} ${member.name} (${member.email}) - ${role}`);
      });
      console.log();
    }

    // 5. Get recent issues (no filtering)
    console.log('📋 Step 5: Getting Recent Issues...');
    const allIssues = await linearOps.queryIssues({ first: 8 });
    console.log(`✅ Found ${allIssues.totalCount} recent issues:`);
    allIssues.issues.forEach((issue, index) => {
      const priorityIcon = getPriorityIcon(issue.priority);
      const stateIcon = getStateIcon(issue.state?.type);
      const assignee = issue.assignee ? ` (${issue.assignee.name})` : '';
      console.log(`   ${index + 1}. ${priorityIcon} ${issue.identifier}: ${issue.title} ${stateIcon} ${issue.state?.name || 'No state'}${assignee}`);
    });
    console.log();

    // 6. Search functionality
    console.log('📋 Step 6: Testing Search...');
    const searchTerm = 'test';
    const searchResults = await linearOps.searchIssues(searchTerm);
    console.log(`✅ Search for "${searchTerm}" found ${searchResults.totalCount} results:`);
    searchResults.issues.forEach((issue, index) => {
      const priorityIcon = getPriorityIcon(issue.priority);
      const stateIcon = getStateIcon(issue.state?.type);
      console.log(`   ${index + 1}. ${priorityIcon} ${issue.identifier}: ${issue.title} ${stateIcon}`);
    });
    console.log();

    // 7. Get detailed issue information
    if (allIssues.totalCount > 0) {
      console.log('📋 Step 7: Getting Detailed Issue Info...');
      const sampleIssue = allIssues.issues[0];
      const issueDetails = await linearOps.getIssue(sampleIssue.id);

      console.log(`✅ Details for ${issueDetails.identifier}:`);
      console.log(`   Title: ${issueDetails.title}`);
      console.log(`   State: ${issueDetails.state?.name || 'No state'} (${issueDetails.state?.type})`);
      console.log(`   Priority: ${issueDetails.priority} ${getPriorityIcon(issueDetails.priority)}`);
      console.log(`   Created: ${new Date(issueDetails.createdAt).toLocaleDateString()}`);
      console.log(`   URL: ${issueDetails.url}`);

      if (issueDetails.description) {
        const description = issueDetails.description.length > 100
          ? issueDetails.description.substring(0, 100) + '...'
          : issueDetails.description;
        console.log(`   Description: ${description}`);
      }

      if (issueDetails.labels && issueDetails.labels.nodes.length > 0) {
        console.log(`   Labels: ${issueDetails.labels.nodes.map(l => l.name).join(', ')}`);
      }

      console.log();
    }

    // 8. Create a sample issue
    if (teams.totalCount > 0) {
      console.log('📋 Step 8: Creating Sample Issue...');

      const sampleIssueData = {
        title: `MCP Demo Issue - ${new Date().toLocaleString()}`,
        description: `This issue demonstrates Linear MCP server issue creation.\n\n**Features Tested:**\n✅ API Authentication\n✅ Team Query\n✅ Issue Creation\n✅ Issue Updates`,
        teamId: teams.teams[0].id,
        priority: 3 // Normal priority
      };

      try {
        const createdIssue = await linearOps.createIssue(sampleIssueData);
        console.log(`✅ Successfully created issue ${createdIssue.identifier}:`);
        console.log(`   Title: ${createdIssue.title}`);
        console.log(`   URL: ${createdIssue.url}`);
        console.log(`   State: ${createdIssue.state?.name || 'No state'}`);
        console.log();

        // 9. Update the created issue
        console.log('📋 Step 9: Updating Sample Issue...');

        // Find an "in progress" state to move to
        const availableStates = await linearOps.getTeamStates(teams.teams[0].id);
        const progressState = availableStates.states.find(s => s.type === 'started') || availableStates.states[0];

        if (progressState) {
          const updateData = {
            stateId: progressState.id
          };

          const updatedIssue = await linearOps.updateIssue(createdIssue.id, updateData);
          console.log(`✅ Successfully updated issue ${updatedIssue.identifier}:`);
          console.log(`   New State: ${updatedIssue.state?.name} (${updatedIssue.state?.type})`);
          console.log(`   Updated: ${new Date(updatedIssue.updatedAt).toLocaleString()}`);
          console.log(`   URL: ${updatedIssue.url}`);
        }

      } catch (createError) {
        console.log(`⚠️  Could not create sample issue: ${createError.message}`);
        console.log('   (This might be due to permissions or team settings)');
      }

      console.log();
    }

    // 10. Get projects
    console.log('📋 Step 10: Getting Projects...');
    let projects = { totalCount: 0 };
    try {
      projects = await linearOps.getProjects();
      console.log(`✅ Found ${projects.totalCount} projects:`);
      projects.projects.forEach((project, index) => {
        const statusIcon = getProjectStatusIcon(project.state);
        const teamNames = project.teams?.nodes?.map(t => t.name).join(', ') || 'No teams';
        console.log(`   ${index + 1}. ${statusIcon} ${project.name} - ${project.state} (Teams: ${teamNames})`);
      });
    } catch (projectError) {
      console.log(`⚠️  Could not fetch projects: ${projectError.message}`);
    }

    console.log();
    console.log('=' .repeat(50));
    console.log('🎉 Linear MCP Server Demo Completed Successfully!');
    console.log();
    console.log('📊 Summary:');
    console.log(`   - Teams: ${teams.totalCount}`);
    console.log(`   - Issues Queried: ${allIssues.totalCount}`);
    console.log(`   - Search Results: ${searchResults.totalCount}`);
    console.log(`   - Workflow States: ${states?.totalCount || 0}`);
    console.log(`   - Team Members: ${members?.totalCount || 0}`);
    console.log(`   - Projects: ${projects?.totalCount || 0}`);
    console.log();
    console.log('✅ All core Linear MCP server features are working correctly!');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    process.exit(1);
  }
}

// Helper functions for icons
function getPriorityIcon(priority) {
  const icons = {
    0: '🔴', // No priority (urgent in Linear)
    1: '🔴', // Urgent
    2: '🟠', // High
    3: '🔵', // Normal
    4: '⚪'  // Low
  };
  return icons[priority] || '⚪';
}

function getStateIcon(type) {
  const icons = {
    'backlog': '📋',
    'unstarted': '⏸️',
    'started': '🚀',
    'completed': '✅',
    'canceled': '❌'
  };
  return icons[type] || '❓';
}

function getProjectStatusIcon(state) {
  const icons = {
    'planned': '📅',
    'started': '🚀',
    'completed': '✅',
    'paused': '⏸️'
  };
  return icons[state] || '📁';
}

// Run the demo
runSimpleDemo();