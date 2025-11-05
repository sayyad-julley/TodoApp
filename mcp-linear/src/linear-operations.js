const fetch = require('node-fetch');

/**
 * Linear API operations wrapper
 */
class LinearOperations {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.linear.app/graphql';
  }

  /**
   * Make a GraphQL request to Linear API
   */
  async graphqlQuery(query, variables = {}) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
      }

      return result.data;
    } catch (error) {
      throw new Error(`Linear API request failed: ${error.message}`);
    }
  }

  /**
   * Query all teams
   */
  async queryTeams() {
    const query = `
      query {
        teams {
          nodes {
            id
            name
            key
            description
            createdAt
            updatedAt
          }
        }
      }
    `;

    try {
      const data = await this.graphqlQuery(query);
      return {
        teams: data.teams.nodes,
        totalCount: data.teams.nodes.length
      };
    } catch (error) {
      throw new Error(`Failed to query teams: ${error.message}`);
    }
  }

  /**
   * Query issues with optional filtering
   */
  async queryIssues(options = {}) {
    const {
      teamId = null,
      first = 50,
      after = null,
      filter = {}
    } = options;

    // Build filter clause including team filter
    const fullFilter = { ...filter };
    if (teamId) {
      fullFilter.team = { id: { eq: teamId } };
    }

    const filterClause = Object.keys(fullFilter).length > 0
      ? `, filter: ${this.buildFilterInput(fullFilter)}`
      : '';

    const query = `
      query($first: Int, $after: String) {
        issues(first: $first, after: $after${filterClause}) {
          nodes {
            id
            identifier
            title
            description
            state {
              id
              name
              type
              color
            }
            assignee {
              id
              name
              email
              avatarUrl
            }
            creator {
              id
              name
              email
            }
            priority
            createdAt
            updatedAt
            dueDate
            completedAt
            url
            project {
              id
              name
              state
            }
            labels {
              nodes {
                id
                name
                color
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    try {
      const data = await this.graphqlQuery(query, { first, after });
      return {
        issues: data.issues.nodes,
        pageInfo: data.issues.pageInfo,
        totalCount: data.issues.nodes.length
      };
    } catch (error) {
      throw new Error(`Failed to query issues: ${error.message}`);
    }
  }

  /**
   * Create a new issue
   */
  async createIssue(input) {
    const {
      title,
      description = '',
      teamId,
      priority = 1,
      assigneeId = null,
      stateId = null,
      projectId = null,
      labelIds = [],
      dueDate = null
    } = input;

    const mutation = `
      mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            identifier
            title
            description
            state {
              id
              name
              type
              color
            }
            assignee {
              id
              name
              email
            }
            priority
            createdAt
            url
          }
        }
      }
    `;

    const variables = {
      input: {
        title,
        description,
        teamId,
        priority,
        ...(assigneeId && { assigneeId }),
        ...(stateId && { stateId }),
        ...(projectId && { projectId }),
        ...(labelIds.length > 0 && { labelIds }),
        ...(dueDate && { dueDate })
      }
    };

    try {
      const data = await this.graphqlQuery(mutation, variables);

      if (!data.issueCreate.success) {
        throw new Error('Failed to create issue');
      }

      return data.issueCreate.issue;
    } catch (error) {
      throw new Error(`Failed to create issue: ${error.message}`);
    }
  }

  /**
   * Update an existing issue
   */
  async updateIssue(issueId, input) {
    const mutation = `
      mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          success
          issue {
            id
            identifier
            title
            description
            state {
              id
              name
              type
              color
            }
            assignee {
              id
              name
              email
            }
            priority
            updatedAt
            url
          }
        }
      }
    `;

    const variables = {
      id: issueId,
      input
    };

    try {
      const data = await this.graphqlQuery(mutation, variables);

      if (!data.issueUpdate.success) {
        throw new Error('Failed to update issue');
      }

      return data.issueUpdate.issue;
    } catch (error) {
      throw new Error(`Failed to update issue: ${error.message}`);
    }
  }

  /**
   * Get issue states for a team
   */
  async getTeamStates(teamId) {
    const query = `
      query($teamId: String!) {
        team(id: $teamId) {
          states {
            nodes {
              id
              name
              type
              color
              position
            }
          }
        }
      }
    `;

    try {
      const data = await this.graphqlQuery(query, { teamId });
      return {
        states: data.team.states.nodes,
        totalCount: data.team.states.nodes.length
      };
    } catch (error) {
      throw new Error(`Failed to get team states: ${error.message}`);
    }
  }

  /**
   * Get projects
   */
  async getProjects(teamId = null) {
    const query = `
      query {
        projects {
          nodes {
            id
            name
            description
            state
            priority
            startDate
            targetDate
            createdAt
            updatedAt
            url
            teams {
              nodes {
                id
                name
                key
              }
            }
          }
        }
      }
    `;

    try {
      const data = await this.graphqlQuery(query);
      // Filter by team if provided
      let projects = data.projects.nodes;
      if (teamId) {
        projects = projects.filter(project =>
          project.teams.nodes.some(team => team.id === teamId)
        );
      }

      return {
        projects: projects,
        totalCount: projects.length
      };
    } catch (error) {
      throw new Error(`Failed to get projects: ${error.message}`);
    }
  }

  /**
   * Get issue by ID or identifier
   */
  async getIssue(issueId) {
    const query = `
      query($id: String!) {
        issue(id: $id) {
          id
          identifier
          title
          description
          state {
            id
            name
            type
            color
          }
          assignee {
            id
            name
            email
            avatarUrl
          }
          creator {
            id
            name
            email
          }
          priority
          createdAt
          updatedAt
          dueDate
          completedAt
          url
          project {
            id
            name
            state
          }
          labels {
            nodes {
              id
              name
              color
            }
          }
          comments {
            nodes {
              id
              body
              user {
                name
                email
              }
              createdAt
            }
          }
        }
      }
    `;

    try {
      const data = await this.graphqlQuery(query, { id: issueId });
      return data.issue;
    } catch (error) {
      throw new Error(`Failed to get issue: ${error.message}`);
    }
  }

  /**
   * Search issues by title or description
   */
  async searchIssues(searchTerm, teamId = null) {
    // Get issues and filter manually to avoid GraphQL filter issues
    const allIssues = await this.queryIssues({
      teamId,
      first: 50
    });

    // Filter issues by title containing search term (case insensitive)
    const filteredIssues = {
      issues: allIssues.issues.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (issue.description && issue.description.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
      totalCount: 0,
      pageInfo: allIssues.pageInfo
    };

    filteredIssues.totalCount = filteredIssues.issues.length;

    return filteredIssues;
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId) {
    const query = `
      query($teamId: String!) {
        team(id: $teamId) {
          members {
            nodes {
              id
              name
              email
              avatarUrl
              active
              admin
              guest
            }
          }
        }
      }
    `;

    try {
      const data = await this.graphqlQuery(query, { teamId });
      return {
        members: data.team.members.nodes,
        totalCount: data.team.members.nodes.length
      };
    } catch (error) {
      throw new Error(`Failed to get team members: ${error.message}`);
    }
  }

  /**
   * Helper method to build filter input for GraphQL
   */
  buildFilterInput(filter) {
    const buildFilterValue = (key, value) => {
      if (typeof value === 'string') {
        // For state type, we need to use the proper format
        if (key === 'state') {
          return `{ type: { eq: "${value}" } }`;
        }
        return `{ eq: "${value}" }`;
      } else if (typeof value === 'object' && value !== null) {
        const pairs = Object.entries(value).map(([k, v]) => {
          if (k === 'id' && key === 'team') {
            // Handle team ID filter differently
            return `eq: "${v}"`;
          }
          return `${k}: ${buildFilterValue(k, v)}`;
        });
        return `{ ${pairs.join(', ')} }`;
      }
      return value;
    };

    const pairs = Object.entries(filter).map(([key, value]) => `${key}: ${buildFilterValue(key, value)}`);
    return `{ ${pairs.join(', ')} }`;
  }

  /**
   * Validate API key by making a simple query
   */
  async validateApiKey() {
    try {
      const query = `
        query {
          viewer {
            id
            name
            email
          }
        }
      `;

      const data = await this.graphqlQuery(query);
      if (!data.viewer) {
        throw new Error('No viewer data returned from Linear API');
      }
      return {
        valid: true,
        user: data.viewer
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

module.exports = { LinearOperations };