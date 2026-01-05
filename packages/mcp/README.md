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
GITHUB_TOKEN=your-github-token  # Optional, for private repos
```

### Install Dependencies

```bash
bun install
```

### Run Locally

```bash
bun run --filter=@raktamarga/mcp dev
```

## Claude Desktop Configuration

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

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
