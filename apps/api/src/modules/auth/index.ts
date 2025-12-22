import { auth } from '@raktamarga/auth'
import { publicProcedure, protectedProcedure, router } from '../../trpc'

export const authRouter = router({
  // Get current user session
  me: publicProcedure.query(async ({ ctx }) => {
    const session = await auth.api.getSession({ headers: ctx.headers })
    return {
      user: session?.user ?? null,
      session: session?.session ?? null,
    }
  }),

  // Get session (protected - ensures user is authenticated)
  session: protectedProcedure.query(({ ctx }) => {
    return {
      user: ctx.user,
      session: ctx.session,
    }
  }),

  // Sign out
  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    await auth.api.signOut({ headers: ctx.headers })
    return { success: true }
  }),
})
