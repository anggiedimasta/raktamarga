import { createAuthClient } from 'better-auth/react'
import { config } from '../config'

// Only create client in browser environment
export const authClient =
  typeof window !== 'undefined'
    ? createAuthClient({
        baseURL: config.apiUrl,
      })
    : (null as unknown as ReturnType<typeof createAuthClient>)

export type Session = typeof authClient.$Infer.Session

// Hook to get session with React Query (handles caching and deduplication)
export function useSession() {
  return authClient?.useSession() ?? { data: null, isPending: true, error: null }
}
