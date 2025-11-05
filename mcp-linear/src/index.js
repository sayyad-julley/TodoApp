#!/usr/bin/env node

const { LinearMCPServer } = require('./mcp-server.js');

/**
 * Main entry point for Linear MCP Server
 */
async function main() {
  try {
    const server = new LinearMCPServer();
    await server.start();
  } catch (error) {
    console.error('Failed to start Linear MCP server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the server
main();