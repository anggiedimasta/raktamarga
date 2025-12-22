import { createId } from '@paralleldrive/cuid2'
import { date, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { members } from './members'

export const events = pgTable('events', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  memberId: text('member_id')
    .notNull()
    .references(() => members.id, { onDelete: 'cascade' }),
  eventType: text('event_type')
    .notNull()
    .$type<
      | 'birth'
      | 'death'
      | 'marriage'
      | 'divorce'
      | 'partnership'
      | 'adoption'
      | 'graduation'
      | 'migration'
      | 'custom'
    >(),
  eventDate: date('event_date').notNull(),
  location: text('location'),
  description: text('description'),
  relatedMemberId: text('related_member_id').references(() => members.id, {
    onDelete: 'set null',
  }),
  photos: jsonb('photos').notNull().$type<string[]>().default([]),
  privacyLevel: text('privacy_level')
    .notNull()
    .$type<
      | 'private'
      | 'family_only'
      | 'immediate_family'
      | 'extended_family'
      | 'connected_families'
      | 'extended_connections'
      | 'public'
    >(),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
