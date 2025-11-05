const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema
} = require('@modelcontextprotocol/sdk/types.js');
const { LinearOperations } = require('./linear-operations.js');

// Note: AWS XRay integration disabled for simplicity
// Can be re-enabled later if needed
console.log('Linear MCP Server initialized');

/**
 * MCP Server for Linear Project Management
 */
class LinearMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'linear-project-manager',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.linearOps = null;
    this.setupToolHandlers();
  }

  /**
   * Initialize Linear API connection
   */
  async initializeLinear(apiKey) {
    try {
      if (!apiKey) {
        throw new Error('Linear API key is required');
      }

      this.linearOps = new LinearOperations(apiKey);

      // Validate API key
      const validation = await this.linearOps.validateApiKey();

      if (!validation.valid) {
        throw new Error(`Invalid API key: ${validation.error}`);
      }

      return {
        success: true,
        user: validation.user,
        apiKey: apiKey.substring(0, 10) + '...' // Mask API key in response
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
            name: 'init_linear',
            description: 'Initialize Linear API connection with your API key',
            inputSchema: {
              type: 'object',
              properties: {
                apiKey: {
                  type: 'string',
                  description: 'Linear Personal API Key (starts with lin_api_)'
                }
              },
              required: ['apiKey']
            }
          },
          {
            name: 'query_teams',
            description: 'Query all teams in your Linear workspace',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'query_issues',
            description: 'Query issues with optional filtering by team and other criteria',
            inputSchema: {
              type: 'object',
              properties: {
                teamId: {
                  type: 'string',
                  description: 'Team ID to filter issues (optional)'
                },
                first: {
                  type: 'number',
                  description: 'Number of issues to return (default: 50)',
                  default: 50
                },
                filter: {
                  type: 'object',
                  description: 'Filter criteria (optional)',
                  properties: {
                    state: {
                      type: 'object',
                      properties: {
                        type: { type: 'string', enum: ['backlog', 'unstarted', 'started', 'completed', 'canceled'] }
                      }
                    },
                    priority: {
                      type: 'object',
                      properties: {
                        gte: { type: 'number', minimum: 0, maximum: 4 },
                        lte: { type: 'number', minimum: 0, maximum: 4 }
                      }
                    },
                    assignee: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          },
          {
            name: 'create_issue',
            description: 'Create a new Linear issue',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Issue title'
                },
                description: {
                  type: 'string',
                  description: 'Issue description (supports Markdown)'
                },
                teamId: {
                  type: 'string',
                  description: 'Team ID where the issue should be created'
                },
                priority: {
                  type: 'number',
                  description: 'Issue priority (0=No priority, 1=Urgent, 2=High, 3=Normal, 4=Low)',
                  minimum: 0,
                  maximum: 4,
                  default: 3
                },
                assigneeId: {
                  type: 'string',
                  description: 'User ID to assign the issue to (optional)'
                },
                stateId: {
                  type: 'string',
                  description: 'State ID to set the issue to (optional, defaults to team\'s first state)'
                },
                projectId: {
                  type: 'string',
                  description: 'Project ID to associate the issue with (optional)'
                },
                dueDate: {
                  type: 'string',
                  description: 'Due date in ISO format (optional)'
                }
              },
              required: ['title', 'teamId']
            }
          },
          {
            name: 'get_issue',
            description: 'Get detailed information about a specific issue',
            inputSchema: {
              type: 'object',
              properties: {
                issueId: {
                  type: 'string',
                  description: 'Issue ID or identifier (e.g., "ENG-123")'
                }
              },
              required: ['issueId']
            }
          },
          {
            name: 'update_issue',
            description: 'Update an existing issue',
            inputSchema: {
              type: 'object',
              properties: {
                issueId: {
                  type: 'string',
                  description: 'Issue ID or identifier'
                },
                title: {
                  type: 'string',
                  description: 'New issue title (optional)'
                },
                description: {
                  type: 'string',
                  description: 'New issue description (optional)'
                },
                stateId: {
                  type: 'string',
                  description: 'New state ID (optional)'
                },
                assigneeId: {
                  type: 'string',
                  description: 'New assignee ID (optional, null to unassign)'
                },
                priority: {
                  type: 'number',
                  description: 'New priority (0-4) (optional)',
                  minimum: 0,
                  maximum: 4
                },
                dueDate: {
                  type: 'string',
                  description: 'New due date in ISO format (optional)'
                }
              },
              required: ['issueId']
            }
          },
          {
            name: 'search_issues',
            description: 'Search issues by title or description',
            inputSchema: {
              type: 'object',
              properties: {
                searchTerm: {
                  type: 'string',
                  description: 'Search term to look for in issue titles'
                },
                teamId: {
                  type: 'string',
                  description: 'Team ID to limit search to (optional)'
                }
              },
              required: ['searchTerm']
            }
          },
          {
            name: 'get_team_states',
            description: 'Get all available states for a team',
            inputSchema: {
              type: 'object',
              properties: {
                teamId: {
                  type: 'string',
                  description: 'Team ID to get states for'
                }
              },
              required: ['teamId']
            }
          },
          {
            name: 'get_projects',
            description: 'Get projects with optional team filtering',
            inputSchema: {
              type: 'object',
              properties: {
                teamId: {
                  type: 'string',
                  description: 'Team ID to filter projects (optional)'
                }
              }
            }
          },
          {
            name: 'get_team_members',
            description: 'Get all members of a team',
            inputSchema: {
              type: 'object',
              properties: {
                teamId: {
                  type: 'string',
                  description: 'Team ID to get members for'
                }
              },
              required: ['teamId']
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Initialize Linear if not already done
        if (!this.linearOps && name !== 'init_linear') {
          throw new Error('Linear not initialized. Please call init_linear first with your API key.');
        }

        switch (name) {
          case 'init_linear':
            return await this.handleInitLinear(args);

          case 'query_teams':
            return await this.handleQueryTeams();

          case 'query_issues':
            return await this.handleQueryIssues(args);

          case 'create_issue':
            return await this.handleCreateIssue(args);

          case 'get_issue':
            return await this.handleGetIssue(args);

          case 'update_issue':
            return await this.handleUpdateIssue(args);

          case 'search_issues':
            return await this.handleSearchIssues(args);

          case 'get_team_states':
            return await this.handleGetTeamStates(args);

          case 'get_projects':
            return await this.handleGetProjects(args);

          case 'get_team_members':
            return await this.handleGetTeamMembers(args);

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

  async handleInitLinear(args) {
    try {
      const result = await this.initializeLinear(args.apiKey);

      if (result.success) {
        return {
          content: [
            {
              type: 'text',
              text: `Linear API initialized successfully.\n\nUser: ${result.user.name} (${result.user.email})\nAPI Key: ${result.apiKey}`
            }
          ]
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to initialize Linear API: ${result.error}`
            }
          ],
          isError: true
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error initializing Linear API: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async handleQueryTeams() {
    try {
      const result = await this.linearOps.queryTeams();
      return {
        content: [
          {
            type: 'text',
            text: `Found ${result.totalCount} teams:\n\n${JSON.stringify(result, null, 2)}`
          }
        ]
      };
    } catch (error) {
      throw error;
    }
  }

  async handleQueryIssues(args) {
    try {
      const result = await this.linearOps.queryIssues(args);
      return {
        content: [
          {
            type: 'text',
            text: `Found ${result.totalCount} issues:\n\n${JSON.stringify(result, null, 2)}`
          }
        ]
      };
    } catch (error) {
      throw error;
    }
  }

  async handleCreateIssue(args) {
    try {
      const result = await this.linearOps.createIssue(args);
      return {
        content: [
          {
            type: 'text',
            text: `Issue created successfully:\n\n${JSON.stringify(result, null, 2)}\n\nURL: ${result.url}`
          }
        ]
      };
    } catch (error) {
      throw error;
    }
  }

  async handleGetIssue(args) {
    try {
      const result = await this.linearOps.getIssue(args.issueId);
      return {
        content: [
          {
            type: 'text',
            text: `Issue details:\n\n${JSON.stringify(result, null, 2)}`
          }
        ]
      };
    } catch (error) {
      throw error;
    }
  }

  async handleUpdateIssue(args) {
    try {
      const { issueId, ...updateData } = args;
      const result = await this.linearOps.updateIssue(issueId, updateData);
      return {
        content: [
          {
            type: 'text',
            text: `Issue updated successfully:\n\n${JSON.stringify(result, null, 2)}\n\nURL: ${result.url}`
          }
        ]
      };
    } catch (error) {
      throw error;
    }
  }

  async handleSearchIssues(args) {
    try {
      const result = await this.linearOps.searchIssues(args.searchTerm, args.teamId);
      return {
        content: [
          {
            type: 'text',
            text: `Search results for "${args.searchTerm}" (${result.totalCount} found):\n\n${JSON.stringify(result, null, 2)}`
          }
        ]
      };
    } catch (error) {
      throw error;
    }
  }

  async handleGetTeamStates(args) {
    try {
      const result = await this.linearOps.getTeamStates(args.teamId);
      return {
        content: [
          {
            type: 'text',
            text: `Team states (${result.totalCount} found):\n\n${JSON.stringify(result, null, 2)}`
          }
        ]
      };
    } catch (error) {
      throw error;
    }
  }

  async handleGetProjects(args) {
    try {
      const result = await this.linearOps.getProjects(args.teamId);
      return {
        content: [
          {
            type: 'text',
            text: `Projects (${result.totalCount} found):\n\n${JSON.stringify(result, null, 2)}`
          }
        ]
      };
    } catch (error) {
      throw error;
    }
  }

  async handleGetTeamMembers(args) {
    try {
      const result = await this.linearOps.getTeamMembers(args.teamId);
      return {
        content: [
          {
            type: 'text',
            text: `Team members (${result.totalCount} found):\n\n${JSON.stringify(result, null, 2)}`
          }
        ]
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Start the MCP server
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Linear MCP server running on stdio');
  }
}

module.exports = { LinearMCPServer };