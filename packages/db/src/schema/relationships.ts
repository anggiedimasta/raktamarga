import { createId } from '@paralleldrive/cuid2'
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { members } from './members'

export const relationships = pgTable('relationships', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  member1Id: text('member1_id')
    .notNull()
    .references(() => members.id, { onDelete: 'cascade' }),
  member2Id: text('member2_id')
    .notNull()
    .references(() => members.id, { onDelete: 'cascade' }),
  relationshipType: text('relationship_type')
    .notNull()
    .$type<'parent' | 'child' | 'sibling' | 'spouse' | 'partner' | 'adoption' | 'step_sibling'>(),
  verified: boolean('verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Relationship = typeof relationships.$inferSelect
export type NewRelationship = typeof relationships.$inferInsert
