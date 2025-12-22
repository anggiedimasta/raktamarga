import { initTRPC } from '@trpc/server'
import { auth } from '@raktamarga/auth'

// Context type for tRPC (will be provided by Elysia via derive)
export interface Context {
  headers: Headers
}

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({ headers: ctx.headers })

  if (!session) {
    throw new Error('UNAUTHORIZED')
  }

  return next({
    ctx: {
      ...ctx,
      session,
      user: session.user,
    },
  })
})
