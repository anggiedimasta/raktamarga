import { db } from '@raktamarga/db'
import type { NewEvent } from '@raktamarga/db/schema'
import { events, members } from '@raktamarga/db/schema'
import { and, eq, gte, lte, or, sql } from 'drizzle-orm'
import { FamilyService } from '../family/service'
import { MemberService } from '../member/service'

const familyService = new FamilyService()
const memberService = new MemberService()

export class EventService {
  async create(data: Omit<NewEvent, 'id' | 'createdAt' | 'updatedAt'>) {
    const [event] = await db.insert(events).values(data).returning()
    return event
  }

  async findById(id: string) {
    const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1)
    return event || null
  }

  async listByMember(memberId: string, filters?: { eventType?: string; location?: string }) {
    const conditions = [eq(events.memberId, memberId)]
    if (filters?.eventType) conditions.push(eq(events.eventType, filters.eventType as any))
    if (filters?.location) conditions.push(sql`${events.location} ILIKE ${`%${filters.location}%`}`)

    const memberEvents = await db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(events.eventDate)

    return memberEvents
  }

  async listByFamily(familyId: string, filters?: { eventType?: string; location?: string }) {
    // Get all members of the family first
    const familyMembers = await db
      .select({ id: members.id })
      .from(members)
      .where(eq(members.familyId, familyId))

    const memberIds = familyMembers.map((m) => m.id)

    if (memberIds.length === 0) {
      return []
    }

    const conditions = [or(...memberIds.map((id) => eq(events.memberId, id)))]
    if (filters?.eventType) conditions.push(eq(events.eventType, filters.eventType as any))
    if (filters?.location) conditions.push(sql`${events.location} ILIKE ${`%${filters.location}%`}`)

    // Get all events for members in the family
    const familyEvents = await db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(events.eventDate)

    return familyEvents
  }

  async update(id: string, data: Partial<Omit<NewEvent, 'id' | 'createdAt' | 'updatedAt'>>) {
    const [event] = await db
      .update(events)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning()

    if (!event) {
      throw new Error('Event not found')
    }

    return event
  }

  async delete(id: string) {
    await db.delete(events).where(eq(events.id, id))
    return { success: true }
  }

  async search(criteria: {
    familyId?: string
    eventType?: NewEvent['eventType']
    startDate?: string
    endDate?: string
    location?: string
  }) {
    // If familyId is provided, filter by family members
    let memberIds: string[] = []
    if (criteria.familyId) {
      const familyMembers = await db
        .select({ id: members.id })
        .from(members)
        .where(eq(members.familyId, criteria.familyId))

      memberIds = familyMembers.map((m) => m.id)

      if (memberIds.length === 0) {
        return []
      }
    }

    // Build conditions
    const conditions = []

    // Member filter (if familyId provided)
    if (memberIds.length > 0) {
      conditions.push(or(...memberIds.map((id) => eq(events.memberId, id))))
    }

    // Event type filter
    if (criteria.eventType) {
      conditions.push(eq(events.eventType, criteria.eventType))
    }

    // Date range filters
    if (criteria.startDate) {
      conditions.push(gte(events.eventDate, criteria.startDate))
    }

    if (criteria.endDate) {
      conditions.push(lte(events.eventDate, criteria.endDate))
    }

    // Location filter
    if (criteria.location) {
      conditions.push(sql`${events.location} ILIKE ${`%${criteria.location}%`}`)
    }

    // Build and execute query
    if (conditions.length === 0) {
      const results = await db
        .select()
        .from(events)
        .orderBy(events.eventDate)
      return results
    }

    const results = await db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(events.eventDate)

    return results
  }

  async canAccessEvent(eventId: string, userId: string): Promise<boolean> {
    const event = await this.findById(eventId)
    if (!event) {
      return false
    }

    // Get the member
    const member = await memberService.findById(event.memberId)
    if (!member) {
      return false
    }

    // Check if user is admin of the family
    const isAdmin = await familyService.isAdmin(member.familyId, userId)
    if (isAdmin) {
      return true
    }

    // Check if user is the creator
    if (event.createdBy === userId) {
      return true
    }

    // Check if user is a member of the family
    const isMember = await familyService.isMember(member.familyId, userId)
    if (!isMember) {
      return false
    }

    // Check privacy level (simplified for now)
    // More complex privacy logic can be added later
    return true
  }
}
