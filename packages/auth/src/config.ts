import { db } from '@raktamarga/db'
import { users, sessions, accounts, verifications } from '@raktamarga/db/schema'
import { eq } from 'drizzle-orm'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const betterAuthSecret = process.env.BETTER_AUTH_SECRET
const betterAuthUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000'

if (!googleClientId || !googleClientSecret) {
  throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required')
}

if (!betterAuthSecret) {
  throw new Error('BETTER_AUTH_SECRET environment variable is required')
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  secret: betterAuthSecret,
  baseURL: betterAuthUrl,
  basePath: '/api/auth',
  trustedOrigins: ['http://localhost:8080'],
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      redirectURI: `${betterAuthUrl}/api/auth/callback/google`,
    },
  },
  phone: {
    enabled: false, // Will enable in Phase 2
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Set authProvider to 'google' when user is created via Google OAuth
          if (user.email && !user.authProvider) {
            await db
              .update(users)
              .set({ authProvider: 'google' })
              .where(eq(users.id, user.id))
          }
        },
      },
    },
  },
})

export type Session = typeof auth.$Infer.Session
