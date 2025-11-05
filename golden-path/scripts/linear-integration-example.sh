#!/bin/bash

# Linear API Integration Example Script
# This script demonstrates how to interact with Linear's GraphQL API
# Usage: ./linear-integration-example.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if LINEAR_API_KEY is set
if [ -z "$LINEAR_API_KEY" ]; then
  echo -e "${RED}Error: LINEAR_API_KEY environment variable is not set${NC}"
  echo "Please set it with: export LINEAR_API_KEY=your-api-key"
  exit 1
fi

LINEAR_API_URL="https://api.linear.app/graphql"

# Function to make GraphQL requests
linear_query() {
  local query=$1
  local variables=${2:-"{}"}
  
  curl -s -X POST "$LINEAR_API_URL" \
    -H "Authorization: $LINEAR_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$query\", \"variables\": $variables}"
}

# Example 1: Query teams
echo -e "${GREEN}Example 1: Querying teams...${NC}"
TEAMS_QUERY="query { teams { nodes { id name key } } }"
linear_query "$TEAMS_QUERY" | jq '.data.teams.nodes[] | {id: .id, name: .name, key: .key}'
echo ""

# Example 2: Query issues
if [ -z "$LINEAR_TEAM_ID" ]; then
  echo -e "${YELLOW}Warning: LINEAR_TEAM_ID not set. Skipping issue queries.${NC}"
  echo "Set it with: export LINEAR_TEAM_ID=your-team-id"
else
  echo -e "${GREEN}Example 2: Querying issues for team...${NC}"
  ISSUES_QUERY="query { issues(filter: { team: { id: { eq: \\\"$LINEAR_TEAM_ID\\\" } } }, first: 5) { nodes { id title state { name } } } }"
  linear_query "$ISSUES_QUERY" | jq '.data.issues.nodes[] | {id: .id, title: .title, state: .state.name}'
  echo ""
fi

# Example 3: Create an issue (if team ID is provided)
if [ -n "$LINEAR_TEAM_ID" ]; then
  echo -e "${GREEN}Example 3: Creating a test issue...${NC}"
  CREATE_ISSUE_MUTATION="mutation CreateIssue(\$input: IssueCreateInput!) { issueCreate(input: \$input) { success issue { id title url } } }"
  VARIABLES=$(jq -n \
    --arg teamId "$LINEAR_TEAM_ID" \
    --arg title "Test Issue from Script" \
    --arg description "This is a test issue created by the Linear integration script" \
    '{input: {teamId: $teamId, title: $title, description: $description, priority: 2}}')
  
  RESULT=$(linear_query "$CREATE_ISSUE_MUTATION" "$VARIABLES")
  ISSUE_URL=$(echo "$RESULT" | jq -r '.data.issueCreate.issue.url // empty')
  
  if [ -n "$ISSUE_URL" ] && [ "$ISSUE_URL" != "null" ]; then
    echo -e "${GREEN}✓ Issue created successfully!${NC}"
    echo "Issue URL: $ISSUE_URL"
  else
    echo -e "${RED}✗ Failed to create issue${NC}"
    echo "$RESULT" | jq '.'
  fi
  echo ""
else
  echo -e "${YELLOW}Skipping issue creation (LINEAR_TEAM_ID not set)${NC}"
fi

# Example 4: Query issue states
if [ -n "$LINEAR_TEAM_ID" ]; then
  echo -e "${GREEN}Example 4: Querying issue states...${NC}"
  STATES_QUERY="query { team(id: \\\"$LINEAR_TEAM_ID\\\") { states { nodes { id name type } } } }"
  linear_query "$STATES_QUERY" | jq '.data.team.states.nodes[] | {id: .id, name: .name, type: .type}'
  echo ""
fi

echo -e "${GREEN}Linear API integration examples completed!${NC}"
echo ""
echo "To use these functions in your scripts:"
echo "1. Set LINEAR_API_KEY environment variable"
echo "2. Optionally set LINEAR_TEAM_ID for team-specific operations"
echo "3. Use the linear_query function with GraphQL queries"

