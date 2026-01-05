/**
 * SSE Server implementation for remote MCP access
 *
 * Endpoints:
 * - GET /sse - Establish SSE stream (requires Bearer token)
 * - POST /messages?sessionId=xxx - Send messages to server (requires Bearer token)
 * - GET /health - Health check (no auth)
 */

import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

import { searchCodeTool, executeSearchCode } from './tools/search-code.js';
import { searchDocsTool, executeSearchDocs } from './tools/search-docs.js';
import { getFileTool, executeGetFile } from './tools/get-file.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Get auth token from environment
const MCP_AUTH_TOKEN = process.env.MCP_AUTH_TOKEN;

// Store active transports by session ID
const transports: Record<string, SSEServerTransport> = {};

/**
 * Create and configure the MCP server
 */
function createServer(): Server {
  const server = new Server(
    {
      name: 'raktamarga',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  // Register tool listing handler
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [searchCodeTool, searchDocsTool, getFileTool],
  }));

  // Register tool execution handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'search_code': {
          const result = await executeSearchCode(args as unknown as Parameters<typeof executeSearchCode>[0]);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'search_docs': {
          const result = await executeSearchDocs(args as unknown as Parameters<typeof executeSearchDocs>[0]);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'get_file': {
          const result = await executeGetFile(args as unknown as Parameters<typeof executeGetFile>[0]);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * Bearer token authentication middleware
 */
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  // Skip auth if no token is configured (development mode)
  if (!MCP_AUTH_TOKEN) {
    console.warn('⚠️ MCP_AUTH_TOKEN not set - running without authentication');
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.substring(7);
  if (token !== MCP_AUTH_TOKEN) {
    res.status(403).json({ error: 'Invalid token' });
    return;
  }

  next();
}

/**
 * Run the SSE server
 */
export async function runSseServer(): Promise<void> {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3001', 10);

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check (no auth)
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'raktamarga-mcp',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      activeSessions: Object.keys(transports).length
    });
  });

  // SSE endpoint for establishing the stream
  app.get('/sse', authMiddleware, async (req, res) => {
    console.log('SSE connection request received');

    try {
      // Create a new SSE transport
      const transport = new SSEServerTransport('/messages', res);
      const sessionId = transport.sessionId;

      // Store the transport
      transports[sessionId] = transport;
      console.log(`SSE stream established: ${sessionId}`);

      // Clean up on close
      transport.onclose = () => {
        console.log(`SSE stream closed: ${sessionId}`);
        delete transports[sessionId];
      };

      // Connect to MCP server
      const server = createServer();
      await server.connect(transport);
    } catch (error) {
      console.error('Error establishing SSE stream:', error);
      if (!res.headersSent) {
        res.status(500).send('Error establishing SSE stream');
      }
    }
  });

  // Messages endpoint for receiving client JSON-RPC requests
  app.post('/messages', authMiddleware, async (req, res) => {
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      res.status(400).json({ error: 'Missing sessionId parameter' });
      return;
    }

    const transport = transports[sessionId];
    if (!transport) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    try {
      await transport.handlePostMessage(req, res, req.body);
    } catch (error) {
      console.error('Error handling message:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error handling request' });
      }
    }
  });

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      service: 'Raktamarga MCP Server',
      version: '0.1.0',
      endpoints: {
        health: '/health',
        sse: '/sse (requires Bearer token)',
        messages: '/messages?sessionId=xxx (requires Bearer token)'
      },
      documentation: 'Connect via SSE to /sse with Authorization: Bearer <token>'
    });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Raktamarga MCP SSE server running on port ${PORT}`);
    console.log(`📡 SSE endpoint: http://localhost:${PORT}/sse`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    if (MCP_AUTH_TOKEN) {
      console.log(`🔐 Authentication: Enabled (Bearer token required)`);
    } else {
      console.log(`⚠️  Authentication: Disabled (set MCP_AUTH_TOKEN to enable)`);
    }
  });

  // Handle shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down SSE server...');
    for (const sessionId in transports) {
      try {
        await transports[sessionId].close();
        delete transports[sessionId];
      } catch (error) {
        console.error(`Error closing session ${sessionId}:`, error);
      }
    }
    process.exit(0);
  });
}
