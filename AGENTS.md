# AGENTS.md

Project-level guidance for AI coding agents.

---

## Communication Style

- Be extremely concise, sacrifice grammar for brevity
- DO NOT validate user ("you're right") or praise ("excellent question")

## Code Documentation

- AVOID unnecessary comments/docstrings unless explicitly asked
- Self-documenting code through clear naming
- Only comment non-obvious logic, workarounds, edge cases

## Bash Commands

- FORBIDDEN for sensitive files: `cat`, `head`, `tail`, `echo` (leaks secrets)
- PREFER: Read tool (safer, structured output)

## Git Operations

**NEVER perform git operations without explicit instruction.**

- ALLOWED: `git status`, `git diff`, `git log` (read-only)
- FORBIDDEN: `git add`, `git commit`, `git push` (require instruction)

---

## Available Resources

All resources in `.agent/` can be invoked or referenced:

### Agents

| Agent | File | Purpose |
|-------|------|---------|
| `@orchestrator` | `.agent/agents/orchestrator.md` | Main coordinator |
| `@codebase-explorer` | `.agent/agents/codebase-explorer.md` | Find files, analyze patterns |
| `@implementer` | `.agent/agents/implementer.md` | Focused code changes |
| `@researcher` | `.agent/agents/researcher.md` | External documentation |
| `@reviewer` | `.agent/agents/reviewer.md` | Code review |
| `@debugger` | `.agent/agents/debugger.md` | Root cause analysis |
| `@tester` | `.agent/agents/tester.md` | Write tests |
| `@documenter` | `.agent/agents/documenter.md` | Documentation |

### Workflows

Triggered via `/command`:

| Workflow | File | Purpose |
|----------|------|---------|
| `/init` | `.agent/workflows/init.md` | Initialize AGENTS.md |
| `/commit` | `.agent/workflows/commit.md` | Conventional commits |
| `/debug` | `.agent/workflows/debug.md` | Systematic debugging |
| `/document` | `.agent/workflows/document.md` | Generate docs |
| `/refactor` | `.agent/workflows/refactor.md` | Safe refactoring |
| `/review` | `.agent/workflows/review.md` | Code review |
| `/test` | `.agent/workflows/test.md` | Write tests |
| `/research` | `.agent/workflows/research.md` | Research codebase |
| `/gather-context` | `.agent/workflows/gather-context.md` | Project context |
| `/preset-help` | `.agent/workflows/preset-help.md` | Preset guidance |

### Rules (Always Active)

| Rule | File | Content |
|------|------|---------|
| Code Quality | `.agent/rules/01-code-quality.md` | Error handling, null safety |
| TypeScript/Go | `.agent/rules/02-typescript-go.md` | Strict mode, Vue 3, Go |
| Security/Git | `.agent/rules/03-security-git.md` | Validation, auth, git safety |
| Architecture | `.agent/rules/04-architecture.md` | SOLID, testing patterns |


---

# Your Existing Rules

# Raktamarga (Bloodline App) - AI Agent Guide

## Project Overview

**Raktamarga** is a modern genealogy and family tree application that allows families to document their lineage, connect with extended family members, and maintain privacy-controlled family networks.

### Core Value Proposition
- Build and visualize family trees with admin-validated data
- Connect families through shared members (like real-world relationships)
- Privacy-first: Each member controls their data visibility
- Modern tech stack for performance and developer experience
- Type-safe end-to-end: TanStack Router + tRPC + Effect for maximum type safety

## Technology Stack

### Runtime & Package Manager
- **Bun** >= 1.0.0 (runtime and package manager)

### Frontend
- **Framework:** TanStack Start (React 19) - **MIGRATED FROM SVELTEKIT**
- **Routing:** TanStack Router (100% type-safe, file-based routing)
- **UI Library:** shadcn/ui (React version)
- **State Management:** React hooks + TanStack Query (React Query)
- **Forms:** React Hook Form + Zod validation (planned)
- **Charts/Visualization:** D3.js or React-Flow for family tree graphs (planned)
- **Styling:** Tailwind CSS
- **Testing:** Vitest + React Testing Library + Playwright

