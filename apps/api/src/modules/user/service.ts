import { db } from '@raktamarga/db'
import { users } from '@raktamarga/db/schema'
import { eq } from 'drizzle-orm'

export class UserService {
  async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return user || null
  }

  async updateSettings(id: string, settings: any) {
    const [user] = await db
      .update(users)
      .set({
        settings,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning()
    return user
  }

  async updateProfile(id: string, data: { name?: string; image?: string }) {
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning()
    return user
  }
}
