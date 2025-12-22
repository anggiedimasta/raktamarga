import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@raktamarga/api/router'

export const trpc = createTRPCReact<AppRouter>()
