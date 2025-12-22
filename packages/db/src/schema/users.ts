import { createId } from '@paralleldrive/cuid2'
import { boolean, pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  // Custom fields for our app (all optional to allow BetterAuth to create users)
  phone: text('phone'),
  authProvider: text('auth_provider').$type<'google' | 'phone' | 'whatsapp'>(),
  settings: jsonb('settings').$type<{
    notifications: {
      emailDigest: boolean
      pushEnabled: boolean
      mentionOnly: boolean
    }
    language: 'id' | 'en'
  }>().default({
    notifications: {
      emailDigest: true,
      pushEnabled: true,
      mentionOnly: false,
    },
    language: 'id',
  }),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
