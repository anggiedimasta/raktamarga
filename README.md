# Raktamarga - Bloodline App

A modern genealogy and family tree application built with a monorepo architecture.

## Tech Stack

- **Runtime:** Bun
- **Frontend:** SvelteKit 2.x + shadcn-svelte + Feature-Sliced Design
- **Backend:** Elysia + tRPC
- **Database:** PostgreSQL (Neon)
- **Auth:** BetterAuth
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
│   ├── web/          # SvelteKit frontend (FSD architecture)
│   └── api/          # Elysia backend (feature-based)
├── packages/
│   ├── ui/           # Shared shadcn-svelte components
│   ├── db/           # Database schema & migrations
│   ├── auth/         # BetterAuth configuration
│   └── shared/       # Shared utilities & types
└── docs/             # Documentation
```

## License

MIT
