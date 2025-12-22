import { createId } from '@paralleldrive/cuid2'
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const notifications = pgTable('notifications', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type')
    .notNull()
    .$type<
      | 'member_submission_pending'
      | 'member_edit_pending'
      | 'connection_request'
      | 'join_request'
      | 'submission_approved'
      | 'submission_rejected'
      | 'edit_approved'
      | 'edit_rejected'
      | 'member_added'
      | 'connection_established'
      | 'event_added'
      | 'privacy_changed'
    >(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  relatedEntityType: text('related_entity_type'),
  relatedEntityId: text('related_entity_id'),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
