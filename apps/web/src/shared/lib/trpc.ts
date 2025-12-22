import type { AppRouter } from '@raktamarga/api/router'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { config } from '../config'

// Ensure fetch is available for browser environment
const getFetch = () => {
  if (typeof window !== 'undefined' && window.fetch) {
    return window.fetch.bind(window)
  }
  if (typeof globalThis !== 'undefined' && globalThis.fetch) {
    return globalThis.fetch.bind(globalThis)
  }
  return fetch
}

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${config.apiUrl}/trpc`,
      fetch: getFetch(),
      maxURLLength: 2083, // Prevent URL length issues
    }),
  ],
})
