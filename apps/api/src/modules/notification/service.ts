import { db } from '@raktamarga/db'
import type { NewNotification } from '@raktamarga/db/schema'
import { notifications } from '@raktamarga/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { notificationManager } from '../../shared/lib/notification-manager'

export class NotificationService {
  async create(data: Omit<NewNotification, 'id' | 'createdAt'>) {
    const [notification] = await db.insert(notifications).values(data).returning()

    // Notify user via WebSocket
    if (notification) {
      notificationManager.notify(notification.userId, notification)
    }

    return notification
  }

  async listByUser(
    userId: string,
    options: { limit?: number; offset?: number; unreadOnly?: boolean } = {},
  ) {
    const { limit = 20, offset = 0, unreadOnly = false } = options

    const conditions = [eq(notifications.userId, userId)]
    if (unreadOnly) {
      conditions.push(eq(notifications.read, false))
    }

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(notifications.createdAt)
      .limit(limit)
      .offset(offset)

    return userNotifications
  }

  async getUnreadCount(userId: string) {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))

    return result?.count || 0
  }

  async markAsRead(id: string, userId: string) {
    const [notification] = await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning()

    if (!notification) {
      throw new Error('Notification not found or unauthorized')
    }

    return notification
  }

  async markAllAsRead(userId: string) {
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))

    return { success: true }
  }
}
