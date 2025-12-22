import { protectedProcedure, router } from '../../trpc'
import {
  createFamilySchema,
  deleteFamilySchema,
  getFamilyByIdSchema,
  getFamilyByCodeSchema,
  getFamilyMembersSchema,
  joinFamilySchema,
  transferAdminSchema,
  updateFamilySchema,
} from './model'
import { FamilyService } from './service'
import { MemberService } from '../member/service'
import { NotificationService } from '../notification/service'

const familyService = new FamilyService()
const notificationService = new NotificationService()

export const familyRouter = router({
  create: protectedProcedure.input(createFamilySchema).mutation(async ({ input, ctx }) => {
    const family = await familyService.create({
      name: input.name,
      description: input.description || null,
      familyCode: input.familyCode || '',
      adminId: ctx.user.id,
    })
    return family
  }),

  getById: protectedProcedure.input(getFamilyByIdSchema).query(async ({ input, ctx }) => {
    const family = await familyService.findById(input.id)
    if (!family) {
      throw new Error('Family not found')
    }

    // Check if user is admin or member
    const isAdmin = await familyService.isAdmin(input.id, ctx.user.id)
    const isMember = await familyService.isMember(input.id, ctx.user.id)

    if (!isAdmin && !isMember) {
      throw new Error('Unauthorized: You are not a member of this family')
    }

    return family
  }),

  getByCode: protectedProcedure.input(getFamilyByCodeSchema).query(async ({ input }) => {
    const family = await familyService.findByCode(input.code)
    if (!family) {
      throw new Error('Family not found')
    }
    return family
  }),

  join: protectedProcedure.input(joinFamilySchema).mutation(async ({ input, ctx }) => {
    const family = await familyService.findByCode(input.code)
    if (!family) {
      throw new Error('Family not found')
    }

    // Check if user is already a member
    const isMember = await familyService.isMember(family.id, ctx.user.id)
    if (isMember) {
      throw new Error('You are already a member of this family')
    }

    // Add user as member
    const memberService = new MemberService()
    await memberService.create({
      familyId: family.id,
      userId: ctx.user.id,
      name: ctx.user.name || 'New Member',
      createdBy: ctx.user.id,
      privacySettings: {
        visibilityLevel: 'family_only',
        customRules: {}
      }
    })

    // Notify family admin
    await notificationService.create({
      userId: family.adminId,
      type: 'member_added',
      title: 'Anggota Baru Bergabung',
      message: `${ctx.user.name || 'Seseorang'} telah bergabung dengan keluarga "${family.name}"`,
      relatedEntityType: 'family',
      relatedEntityId: family.id,
    })

    return family
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const families = await familyService.listByUserId(ctx.user.id)
    return families
  }),

  update: protectedProcedure.input(updateFamilySchema).mutation(async ({ input, ctx }) => {
    // Check if user is admin
    const isAdmin = await familyService.isAdmin(input.id, ctx.user.id)
    if (!isAdmin) {
      throw new Error('Unauthorized: Only admin can update family')
    }

    const family = await familyService.update(input.id, {
      name: input.name,
      description: input.description ?? undefined,
    })
    return family
  }),

  delete: protectedProcedure.input(deleteFamilySchema).mutation(async ({ input, ctx }) => {
    // Check if user is admin
    const isAdmin = await familyService.isAdmin(input.id, ctx.user.id)
    if (!isAdmin) {
      throw new Error('Unauthorized: Only admin can delete family')
    }

    await familyService.delete(input.id)
    return { success: true }
  }),

  transferAdmin: protectedProcedure.input(transferAdminSchema).mutation(async ({ input, ctx }) => {
    // Check if current user is admin
    const isAdmin = await familyService.isAdmin(input.familyId, ctx.user.id)
    if (!isAdmin) {
      throw new Error('Unauthorized: Only admin can transfer admin rights')
    }

    const family = await familyService.transferAdmin(input.familyId, input.newAdminId)
    return family
  }),

  getMembers: protectedProcedure.input(getFamilyMembersSchema).query(async ({ input, ctx }) => {
    // Check if user is admin or member
    const isAdmin = await familyService.isAdmin(input.familyId, ctx.user.id)
    const isMember = await familyService.isMember(input.familyId, ctx.user.id)

    if (!isAdmin && !isMember) {
      throw new Error('Unauthorized: You are not a member of this family')
    }

    const familyMembers = await familyService.getMembers(input.familyId, input.includeConnected)
    return familyMembers
  }),
})
