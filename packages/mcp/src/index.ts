/**
 * Raktamarga MCP Server
 * Entry point for the MCP server
 */

import { runStdioServer } from './server.js';

// Load config (this will also load .env)
import './config.js';

async function main() {
  try {
    await runStdioServer();
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

main();
