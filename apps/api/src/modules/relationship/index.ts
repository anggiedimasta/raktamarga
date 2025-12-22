import { db } from '@raktamarga/db'
import { and, eq, or } from 'drizzle-orm'
import { protectedProcedure, router } from '../../trpc'
import {
  createRelationshipSchema,
  deleteRelationshipSchema,
  getByMemberSchema,
  listRelationshipsSchema,
  updateRelationshipSchema,
  verifyRelationshipSchema,
} from './model'
import { RelationshipService } from './service'
import { FamilyService } from '../family/service'
import { MemberService } from '../member/service'

const relationshipService = new RelationshipService()
const familyService = new FamilyService()
const memberService = new MemberService()

export const relationshipRouter = router({
  create: protectedProcedure
    .input(createRelationshipSchema)
    .mutation(async ({ input, ctx }) => {
      // Verify both members exist and user has access
      const member1 = await memberService.findById(input.member1Id)
      const member2 = await memberService.findById(input.member2Id)

      if (!member1 || !member2) {
        throw new Error('One or both members not found')
      }

      // Check if user can access both members
      const canAccess1 = await memberService.canAccessMember(input.member1Id, ctx.user.id)
      const canAccess2 = await memberService.canAccessMember(input.member2Id, ctx.user.id)

      if (!canAccess1 || !canAccess2) {
        throw new Error('Unauthorized: You do not have access to one or both members')
      }

      const relationship = await relationshipService.create({
        member1Id: input.member1Id,
        member2Id: input.member2Id,
        relationshipType: input.relationshipType,
        verified: false,
      })

      return relationship
    }),

  update: protectedProcedure
    .input(updateRelationshipSchema)
    .mutation(async ({ input, ctx }) => {
      const canModify = await relationshipService.canModifyRelationship(input.id, ctx.user.id)
      if (!canModify) {
        throw new Error('Unauthorized: You cannot modify this relationship')
      }

      const relationship = await relationshipService.update(input.id, input.relationshipType)
      return relationship
    }),

  delete: protectedProcedure
    .input(deleteRelationshipSchema)
    .mutation(async ({ input, ctx }) => {
      const canModify = await relationshipService.canModifyRelationship(input.id, ctx.user.id)
      if (!canModify) {
        throw new Error('Unauthorized: You cannot delete this relationship')
      }

      await relationshipService.delete(input.id)
      return { success: true }
    }),

  list: protectedProcedure.input(listRelationshipsSchema).query(async ({ input, ctx }) => {
    if (input.memberId) {
      // Check if user can access the member
      const canAccess = await memberService.canAccessMember(input.memberId, ctx.user.id)
      if (!canAccess) {
        throw new Error('Unauthorized: You do not have access to this member')
      }

      const relationships = await relationshipService.listByMember(input.memberId)
      return relationships
    }

    if (input.familyId) {
      // Check if user is a member of the family
      const isAdmin = await familyService.isAdmin(input.familyId, ctx.user.id)
      const isMember = await familyService.isMember(input.familyId, ctx.user.id)

      if (!isAdmin && !isMember) {
        throw new Error('Unauthorized: You are not a member of this family')
      }

      let familyIds: string[] = [input.familyId]
      if (input.includeConnected) {
        const { connections } = await import('@raktamarga/db/schema')
        const verifiedConnections = await db
          .select()
          .from(connections)
          .where(
            and(
              or(eq(connections.family1Id, input.familyId), eq(connections.family2Id, input.familyId)),
              eq(connections.status, 'verified')
            )
          )

        const connectedIds = verifiedConnections.map((c: any) =>
          c.family1Id === input.familyId ? c.family2Id : c.family1Id
        )
        familyIds = [...familyIds, ...connectedIds]
      }

      const relationships = await relationshipService.listByFamily(familyIds)
      return relationships
    }

    throw new Error('Either memberId or familyId must be provided')
  }),

  verify: protectedProcedure.input(verifyRelationshipSchema).mutation(async ({ input, ctx }) => {
    const relationship = await relationshipService.findById(input.id)
    if (!relationship) {
      throw new Error('Relationship not found')
    }

    // Get both members to check admin access
    const member1 = await memberService.findById(relationship.member1Id)
    const member2 = await memberService.findById(relationship.member2Id)

    if (!member1 || !member2) {
      throw new Error('One or both members not found')
    }

    // Only admin can verify
    const isAdmin1 = await familyService.isAdmin(member1.familyId, ctx.user.id)
    const isAdmin2 = await familyService.isAdmin(member2.familyId, ctx.user.id)

    if (!isAdmin1 && !isAdmin2) {
      throw new Error('Unauthorized: Only admin can verify relationships')
    }

    const verifiedRelationship = await relationshipService.verify(input.id)
    return verifiedRelationship
  }),

  getByMember: protectedProcedure.input(getByMemberSchema).query(async ({ input, ctx }) => {
    // Check if user can access the member
    const canAccess = await memberService.canAccessMember(input.memberId, ctx.user.id)
    if (!canAccess) {
      throw new Error('Unauthorized: You do not have access to this member')
    }

    const relationships = await relationshipService.listByMember(input.memberId)
    return relationships
  }),
})
