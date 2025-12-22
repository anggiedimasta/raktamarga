import { protectedProcedure, router } from '../../trpc'
import {
  createNotificationSchema,
  listNotificationsSchema,
  markAsReadSchema,
} from './model'
import { NotificationService } from './service'

const notificationService = new NotificationService()

export const notificationRouter = router({
  list: protectedProcedure
    .input(listNotificationsSchema)
    .query(async ({ input, ctx }) => {
      const notifications = await notificationService.listByUser(ctx.user.id, {
        limit: input.limit,
        offset: input.offset,
        unreadOnly: input.unreadOnly,
      })

      return notifications
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await notificationService.getUnreadCount(ctx.user.id)
    return { count }
  }),

  markAsRead: protectedProcedure
    .input(markAsReadSchema)
    .mutation(async ({ input, ctx }) => {
      const notification = await notificationService.markAsRead(input.id, ctx.user.id)
      return notification
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await notificationService.markAllAsRead(ctx.user.id)
    return { success: true }
  }),

  create: protectedProcedure
    .input(createNotificationSchema)
    .mutation(async ({ input }) => {
      // System/internal use - can be called by other services
      const notification = await notificationService.create({
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        relatedEntityType: input.relatedEntityType || null,
        relatedEntityId: input.relatedEntityId || null,
        read: false,
      })

      return notification
    }),
})
