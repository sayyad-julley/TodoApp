# mcp-context7

A minimal scaffold for a Context7 Model Context Protocol (MCP) server to be expanded when needed.

This provides a lightweight JSON-RPC over HTTP stub exposing two placeholder methods:
- `context7.ping` → returns a `pong`
- `context7.search` → not implemented yet (stub)

## Usage

1. Environment (optional):
   - `MCP_HOST` (default: `127.0.0.1`)
   - `MCP_PORT` (default: `7337`)

2. Start the server:

```bash
node ./src/cli.js
```

3. Call the RPC endpoint:

```bash
curl -s -X POST \
  -H 'content-type: application/json' \
  http://127.0.0.1:7337/rpc \
  -d '{"jsonrpc":"2.0","id":1,"method":"context7.ping","params":{}}'
```

Expected response:

```json
{"jsonrpc":"2.0","id":1,"result":{"ok":true,"message":"pong","timestamp":"..."}}
```

## Next Steps
- Replace HTTP stub with a full MCP transport if/when needed.
- Implement `context7.search` and other domain-specific tools.
- Add authentication and access control as requirements evolve.
