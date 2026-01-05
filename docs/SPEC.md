# Raktamarga Codebase Embeddings Specification

Vector embedding pipeline for indexing codebase into Pinecone.

---

## Overview

| Aspect | Decision |
|--------|----------|
| **Purpose** | Code discovery, chat assistant, similarity search |
| **Location** | `packages/embeddings` |
| **Trigger** | GitHub Actions on push to `main` |
| **Embedding Model** | Google Gemini `text-embedding-004` (512 dims) |
| **Vector DB** | Pinecone Serverless (us-east-1) |
| **Index Name** | `raktamarga` |
| **Namespaces** | `code`, `docs` |

---

## Chunking Strategy

**Hybrid approach:**

### Code Files (`.ts`, `.tsx`, `.js`, `.jsx`)
- Parse AST to extract functions, classes, exports
- Each semantic unit becomes a chunk
- Include file-level metadata on each chunk
- Fallback to fixed-size chunks (1000 chars, 200 overlap) for non-parseable files

### Documentation (`.md`)
- Split by headers (h1, h2, h3)
- Each section becomes a chunk
- Preserve header hierarchy in metadata

### Config Files (`.json`, `.yaml`)
- Index as single chunk per file
- Lower priority in search results

---

## Metadata Schema

```typescript
interface ChunkMetadata {
  // File info
  filePath: string;          // "apps/web/src/routes/index.tsx"
  fileName: string;          // "index.tsx"
  language: string;          // "typescript" | "markdown" | "json"
  package: string;           // "web" | "api" | "db" | "auth" | "shared" | "ui"

  // Semantic info (code files only)
  chunkType: string;         // "function" | "class" | "export" | "section" | "file"
  name?: string;             // "handleLogin" | "UserService"
  exports?: string[];        // ["default", "useAuth"]
  imports?: string[];        // ["react", "@raktamarga/db"]

  // Position
  startLine: number;
  endLine: number;

  // Git info
  lastModified: string;      // ISO date
}
```

---

## File Inclusion/Exclusion

**Include:**
- `apps/**/*.{ts,tsx,js,jsx}`
- `packages/**/*.{ts,tsx,js,jsx}`
- `docs/**/*.md`
- `*.md` (root docs)

**Exclude (from .gitignore + extras):**
- `node_modules/**`
- `**/dist/**`, `**/build/**`
- `**/*.gen.ts` (generated files)
- `**/coverage/**`, `**/test-results/**`
- `.env*`, `*.log`, `*.lock`
- `.git/**`, `.vscode/**`, `.idea/**`
- `packages/embeddings/**` (prevent circular indexing)

---

## Package Structure

```
packages/embeddings/
├── src/
│   ├── index.ts              # Main entry point
│   ├── chunker/
│   │   ├── index.ts          # Chunker orchestrator
│   │   ├── ast-parser.ts     # TypeScript AST parsing
│   │   ├── markdown-splitter.ts
│   │   └── fallback-splitter.ts
│   ├── embedder/
│   │   ├── index.ts          # Gemini embedding client
│   │   └── batch.ts          # Batching & rate limiting
│   ├── indexer/
│   │   ├── index.ts          # Pinecone upserter
│   │   └── incremental.ts    # Diff-based updates
│   ├── scanner/
│   │   ├── index.ts          # File discovery
│   │   └── git-diff.ts       # Changed files detection
│   └── config.ts             # Configuration
├── package.json
└── tsconfig.json
```

---

## Environment Variables

```bash
# Required
GEMINI_API_KEY=AIzaSy...
PINECONE_API_KEY=pcsk_...

# Optional (defaults shown)
PINECONE_INDEX=raktamarga
PINECONE_ENVIRONMENT=us-east-1
EMBEDDING_MODEL=text-embedding-004
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

---

## GitHub Actions Workflow

```yaml
# .github/workflows/index-codebase.yml
name: Index Codebase

on:
  push:
    branches: [main]
    paths-ignore:
      - 'packages/embeddings/**'
      - '.github/workflows/index-codebase.yml'

jobs:
  index:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2  # For diff detection

      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install --filter=@raktamarga/embeddings

      - name: Run indexer
        run: bun run --filter=@raktamarga/embeddings index
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          PINECONE_API_KEY: ${{ secrets.PINECONE_API_KEY }}
          EMBEDDING_MODEL: text-embedding-004
```

---

## Incremental Update Strategy

1. **On push to main:**
   - Get changed files via `git diff HEAD~1`
   - Filter to indexable files only
   - For modified/added files: re-chunk → re-embed → upsert
   - For deleted files: remove vectors by file path prefix

2. **Vector ID format:**
   ```
   {namespace}:{filePath}:{chunkIndex}
   ```
   Example: `code:apps/web/src/routes/index.tsx:0`

3. **Full re-index:**
   - Manual trigger via workflow dispatch
   - Deletes all vectors in namespace before upserting

---

## Cost Estimation

| Metric | Value |
|--------|-------|
| Files to index | ~166 |
| Total source size | ~387 KB |
| Estimated tokens | ~100K |
| Cost per full index | ~$0.002 |
| Monthly cost (daily updates) | < $0.10 |

Fits comfortably in free/hobby tiers.

---

## Implementation Phases

### Phase 1: Core Indexing
- [x] Package setup with dependencies
- [x] File scanner with gitignore support
- [x] Basic chunker (fixed-size fallback)
- [x] Gemini embedding integration
- [x] Pinecone upsert logic
- [x] CLI entry point

### Phase 2: Smart Chunking
- [x] TypeScript AST parser
- [x] Markdown header splitter
- [x] Metadata extraction

### Phase 3: Incremental Updates
- [x] Git diff detection
- [x] Selective re-indexing
- [x] Deletion handling

### Phase 4: CI/CD
- [x] GitHub Actions workflow
- [x] Workflow dispatch for manual runs
- [x] Logging and error reporting

---

## Dependencies

```json
{
  "dependencies": {
    "@pinecone-database/pinecone": "^2.0.0",
    "@google/generative-ai": "^0.21.0",
    "typescript": "^5.0.0",
    "glob": "^10.0.0",
    "ignore": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```