import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import type { Config } from 'drizzle-kit'

const require = createRequire(import.meta.url)

// Load environment variables using dotenv (for when drizzle-kit runs in Node.js context)
// Bun's --env-file flag in scripts will also set these, but dotenv ensures compatibility
try {
  const { config } = require('dotenv')
  // Load .env from apps/api directory (where DATABASE_URL is stored)
  config({ path: resolve(__dirname, '../../apps/api/.env') })
  // Also try root .env if it exists
  config({ path: resolve(__dirname, '../../.env') })
} catch {
  // dotenv not available, assume env vars are set via Bun's --env-file
}

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL environment variable is required. Make sure to run migrations with: bun --env-file=../../apps/api/.env run db:migrate'
  )
}

export default {
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config
