#!/usr/bin/env node
import { startServer } from './mcp-server.js';

// Simple CLI to start the MCP server
const port = process.env.MCP_PORT ? Number(process.env.MCP_PORT) : 7337;
const host = process.env.MCP_HOST || '127.0.0.1';

startServer({ host, port }).catch((err) => {
  console.error('Context7 MCP server failed to start:', err);
  process.exit(1);
});


