/**
 * Raktamarga MCP Server
 * Entry point for the MCP server
 *
 * Supports two transport modes:
 * - stdio (default): For local IDE integration
 * - sse: For remote access via HTTP/SSE
 *
 * Set MCP_TRANSPORT=sse to run as HTTP server
 */

import { runStdioServer } from './server.js';
import { runSseServer } from './sse-server.js';

// Load config (this will also load .env)
import './config.js';

async function main() {
  const transport = process.env.MCP_TRANSPORT || 'stdio';

  try {
    if (transport === 'sse') {
      console.log('Starting MCP server with SSE transport...');
      await runSseServer();
    } else {
      console.log('Starting MCP server with stdio transport...');
      await runStdioServer();
    }
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

main();
