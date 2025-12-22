import { createId } from '@paralleldrive/cuid2'
import { date, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { families } from './families'
import { users } from './users'

export const members = pgTable('family_members', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  familyId: text('family_id')
    .notNull()
    .references(() => families.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  dob: date('dob'),
  dod: date('dod'),
  gender: text('gender').$type<'male' | 'female' | 'other'>(),
  profilePhoto: text('profile_photo'),
  privacySettings: jsonb('privacy_settings').notNull().$type<{
    visibilityLevel: string
    customRules?: Record<string, unknown>
  }>(),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert
