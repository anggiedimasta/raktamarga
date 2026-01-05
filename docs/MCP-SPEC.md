# Raktamarga MCP Server Specification

MCP server for semantic code search via Pinecone vectors.

---

## Overview

| Aspect | Decision |
|--------|----------|
| **Repo** | `raktamarga-mcp` (separate repository) |
| **Runtime** | Bun + TypeScript |
| **Deployment** | Railway (free tier) |
| **Transport** | SSE (for deployed), stdio (for local) |
| **Vector DB** | Pinecone `raktamarga` index |

---

## MCP Tools

### Core Search Tools

#### `search_code`
Semantic search across source code.

```typescript
{
  name: "search_code",
  description: "Search codebase for relevant code snippets",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Natural language search query" },
      limit: { type: "number", default: 5, description: "Max results" },
      package: { type: "string", description: "Filter by package (web, api, db, etc.)" },
      language: { type: "string", description: "Filter by language" }
    },
    required: ["query"]
  }
}
```

#### `search_docs`
Search documentation only.

```typescript
{
  name: "search_docs",
  description: "Search markdown documentation",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string" },
      limit: { type: "number", default: 5 }
    },
    required: ["query"]
  }
}
```

---

### File Retrieval Tools

#### `get_file`
Retrieve full file content by path.

```typescript
{
  name: "get_file",
  description: "Get complete file content from the repository",
  inputSchema: {
    type: "object",
    properties: {
      path: { type: "string", description: "File path relative to repo root" }
    },
    required: ["path"]
  }
}
```

#### `get_chunk_context`
Get surrounding context for a search result.

```typescript
{
  name: "get_chunk_context",
  description: "Get expanded context around a code chunk",
  inputSchema: {
    type: "object",
    properties: {
      chunkId: { type: "string", description: "Chunk ID from search results" },
      expandLines: { type: "number", default: 20 }
    },
    required: ["chunkId"]
  }
}
```

---

### Analysis Tools

#### `find_similar`
Find code similar to a given snippet.

```typescript
{
  name: "find_similar",
  description: "Find code similar to the provided snippet",
  inputSchema: {
    type: "object",
    properties: {
      code: { type: "string", description: "Code snippet to find similar code for" },
      limit: { type: "number", default: 5 },
      excludeFile: { type: "string", description: "Exclude results from this file" }
    },
    required: ["code"]
  }
}
```

#### `explain_code`
Retrieve code with context for explanation.

```typescript
{
  name: "explain_code",
  description: "Get code with context to explain a function or concept",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "What to explain (function name, concept)" }
    },
    required: ["query"]
  }
}
```

#### `list_functions`
List all functions/exports in a file.

```typescript
{
  name: "list_functions",
  description: "List all functions and exports in a file or module",
  inputSchema: {
    type: "object",
    properties: {
      path: { type: "string", description: "File or directory path" }
    },
    required: ["path"]
  }
}
```

---

### Additional Tools

#### `get_dependencies`
Find what a file imports/depends on.

```typescript
{
  name: "get_dependencies",
  description: "Get imports and dependencies for a file",
  inputSchema: {
    type: "object",
    properties: {
      path: { type: "string" }
    },
    required: ["path"]
  }
}
```

#### `find_usages`
Find where a function/export is used.

```typescript
{
  name: "find_usages",
  description: "Find all usages of a function or export",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Function or export name" },
      limit: { type: "number", default: 10 }
    },
    required: ["name"]
  }
}
```

#### `search_by_type`
Search by code element type.

```typescript
{
  name: "search_by_type",
  description: "Find all elements of a specific type",
  inputSchema: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["function", "class", "interface", "type", "export"],
        description: "Type of code element to find"
      },
      package: { type: "string" },
      limit: { type: "number", default: 20 }
    },
    required: ["type"]
  }
}
```

---

## Project Structure

```
raktamarga-mcp/
├── src/
│   ├── index.ts              # MCP server entry
│   ├── server.ts             # Server setup (stdio/SSE)
│   ├── tools/
│   │   ├── search-code.ts
│   │   ├── search-docs.ts
│   │   ├── get-file.ts
│   │   ├── find-similar.ts
│   │   ├── explain-code.ts
│   │   ├── list-functions.ts
│   │   ├── get-dependencies.ts
│   │   ├── find-usages.ts
│   │   └── search-by-type.ts
│   ├── services/
│   │   ├── pinecone.ts       # Pinecone client
│   │   ├── embedder.ts       # OpenAI embeddings
│   │   └── github.ts         # GitHub API for file content
│   └── config.ts
├── package.json
├── tsconfig.json
├── railway.toml
└── README.md
```

---

## Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=pcsk_...
GITHUB_TOKEN=ghp_...          # For file content retrieval

# Optional
PINECONE_INDEX=raktamarga
GITHUB_REPO=anggiedimasta/raktamarga
GITHUB_BRANCH=main
```

---

## Railway Deployment

```toml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "bun run src/index.ts"
healthcheckPath = "/health"
```

**Railway Config:**
- Region: Same as Pinecone (us-east-1)
- Public networking enabled
- Environment variables set in Railway dashboard

---

## MCP Client Configuration

### Claude Desktop
```json
{
  "mcpServers": {
    "raktamarga": {
      "url": "https://raktamarga-mcp.up.railway.app/sse"
    }
  }
}
```

### Local Development (stdio)
```json
{
  "mcpServers": {
    "raktamarga": {
      "command": "bun",
      "args": ["run", "/path/to/raktamarga-mcp/src/index.ts"],
      "env": {
        "OPENAI_API_KEY": "...",
        "PINECONE_API_KEY": "...",
        "GITHUB_TOKEN": "..."
      }
    }
  }
}
```

---

## Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "@pinecone-database/pinecone": "^2.0.0",
    "openai": "^4.0.0",
    "octokit": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## Implementation Phases

### Phase 1: Core Server
- [ ] MCP server setup (stdio transport)
- [ ] Pinecone client integration
- [ ] `search_code` tool
- [ ] `search_docs` tool
- [ ] `get_file` tool (via GitHub API)

### Phase 2: Advanced Search
- [ ] `find_similar` tool
- [ ] `explain_code` tool
- [ ] `list_functions` tool

### Phase 3: Analysis
- [ ] `get_dependencies` tool
- [ ] `find_usages` tool
- [ ] `search_by_type` tool

### Phase 4: Deployment
- [ ] SSE transport support
- [ ] Railway deployment
- [ ] Health check endpoint
- [ ] README with setup instructions

---

## Response Format

All tools return structured responses:

```typescript
interface SearchResult {
  chunks: Array<{
    id: string;
    score: number;
    content: string;
    metadata: {
      filePath: string;
      package: string;
      chunkType: string;
      name?: string;
      startLine: number;
      endLine: number;
    };
  }>;
  totalFound: number;
}

interface FileResult {
  path: string;
  content: string;
  language: string;
  lastModified: string;
}
```
