import { db } from '@raktamarga/db'
import { submissions } from '@raktamarga/db/schema'
import { eq } from 'drizzle-orm'
import { protectedProcedure, router } from '../../trpc'
import {
  approveSubmissionSchema,
  createMemberSchema,
  deleteMemberSchema,
  getMemberByIdSchema,
  getSubmissionsSchema,
  listMembersSchema,
  rejectSubmissionSchema,
  submitMemberSchema,
  updateMemberSchema,
} from './model'
import { MemberService } from './service'
import { FamilyService } from '../family/service'
import { NotificationService } from '../notification/service'

const memberService = new MemberService()
const familyService = new FamilyService()
const notificationService = new NotificationService()

export const memberRouter = router({
  create: protectedProcedure.input(createMemberSchema).mutation(async ({ input, ctx }) => {
    // Check if user is admin or member of the family
    const isAdmin = await familyService.isAdmin(input.familyId, ctx.user.id)
    const isMember = await familyService.isMember(input.familyId, ctx.user.id)

    if (!isAdmin && !isMember) {
      throw new Error('Unauthorized: You are not a member of this family')
    }

    const member = await memberService.create({
      familyId: input.familyId,
      userId: input.userId || null,
      name: input.name,
      dob: input.dob || null,
      dod: input.dod || null,
      gender: input.gender || null,
      profilePhoto: input.profilePhoto || null,
      privacySettings: input.privacySettings || {
        visibilityLevel: 'family_only',
        customRules: {},
      },
      createdBy: ctx.user.id,
    })

    return member
  }),

  getById: protectedProcedure.input(getMemberByIdSchema).query(async ({ input, ctx }) => {
    const canAccess = await memberService.canAccessMember(input.id, ctx.user.id)
    if (!canAccess) {
      throw new Error('Unauthorized: You do not have access to this member')
    }

    const member = await memberService.findById(input.id)
    if (!member) {
      throw new Error('Member not found')
    }

    return member
  }),

  update: protectedProcedure.input(updateMemberSchema).mutation(async ({ input, ctx }) => {
    const member = await memberService.findById(input.id)
    if (!member) {
      throw new Error('Member not found')
    }

    // Check if user is admin or creator
    const isAdmin = await familyService.isAdmin(member.familyId, ctx.user.id)
    const isCreator = member.createdBy === ctx.user.id

    if (!isAdmin && !isCreator) {
      throw new Error('Unauthorized: Only admin or creator can update member')
    }

    const updatedMember = await memberService.update(input.id, {
      name: input.name,
      dob: input.dob ?? undefined,
      dod: input.dod ?? undefined,
      gender: input.gender ?? undefined,
      profilePhoto: input.profilePhoto ?? undefined,
      privacySettings: input.privacySettings,
    })

    return updatedMember
  }),

  delete: protectedProcedure.input(deleteMemberSchema).mutation(async ({ input, ctx }) => {
    const member = await memberService.findById(input.id)
    if (!member) {
      throw new Error('Member not found')
    }

    // Only admin can delete
    const isAdmin = await familyService.isAdmin(member.familyId, ctx.user.id)
    if (!isAdmin) {
      throw new Error('Unauthorized: Only admin can delete member')
    }

    await memberService.delete(input.id)
    return { success: true }
  }),

  list: protectedProcedure.input(listMembersSchema).query(async ({ input, ctx }) => {
    // Check if user is admin or member of the family
    const isAdmin = await familyService.isAdmin(input.familyId, ctx.user.id)
    const isMember = await familyService.isMember(input.familyId, ctx.user.id)

    if (!isAdmin && !isMember) {
      throw new Error('Unauthorized: You are not a member of this family')
    }

    const familyMembers = await memberService.listByFamily(input.familyId)

    // Filter by privacy settings if user is not admin
    if (!isAdmin) {
      // For now, return all members if user is a family member
      // More complex privacy filtering can be added later
      return familyMembers
    }

    return familyMembers
  }),

  submit: protectedProcedure.input(submitMemberSchema).mutation(async ({ input, ctx }) => {
    // Check if user is a member of the family
    const isMember = await familyService.isMember(input.familyId, ctx.user.id)
    if (!isMember) {
      throw new Error('Unauthorized: You are not a member of this family')
    }

    // Validate memberId for update type
    if (input.submissionType === 'update' && !input.memberId) {
      throw new Error('Member ID is required for update submission')
    }

    const submission = await memberService.submit({
      familyId: input.familyId,
      memberData: {
        ...input.memberData,
        id: input.memberId,
      },
      submissionType: input.submissionType,
      status: 'pending',
      submittedBy: ctx.user.id,
    })

    // Notify family admin
    const family = await familyService.findById(input.familyId)
    if (family) {
      await notificationService.create({
        userId: family.adminId,
        type: input.submissionType === 'create' ? 'member_submission_pending' : 'member_edit_pending',
        title: 'Usulan Data Baru',
        message: `${ctx.user.name || 'Seseorang'} mengusulkan ${input.submissionType === 'create' ? 'penambahan' : 'perubahan'} data anggota`,
        relatedEntityType: 'submission',
        relatedEntityId: submission.id,
      })
    }

    return submission
  }),

  getSubmissions: protectedProcedure.input(getSubmissionsSchema).query(async ({ input, ctx }) => {
    // Only admin can view submissions
    const isAdmin = await familyService.isAdmin(input.familyId, ctx.user.id)
    if (!isAdmin) {
      throw new Error('Unauthorized: Only admin can view submissions')
    }

    const pendingSubmissions = await memberService.getSubmissions(input.familyId, 'pending')
    return pendingSubmissions
  }),

  approveSubmission: protectedProcedure
    .input(approveSubmissionSchema)
    .mutation(async ({ input, ctx }) => {
      // Get submission to find family
      const [submission] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, input.submissionId))
        .limit(1)

      if (!submission) {
        throw new Error('Submission not found')
      }

      // Only admin can approve
      const isAdmin = await familyService.isAdmin(submission.familyId, ctx.user.id)
      if (!isAdmin) {
        throw new Error('Unauthorized: Only admin can approve submissions')
      }

      await memberService.approveSubmission(input.submissionId, ctx.user.id)

      // Notify submitter
      await notificationService.create({
        userId: submission.submittedBy,
        type: submission.submissionType === 'create' ? 'submission_approved' : 'edit_approved',
        title: 'Usulan Disetujui',
        message: `Usulan Anda untuk ${submission.submissionType === 'create' ? 'penambahan' : 'perubahan'} data telah disetujui`,
        relatedEntityType: 'submission',
        relatedEntityId: submission.id,
      })

      return { success: true }
    }),

  rejectSubmission: protectedProcedure
    .input(rejectSubmissionSchema)
    .mutation(async ({ input, ctx }) => {
      // Get submission to find family
      const [submission] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, input.submissionId))
        .limit(1)

      if (!submission) {
        throw new Error('Submission not found')
      }

      // Only admin can reject
      const isAdmin = await familyService.isAdmin(submission.familyId, ctx.user.id)
      if (!isAdmin) {
        throw new Error('Unauthorized: Only admin can reject submissions')
      }

      await memberService.rejectSubmission(input.submissionId, ctx.user.id)

      // Notify submitter
      await notificationService.create({
        userId: submission.submittedBy,
        type: submission.submissionType === 'create' ? 'submission_rejected' : 'edit_rejected',
        title: 'Usulan Ditolak',
        message: `Usulan Anda untuk ${submission.submissionType === 'create' ? 'penambahan' : 'perubahan'} data telah ditolak`,
        relatedEntityType: 'submission',
        relatedEntityId: submission.id,
      })

      return { success: true }
    }),
})