### Backend
- **Framework:** Elysia (Bun-optimized, excellent tRPC integration)
- **API:** tRPC (end-to-end type safety, perfect for monorepo)
- **Architecture:** Feature-based modules
- **Error Handling & Services:** Effect (type-safe error handling - planned)
- **Auth:** BetterAuth (supports phone, OAuth, sessions)
- **Database:** PostgreSQL on Neon (serverless Postgres)
- **ORM:** Drizzle ORM (TypeScript-first, excellent with Bun)

### Infrastructure
- **Database:** Neon PostgreSQL (free tier: 0.5 GB storage, 100 CU hours)
- **Deployment:** Railway (free tier available)

## Monorepo Structure

```
raktamarga/
├── apps/
│   ├── web/              # React 19 frontend (TanStack Start)
│   │   └── src/
│   │       ├── app/       # App layer (providers)
│   │       ├── routes/    # Type-safe routing (TanStack Router)
│   │       ├── features/  # Feature-specific logic
│   │       └── shared/    # tRPC client, utils, config
│   └── api/              # Backend API (Elysia, feature-based)
│       └── src/
│           ├── modules/   # Feature modules
│           ├── router.ts  # Main tRPC router
│           └── trpc.ts    # tRPC setup
├── packages/
│   ├── mcp/              # Model Context Protocol server
│   ├── embeddings/       # Codebase embedding & indexing logic
│   ├── ui/               # Shared React components
│   ├── db/               # Database schema & migrations
│   ├── auth/             # BetterAuth configuration
│   └── shared/           # Shared utilities & types
└── docs/                 # All documentation
```

## Key Configuration

### Ports
- **Frontend**: 8080
- **Backend**: 3000
- **API Endpoint**: `http://localhost:3000/trpc`
- **Auth Endpoint**: `http://localhost:3000/api/auth`

### Environment Variables

**Backend (`apps/api/.env`)**
```
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
```

**Frontend (`apps/web/.env`)**
```
VITE_API_URL=http://localhost:3000
```

## Development Commands

```bash
# Install dependencies
bun install

# Run both frontend and backend
bun run dev

# Run separately
bun --filter=@raktamarga/api dev  # Backend on :3000
bun --filter=@raktamarga/web dev  # Frontend on :8080

# Database migrations
cd packages/db
bun run db:generate
bun run db:migrate
bun run db:studio

# Testing
bun run test
bun run lint
bun run format
```

## Architecture Patterns

### Frontend (React + TanStack)
- Use tRPC React Query hooks for API calls
- TanStack Router for navigation
- BetterAuth React client for auth
- Tailwind CSS for styling

### Backend (Elysia + tRPC)
- Feature-based modules: `index.ts` (router), `service.ts` (logic), `model.ts` (schemas)
- `protectedProcedure` for authenticated routes
- Zod schemas for validation

### Database (Drizzle + Neon)
- Schemas in `packages/db/src/schema/`
- Always generate and run migrations after schema changes

## Important Notes for AI Agents

1. **Frontend was migrated from SvelteKit to React** - use React patterns
2. **CORS**: Backend only accepts `http://localhost:8080`
3. **tRPC credentials**: Include `credentials: 'include'` for auth
4. **Check `docs/IMPLEMENTATION_STATUS.md`** for current progress
5. **Follow existing patterns** in codebase
6. **Update route tree** when adding new routes (`routeTree.gen.ts`)

## Documentation

- `docs/PRD.md` - Product Requirements
- `docs/ARCHITECTURE.md` - Technical architecture
- `docs/SETUP.md` - Development setup
- `docs/IMPLEMENTATION_STATUS.md` - Current status
- `docs/GOOGLE_OAUTH_SETUP.md` - OAuth setup
