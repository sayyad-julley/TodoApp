#!/usr/bin/env node

import { SecretsManagerMCPServer } from './mcp-server.js';

/**
 * Main entry point for the MCP server
 */
async function main() {
  const server = new SecretsManagerMCPServer();

  try {
    await server.start();
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.error('\nReceived SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('\nReceived SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the server
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});