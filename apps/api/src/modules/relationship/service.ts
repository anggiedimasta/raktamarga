import { db } from '@raktamarga/db'
import type { NewRelationship } from '@raktamarga/db/schema'
import { members, relationships } from '@raktamarga/db/schema'
import { and, eq, or, sql } from 'drizzle-orm'
import { FamilyService } from '../family/service'
import { MemberService } from '../member/service'

const familyService = new FamilyService()
const memberService = new MemberService()

export class RelationshipService {
  async create(data: Omit<NewRelationship, 'id' | 'createdAt'>) {
    // Prevent duplicate relationships
    const existing = await db
      .select()
      .from(relationships)
      .where(
        and(
          or(
            and(eq(relationships.member1Id, data.member1Id), eq(relationships.member2Id, data.member2Id)),
            and(eq(relationships.member1Id, data.member2Id), eq(relationships.member2Id, data.member1Id)),
          ),
          eq(relationships.relationshipType, data.relationshipType),
        ),
      )
      .limit(1)

    if (existing.length > 0) {
      throw new Error('Relationship already exists')
    }

    const [relationship] = await db.insert(relationships).values(data).returning()
    return relationship
  }

  async findById(id: string) {
    const [relationship] = await db
      .select()
      .from(relationships)
      .where(eq(relationships.id, id))
      .limit(1)

    return relationship || null
  }

  async listByMember(memberId: string) {
    const memberRelationships = await db
      .select()
      .from(relationships)
      .where(or(eq(relationships.member1Id, memberId), eq(relationships.member2Id, memberId)))

    return memberRelationships
  }

  async listByFamily(familyId: string | string[]) {
    const familyIds = Array.isArray(familyId) ? familyId : [familyId]

    // Get all members of the families
    const familyMembers = await db
      .select({ id: members.id })
      .from(members)
      .where(sql`${members.familyId} IN ${familyIds}`)

    const memberIds = familyMembers.map((m) => m.id)

    if (memberIds.length === 0) {
      return []
    }

    // Get all relationships where at least one member is in the families
    const familyRelationships = await db
      .select()
      .from(relationships)
      .where(
        or(
          sql`${relationships.member1Id} IN ${memberIds}`,
          sql`${relationships.member2Id} IN ${memberIds}`
        )
      )

    return familyRelationships
  }

  async update(id: string, relationshipType: NewRelationship['relationshipType']) {
    const [relationship] = await db
      .update(relationships)
      .set({ relationshipType })
      .where(eq(relationships.id, id))
      .returning()

    if (!relationship) {
      throw new Error('Relationship not found')
    }

    return relationship
  }

  async delete(id: string) {
    await db.delete(relationships).where(eq(relationships.id, id))
    return { success: true }
  }

  async verify(id: string) {
    const [relationship] = await db
      .update(relationships)
      .set({ verified: true })
      .where(eq(relationships.id, id))
      .returning()

    if (!relationship) {
      throw new Error('Relationship not found')
    }

    return relationship
  }

  async canModifyRelationship(relationshipId: string, userId: string): Promise<boolean> {
    const relationship = await this.findById(relationshipId)
    if (!relationship) {
      return false
    }

    // Get both members
    const member1 = await memberService.findById(relationship.member1Id)
    const member2 = await memberService.findById(relationship.member2Id)

    if (!member1 || !member2) {
      return false
    }

    // Check if user is admin of either family
    const isAdmin1 = await familyService.isAdmin(member1.familyId, userId)
    const isAdmin2 = await familyService.isAdmin(member2.familyId, userId)

    if (isAdmin1 || isAdmin2) {
      return true
    }

    // Check if user created either member
    if (member1.createdBy === userId || member2.createdBy === userId) {
      return true
    }

    return false
  }
}
