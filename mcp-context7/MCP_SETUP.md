# Context7 MCP Setup

This guide explains how to run and integrate the `mcp-context7` server for future needs.

## Prerequisites
- Node.js 18+

## Install dependencies (none required)
This scaffold has no external dependencies. If you add packages later, install them within `mcp-context7/`.

## Run the MCP server
From the repository root:

```bash
node mcp-context7/src/cli.js
```

Optional environment variables:
- `MCP_HOST` (default: `127.0.0.1`)
- `MCP_PORT` (default: `7337`)

## Test a request
```bash
curl -s -X POST \
  -H 'content-type: application/json' \
  http://127.0.0.1:7337/rpc \
  -d '{"jsonrpc":"2.0","id":1,"method":"context7.ping","params":{}}'
```

## Integration notes
- The server currently exposes a minimal JSON-RPC over HTTP endpoint at `/rpc`.
- Methods implemented:
  - `context7.ping`: Health check
  - `context7.search`: Stub (returns NotImplemented)
- When requirements arise, implement additional methods in `mcp-context7/src/mcp-server.js`.
- If you need the official MCP transport/protocol, replace the HTTP stub with an MCP-compliant server and update `src/cli.js` accordingly.
