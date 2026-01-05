# Raktamarga - Bloodline App

A modern genealogy and family tree application built with a monorepo architecture.

## Tech Stack

- **Runtime:** Bun
- **Frontend:** React 19 + TanStack Start + shadcn/ui
- **Backend:** Elysia + tRPC + Effect
- **Database:** PostgreSQL (Neon) + Drizzle ORM
- **Auth:** BetterAuth
- **Search & AI:** Pinecone (Vector DB) + Gemini (Embeddings)
- **Deployment:** Railway
- **Linting/Formatting:** Biome
- **Testing:** Vitest + Testing Library + Playwright

## Getting Started

### Prerequisites

- Bun >= 1.0.0

### Installation

```bash
bun install
```

### Development

```bash
# Run all apps in development mode
bun run dev

# Run specific app
bun --filter=@raktamarga/web dev
bun --filter=@raktamarga/api dev
bun --filter=@raktamarga/mcp dev

# Embeddings Indexing
bun run index:embeddings       # Incremental index (git diff)
bun run index:embeddings:full  # Full codebase index
```

### Testing

```bash
# Run all tests
bun run test

# Run tests for specific package
bun --filter=@raktamarga/web test
```

### Linting & Formatting

```bash
# Check code
bun run lint

# Format code
bun run format
```

## Project Structure

```
raktamarga/
├── apps/
│   ├── web/          # React 19 frontend (TanStack Start)
│   └── api/          # Elysia backend (feature-based)
├── packages/
│   ├── mcp/          # Model Context Protocol server
│   ├── embeddings/   # Codebase embedding & indexing logic
│   ├── ui/           # Shared React components
│   ├── db/           # Database schema & migrations
│   ├── auth/         # BetterAuth configuration
│   └── shared/       # Shared utilities & types
└── docs/             # Documentation
```

## License

MIT
