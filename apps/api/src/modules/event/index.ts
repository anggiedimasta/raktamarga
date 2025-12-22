import { protectedProcedure, router } from '../../trpc'
import {
  createEventSchema,
  deleteEventSchema,
  getEventByIdSchema,
  listEventsSchema,
  searchEventsSchema,
  updateEventSchema,
} from './model'
import { EventService } from './service'
import { FamilyService } from '../family/service'
import { MemberService } from '../member/service'

const eventService = new EventService()
const familyService = new FamilyService()
const memberService = new MemberService()

export const eventRouter = router({
  create: protectedProcedure.input(createEventSchema).mutation(async ({ input, ctx }) => {
    // Check if user can access the member
    const canAccess = await memberService.canAccessMember(input.memberId, ctx.user.id)
    if (!canAccess) {
      throw new Error('Unauthorized: You do not have access to this member')
    }

    const event = await eventService.create({
      memberId: input.memberId,
      eventType: input.eventType,
      eventDate: input.eventDate,
      location: input.location || null,
      description: input.description || null,
      relatedMemberId: input.relatedMemberId || null,
      photos: input.photos || [],
      privacyLevel: input.privacyLevel,
      createdBy: ctx.user.id,
    })

    return event
  }),

  getById: protectedProcedure.input(getEventByIdSchema).query(async ({ input, ctx }) => {
    const canAccess = await eventService.canAccessEvent(input.id, ctx.user.id)
    if (!canAccess) {
      throw new Error('Unauthorized: You do not have access to this event')
    }

    const event = await eventService.findById(input.id)
    if (!event) {
      throw new Error('Event not found')
    }

    return event
  }),

  update: protectedProcedure.input(updateEventSchema).mutation(async ({ input, ctx }) => {
    const event = await eventService.findById(input.id)
    if (!event) {
      throw new Error('Event not found')
    }

    // Check if user is admin or creator
    const member = await memberService.findById(event.memberId)
    if (!member) {
      throw new Error('Member not found')
    }

    const isAdmin = await familyService.isAdmin(member.familyId, ctx.user.id)
    const isCreator = event.createdBy === ctx.user.id

    if (!isAdmin && !isCreator) {
      throw new Error('Unauthorized: Only admin or creator can update event')
    }

    const updatedEvent = await eventService.update(input.id, {
      eventType: input.eventType,
      eventDate: input.eventDate,
      location: input.location ?? undefined,
      description: input.description ?? undefined,
      relatedMemberId: input.relatedMemberId ?? undefined,
      photos: input.photos,
      privacyLevel: input.privacyLevel,
    })

    return updatedEvent
  }),

  delete: protectedProcedure.input(deleteEventSchema).mutation(async ({ input, ctx }) => {
    const event = await eventService.findById(input.id)
    if (!event) {
      throw new Error('Event not found')
    }

    // Check if user is admin or creator
    const member = await memberService.findById(event.memberId)
    if (!member) {
      throw new Error('Member not found')
    }

    const isAdmin = await familyService.isAdmin(member.familyId, ctx.user.id)
    const isCreator = event.createdBy === ctx.user.id

    if (!isAdmin && !isCreator) {
      throw new Error('Unauthorized: Only admin or creator can delete event')
    }

    await eventService.delete(input.id)
    return { success: true }
  }),

  list: protectedProcedure.input(listEventsSchema).query(async ({ input, ctx }) => {
    if (input.memberId) {
      // Check if user can access the member
      const canAccess = await memberService.canAccessMember(input.memberId, ctx.user.id)
      if (!canAccess) {
        throw new Error('Unauthorized: You do not have access to this member')
      }

      const events = await eventService.listByMember(input.memberId, {
        eventType: input.eventType,
        location: input.location,
      })
      // Filter by privacy (simplified for now)
      return events
    }

    if (input.familyId) {
      // Check if user is a member of the family
      const isAdmin = await familyService.isAdmin(input.familyId, ctx.user.id)
      const isMember = await familyService.isMember(input.familyId, ctx.user.id)

      if (!isAdmin && !isMember) {
        throw new Error('Unauthorized: You are not a member of this family')
      }

      const events = await eventService.listByFamily(input.familyId, {
        eventType: input.eventType,
        location: input.location,
      })
      // Filter by privacy (simplified for now)
      return events
    }

    throw new Error('Either memberId or familyId must be provided')
  }),

  search: protectedProcedure.input(searchEventsSchema).query(async ({ input, ctx }) => {
    if (input.familyId) {
      // Check if user is a member of the family
      const isAdmin = await familyService.isAdmin(input.familyId, ctx.user.id)
      const isMember = await familyService.isMember(input.familyId, ctx.user.id)

      if (!isAdmin && !isMember) {
        throw new Error('Unauthorized: You are not a member of this family')
      }
    }

    const events = await eventService.search({
      familyId: input.familyId,
      eventType: input.eventType,
      startDate: input.startDate,
      endDate: input.endDate,
      location: input.location,
    })

    // Filter by privacy (simplified for now)
    return events
  }),
})
