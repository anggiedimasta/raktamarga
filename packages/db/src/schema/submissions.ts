import { createId } from '@paralleldrive/cuid2'
import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { families } from './families'
import { users } from './users'

export const submissions = pgTable('member_submissions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  familyId: text('family_id')
    .notNull()
    .references(() => families.id, { onDelete: 'cascade' }),
  memberData: jsonb('member_data').notNull().$type<Record<string, unknown>>(),
  submissionType: text('submission_type').notNull().$type<'create' | 'update'>(),
  status: text('status').notNull().default('pending').$type<'pending' | 'approved' | 'rejected'>(),
  submittedBy: text('submitted_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  reviewedBy: text('reviewed_by').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Submission = typeof submissions.$inferSelect
export type NewSubmission = typeof submissions.$inferInsert
