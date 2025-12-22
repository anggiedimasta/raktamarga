# Development Setup Guide

## Prerequisites

- Bun >= 1.0.0
- Node.js >= 18 (for some tools)
- PostgreSQL database (Neon recommended for free tier)

## Initial Setup

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Set up environment variables:**

   Copy `.env.example` files and fill in the values:
   - `apps/api/.env` - Database URL, Google OAuth credentials
   - `apps/web/.env` - API URL

   **Getting Google OAuth credentials:**
   - See `docs/GOOGLE_OAUTH_SETUP.md` for detailed instructions
   - Quick steps:
     1. Go to [Google Cloud Console](https://console.cloud.google.com/)
     2. Create a new project
     3. Enable Google+ API or Google Identity Services API
     4. Create OAuth 2.0 credentials (Web application)
     5. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
     6. Copy Client ID and Client Secret to `.env` file

3. **Set up database:**

   Create a Neon PostgreSQL database and get the connection string.

   **Important:** Make sure `DATABASE_URL` is set in `apps/api/.env` before running migrations.

   Then generate migrations:
   ```bash
   cd packages/db
   bun run db:generate
   bun run db:migrate
   ```

   The migration scripts automatically load environment variables from `apps/api/.env` using Bun's `--env-file` flag.

4. **Run development servers:**

   ```bash
   # Run both frontend and backend
   bun run dev

   # Or run individually
   bun --filter=@raktamarga/web dev
   bun --filter=@raktamarga/api dev
   ```

## Testing

```bash
# Run all tests
bun run test

# Run frontend tests
bun --filter=@raktamarga/web test

# Run backend tests
bun --filter=@raktamarga/api test

# Run E2E tests
bun --filter=@raktamarga/web test:e2e
```

## Linting & Formatting

```bash
# Check code
bun run lint

# Format code
bun run format
```

## Database Migrations

```bash
cd packages/db

# Generate migration from schema changes
bun run db:generate

# Run migrations
bun run db:migrate

# Open Drizzle Studio (database GUI)
bun run db:studio
```

## Project Structure

- `apps/web` - TanStack Start frontend (React + Vite)
- `apps/api` - Elysia backend (feature-based modules)
- `packages/db` - Database schema and migrations
- `packages/auth` - BetterAuth configuration
- `packages/shared` - Shared types and utilities
- `packages/ui` - Shared UI components (shadcn/ui)

## Tech Stack

- **Runtime:** Bun
- **Frontend:** TanStack Start (React 19) + TanStack Router + shadcn/ui
- **Backend:** Elysia + tRPC + Effect (error handling & services)
- **Database:** PostgreSQL (Neon) + Drizzle ORM + LTree extension
- **Auth:** BetterAuth
- **Testing:** Vitest + React Testing Library + Playwright
- **Linting:** Biome

**Effect (Backend):**
- Type-safe error handling in service layer
- Dependency injection and resource management
- Built-in observability (logging, metrics, tracing)
- Install: `bun add effect` in `apps/api`

## Next Steps

After completing the setup above, see `docs/NEXT_STEPS.md` for:
- Database setup (Neon)
- Running migrations
- Starting development servers
- Testing the application
