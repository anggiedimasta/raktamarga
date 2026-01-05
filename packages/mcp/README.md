# Raktamarga MCP Server

MCP (Model Context Protocol) server for semantic code search in the Raktamarga codebase.

## Features

- **search_code** - Semantic search across source code
- **search_docs** - Search markdown documentation
- **get_file** - Retrieve complete file content from GitHub

## Setup

### Environment Variables

Create a `.env` file in the repository root:

```bash
GEMINI_API_KEY=your-gemini-api-key
PINECONE_API_KEY=your-pinecone-api-key
GITHUB_TOKEN=your-github-token     # Optional, for private repos
MCP_AUTH_TOKEN=your-secure-token   # Required for SSE server authentication
```

### Install Dependencies

```bash
bun install
```

## Running the Server

### Stdio Transport (Local Development)

```bash
# Default stdio mode
bun run --filter=@raktamarga/mcp dev
```

### SSE Transport (Remote Access)

```bash
# Run as SSE server on port 3001
MCP_TRANSPORT=sse bun run --filter=@raktamarga/mcp start
```

**Endpoints:**
- `GET /sse` - Establish SSE stream (requires Bearer token)
- `POST /messages?sessionId=xxx` - Send messages (requires Bearer token)
- `GET /health` - Health check (no auth)

## Authentication

The SSE server uses Bearer token authentication. Set `MCP_AUTH_TOKEN` in your environment.

```bash
# Test authentication
curl -H "Authorization: Bearer YOUR_TOKEN" https://your-server.up.railway.app/sse
```

> **Note:** If `MCP_AUTH_TOKEN` is not set, the server runs without authentication (development only).

## Client Configuration

### Gemini CLI / Antigravity

Add to `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "raktamarga": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://your-raktamarga-mcp.up.railway.app/sse",
        "--header",
        "Authorization: Bearer YOUR_MCP_AUTH_TOKEN"
      ]
    }
  }
}
```

### Claude Desktop (Local)

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "raktamarga": {
      "command": "bun",
      "args": ["run", "/path/to/raktamarga/packages/mcp/src/index.ts"],
      "env": {
        "GEMINI_API_KEY": "your-api-key",
        "PINECONE_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Claude Desktop (Remote via SSE)

```json
{
  "mcpServers": {
    "raktamarga": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://your-raktamarga-mcp.up.railway.app/sse",
        "--header",
        "Authorization: Bearer YOUR_MCP_AUTH_TOKEN"
      ]
    }
  }
}
```

## Deployment

The MCP server is deployed to Railway. Ensure these environment variables are set:

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for embeddings |
| `PINECONE_API_KEY` | Yes | Pinecone API key for vector search |
| `GITHUB_TOKEN` | No | GitHub token for private repo access |
| `MCP_AUTH_TOKEN` | Yes | Bearer token for SSE authentication |
| `MCP_TRANSPORT` | Yes | Set to `sse` for Railway deployment |

## Tools

### search_code

Search the codebase for relevant code snippets.

```json
{
  "query": "authentication flow",
  "limit": 5,
  "package": "api"
}
```

### search_docs

Search markdown documentation.

```json
{
  "query": "deployment instructions",
  "limit": 5
}
```

### get_file

Get complete file content by path.

```json
{
  "path": "apps/web/src/routes/index.tsx"
}
```
