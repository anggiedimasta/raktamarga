import { protectedProcedure, router } from '../../trpc'
import { updateProfileSchema, updateSettingsSchema } from './model'
import { UserService } from './service'

const userService = new UserService()

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await userService.findById(ctx.user.id)
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }),

  updateSettings: protectedProcedure
    .input(updateSettingsSchema)
    .mutation(async ({ input, ctx }) => {
      return await userService.updateSettings(ctx.user.id, input)
    }),

  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ input, ctx }) => {
      return await userService.updateProfile(ctx.user.id, input)
    }),
})
