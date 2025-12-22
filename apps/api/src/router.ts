import { authRouter } from './modules/auth'
import { connectionRouter } from './modules/connection'
import { eventRouter } from './modules/event'
import { familyRouter } from './modules/family'
import { memberRouter } from './modules/member'
import { notificationRouter } from './modules/notification'
import { relationshipRouter } from './modules/relationship'
import { userRouter } from './modules/user'
import { router } from './trpc'

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  family: familyRouter,
  member: memberRouter,
  relationship: relationshipRouter,
  connection: connectionRouter,
  event: eventRouter,
  notification: notificationRouter,
})

export type AppRouter = typeof appRouter
