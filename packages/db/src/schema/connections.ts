import { createId } from '@paralleldrive/cuid2'
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { families } from './families'
import { members } from './members'

export const connections = pgTable('family_connections', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  family1Id: text('family1_id')
    .notNull()
    .references(() => families.id, { onDelete: 'cascade' }),
  family2Id: text('family2_id')
    .notNull()
    .references(() => families.id, { onDelete: 'cascade' }),
  connectingMemberId: text('connecting_member_id')
    .notNull()
    .references(() => members.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending').$type<'pending' | 'verified' | 'rejected'>(),
  verified: boolean('verified').notNull().default(false),
  approvedByFamily1Admin: boolean('approved_by_family1_admin').notNull().default(false),
  approvedByFamily2Admin: boolean('approved_by_family2_admin').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  verifiedAt: timestamp('verified_at'),
})

export type Connection = typeof connections.$inferSelect
export type NewConnection = typeof connections.$inferInsert
