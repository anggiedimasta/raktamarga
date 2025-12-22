import { db } from '@raktamarga/db'
import type { NewFamily } from '@raktamarga/db/schema'
import { families, members } from '@raktamarga/db/schema'
import { generateFamilyCode } from '@raktamarga/shared'
import { and, eq, ilike, sql, or } from 'drizzle-orm'

export class FamilyService {
  async create(data: Omit<NewFamily, 'id' | 'createdAt' | 'updatedAt'>) {
    // Normalize family code to uppercase for case-insensitive storage
    const familyCode = (data.familyCode || generateFamilyCode()).toUpperCase()

    const [family] = await db
      .insert(families)
      .values({
        ...data,
        familyCode,
      })
      .returning()

    return family
  }

  async findByCode(code: string) {
    // Use ilike for case-insensitive exact match (no wildcards)
    // This will match regardless of case: "BHAMID", "bhamid", "Bhamid" all work
    const normalizedCode = code.trim()
    const [family] = await db
      .select()
      .from(families)
      .where(ilike(families.familyCode, normalizedCode))
      .limit(1)

    return family || null
  }

  async findById(id: string) {
    const [family] = await db.select().from(families).where(eq(families.id, id)).limit(1)

    return family || null
  }

  async listByUserId(userId: string) {
    // Get families where user is admin or member
    const adminFamilies = await db
      .select({ family: families })
      .from(families)
      .where(eq(families.adminId, userId))

    const memberFamilies = await db
      .select({ family: families })
      .from(members)
      .innerJoin(families, eq(members.familyId, families.id))
      .where(eq(members.userId, userId))

    const allFamilies = [
      ...adminFamilies.map((f) => f.family),
      ...memberFamilies.map((m) => m.family),
    ]

    // Remove duplicates
    const uniqueFamilies = Array.from(
      new Map(allFamilies.map((f) => [f.id, f])).values(),
    )

    // Parallel fetch member counts for each family
    const familiesWithCounts = await Promise.all(
      uniqueFamilies.map(async (family) => {
        const [result] = await db
          .select({ count: sql<number>`count(*)` })
          .from(members)
          .where(eq(members.familyId, family.id))

        return {
          ...family,
          memberCount: result?.count || 0
        }
      })
    )

    return familiesWithCounts
  }

  async update(id: string, data: { name?: string; description?: string | null }) {
    const [family] = await db
      .update(families)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(families.id, id))
      .returning()

    if (!family) {
      throw new Error('Family not found')
    }

    return family
  }

  async delete(id: string) {
    await db.delete(families).where(eq(families.id, id))
    return { success: true }
  }

  async transferAdmin(familyId: string, newAdminId: string) {
    // Verify the new admin is a member of the family
    const [member] = await db
      .select()
      .from(members)
      .where(and(eq(members.familyId, familyId), eq(members.userId, newAdminId)))
      .limit(1)

    if (!member) {
      throw new Error('New admin must be a member of the family')
    }

    const [family] = await db
      .update(families)
      .set({
        adminId: newAdminId,
        updatedAt: new Date(),
      })
      .where(eq(families.id, familyId))
      .returning()

    if (!family) {
      throw new Error('Family not found')
    }

    return family
  }

  async getMembers(familyId: string, includeConnected = false) {
    const familyMembers = await db
      .select()
      .from(members)
      .where(eq(members.familyId, familyId))

    if (!includeConnected) {
      return familyMembers
    }

    // Get verified connections
    const { connections } = await import('@raktamarga/db/schema')
    const verifiedConnections = await db
      .select()
      .from(connections)
      .where(
        and(
          or(eq(connections.family1Id, familyId), eq(connections.family2Id, familyId)),
          eq(connections.status, 'verified')
        )
      )

    const connectedFamilyIds = verifiedConnections.map(c =>
      c.family1Id === familyId ? c.family2Id : c.family1Id
    )

    if (connectedFamilyIds.length === 0) {
      return familyMembers
    }

    const connectedMembers = await db
      .select()
      .from(members)
      .where(sql`${members.familyId} IN ${connectedFamilyIds}`)

    return [...familyMembers, ...connectedMembers]
  }

  async isAdmin(familyId: string, userId: string): Promise<boolean> {
    const [family] = await db
      .select()
      .from(families)
      .where(and(eq(families.id, familyId), eq(families.adminId, userId)))
      .limit(1)

    return !!family
  }

  async isMember(familyId: string, userId: string): Promise<boolean> {
    const [member] = await db
      .select()
      .from(members)
      .where(and(eq(members.familyId, familyId), eq(members.userId, userId)))
      .limit(1)

    return !!member
  }
}
