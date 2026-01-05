# Architecture Documentation

## Monorepo Structure

This project uses a Bun workspace monorepo with the following structure:

```
raktamarga/
├── apps/
│   ├── web/          # React 19 frontend (TanStack Start)
│   └── api/          # Elysia backend (feature-based)
├── packages/
│   ├── mcp/          # Model Context Protocol server (SSE)
│   ├── embeddings/   # AI Embeddings & Indexing logic
│   ├── ui/           # Shared React components (shadcn/ui)
│   ├── db/           # Database schema & migrations (Drizzle)
│   ├── auth/         # BetterAuth configuration
│   └── shared/       # Shared utilities & types
└── docs/             # Documentation
```

## Frontend Architecture (TanStack Start)

The frontend uses TanStack Start with React:

- **app/** - Application layer (providers, root layout)
- **routes/** - Typed route tree (__root.tsx, index.tsx, etc.) - TanStack Router
- **features/** - Feature-specific logic (React hooks + TanStack Query)
- **entities/** - Domain entities (Family, Member, etc.)
- **shared/** - Shared UI (shadcn/ui), tRPC client, utilities, config

## Backend Architecture (Feature-Based)

The backend uses feature-based modules:

- Each module contains:
  - `index.ts` - Controller (tRPC router)
  - `service.ts` - Business logic (using Effect for error handling)
  - `model.ts` - Validation schemas

**Effect Integration:**
- Service layer methods use Effect for type-safe error handling
- Database operations wrapped in Effect for better error propagation
- Dependency injection via Effect Context system
- Built-in observability (logging, metrics, tracing)

## Database

- PostgreSQL on Neon
- Drizzle ORM for type-safe queries
- Schema defined in `packages/db/src/schema/`

## API

- tRPC for end-to-end type safety
- Elysia framework with `@elysiajs/trpc` plugin

## AI & MCP (Model Context Protocol)

The project includes a dedicated MCP server and an embeddings pipeline to enhance AI-assisted development:

- **@raktamarga/mcp**:
  - Provides custom tools for AI agents to search and read the codebase.
  - Supports standard and SSE (Server-Sent Events) transports.
  - Deployed as a separate service on Railway.
- **@raktamarga/embeddings**:
  - Scans the codebase for files (respecting .gitignore).
  - Chunks content based on file type (AST-based for code, semantic for Markdown).
  - Uses Gemini `text-embedding-004` model.
  - Indexes vectors into Pinecone for semantic retrieval.
  - Supports incremental updates via Git diff to keep the index fresh.
