# Linear MCP Server

A comprehensive Model Context Protocol (MCP) server for Linear project management and issue tracking, enabling AI assistants to seamlessly interact with Linear workspaces.

## Features

- 🚀 **Full MCP Protocol Support**: Complete implementation of the Model Context Protocol
- 🔧 **Linear GraphQL Integration**: Direct access to Linear's powerful GraphQL API
- 🤖 **AI Assistant Ready**: Optimized for Claude Desktop and other AI assistants
- 📊 **AWS XRay Tracing**: Built-in monitoring and tracing capabilities
- 🛠️ **CLI Tools**: Command-line interface for setup, testing, and demos
- 🔒 **Secure**: Secure API key management and validation
- 📝 **Rich Operations**: Complete CRUD operations for issues, teams, and projects

## Quick Start

### 1. Installation

```bash
cd mcp-linear
npm install
```

### 2. Setup

```bash
# Interactive setup wizard
npx mcp-linear setup

# Or test with an existing API key
npx mcp-linear test --api-key YOUR_LINEAR_API_KEY
```

### 3. Claude Desktop Integration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "linear": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-linear/src/index.js"],
      "env": {
        "LINEAR_API_KEY": "your-linear-api-key-here"
      }
    }
  }
}
```

### 4. Start Server

```bash
# Start MCP server (stdio mode)
npx mcp-linear start

# Or set environment variable and run
export LINEAR_API_KEY=your-api-key
node src/index.js
```

## Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `init_linear` | Initialize Linear API connection | `apiKey` |
| `query_teams` | Get all teams in workspace | - |
| `query_issues` | Query issues with filtering | `teamId`, `first`, `filter` |
| `create_issue` | Create new issue | `title`, `teamId`, `description`, `priority`, `assigneeId`, `stateId`, `projectId`, `dueDate` |
| `get_issue` | Get issue details | `issueId` |
| `update_issue` | Update existing issue | `issueId`, `title`, `description`, `stateId`, `assigneeId`, `priority`, `dueDate` |
| `search_issues` | Search issues by title/description | `searchTerm`, `teamId` |
| `get_team_states` | Get team workflow states | `teamId` |
| `get_projects` | Get projects | `teamId` |
| `get_team_members` | Get team members | `teamId` |

## CLI Commands

```bash
# Setup wizard
npx mcp-linear setup

# Test API connection
npx mcp-linear test --api-key YOUR_API_KEY

# Run demo of all operations
npx mcp-linear demo --api-key YOUR_API_KEY

# Start MCP server
npx mcp-linear start
```

## Configuration

### Environment Variables

```bash
# Required
export LINEAR_API_KEY=lin_api_your_api_key_here

# Optional
export SERVICE_NAME=mcp-linear  # For XRay tracing
```

### Linear API Key Setup

1. Go to Linear → Settings → API
2. Click "Create Key" under Personal API Keys
3. Enter a descriptive label (e.g., "MCP Integration")
4. Copy the key immediately (starts with `lin_api_`)

## Usage Examples

### Creating Issues

```json
{
  "tool": "create_issue",
  "arguments": {
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication with refresh tokens",
    "teamId": "your-team-id",
    "priority": 1,
    "assigneeId": "user-id-here"
  }
}
```

### Querying Issues

```json
{
  "tool": "query_issues",
  "arguments": {
    "teamId": "your-team-id",
    "filter": {
      "state": { "type": "started" },
      "priority": { "gte": 2 }
    }
  }
}
```

### Updating Issues

```json
{
  "tool": "update_issue",
  "arguments": {
    "issueId": "ENG-123",
    "stateId": "completed-state-id"
  }
}
```

## Development

### Project Structure

```
mcp-linear/
├── src/
│   ├── cli.js              # CLI interface
│   ├── index.js            # MCP server entry point
│   ├── mcp-server.js       # Main MCP server implementation
│   └── linear-operations.js # Linear API operations wrapper
├── package.json
└── README.md
```

### Local Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev

# Test API connection
npm run test:api
```

### Adding New Tools

1. Add tool definition in `src/mcp-server.js` (ListToolsRequestSchema)
2. Implement handler in `src/mcp-server.js` (CallToolRequestSchema)
3. Add Linear API method in `src/linear-operations.js`
4. Update CLI if needed
5. Add tests and documentation

## Security

- 🔒 API keys are validated and masked in logs
- 🛡️ Input validation for all parameters
- 📊 XRay tracing for monitoring (can be disabled)
- 🔐 No credentials stored in code or configuration files

## Troubleshooting

### Common Issues

1. **API Authentication Failed**
   - Verify API key starts with `lin_api_`
   - Check API key permissions in Linear
   - Test with `npx mcp-linear test`

2. **Claude Desktop Not Working**
   - Verify absolute file paths in config
   - Check API key is properly set
   - Restart Claude Desktop after config changes

3. **Server Won't Start**
   - Check Node.js version (18+ required)
   - Verify all dependencies installed
   - Check for port conflicts

### Debug Mode

```bash
# Enable debug logging
DEBUG=mcp-linear:* node src/index.js

# Test API connection
npx mcp-linear test --api-key YOUR_KEY
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

- 📖 [Documentation](../docs/integrations/mcp-linear.mdx)
- 🐛 [Issues](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)