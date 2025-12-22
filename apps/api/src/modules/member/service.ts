import { db } from '@raktamarga/db'
import type { NewMember, NewSubmission } from '@raktamarga/db/schema'
import { members, submissions } from '@raktamarga/db/schema'
import { and, eq } from 'drizzle-orm'
import { FamilyService } from '../family/service'

const familyService = new FamilyService()

export class MemberService {
  async create(data: Omit<NewMember, 'id' | 'createdAt' | 'updatedAt'>) {
    const defaultPrivacySettings = {
      visibilityLevel: 'family_only',
      customRules: {},
    }

    const [member] = await db
      .insert(members)
      .values({
        ...data,
        privacySettings: data.privacySettings || defaultPrivacySettings,
      })
      .returning()

    return member
  }

  async findById(id: string) {
    const [member] = await db.select().from(members).where(eq(members.id, id)).limit(1)
    return member || null
  }

  async listByFamily(familyId: string) {
    const familyMembers = await db
      .select()
      .from(members)
      .where(eq(members.familyId, familyId))

    return familyMembers
  }

  async update(id: string, data: Partial<Omit<NewMember, 'id' | 'createdAt' | 'updatedAt'>>) {
    const [member] = await db
      .update(members)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(members.id, id))
      .returning()

    if (!member) {
      throw new Error('Member not found')
    }

    return member
  }

  async delete(id: string) {
    await db.delete(members).where(eq(members.id, id))
    return { success: true }
  }

  async submit(data: Omit<NewSubmission, 'id' | 'createdAt'>) {
    const [submission] = await db.insert(submissions).values(data).returning()
    return submission
  }

  async getSubmissions(familyId: string, status?: 'pending' | 'approved' | 'rejected') {
    const conditions = [eq(submissions.familyId, familyId)]
    if (status) {
      conditions.push(eq(submissions.status, status))
    }

    const pendingSubmissions = await db
      .select()
      .from(submissions)
      .where(and(...conditions))
      .orderBy(submissions.createdAt)

    return pendingSubmissions
  }

  async approveSubmission(submissionId: string, reviewedBy: string) {
    const [submission] = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, submissionId))
      .limit(1)

    if (!submission) {
      throw new Error('Submission not found')
    }

    if (submission.status !== 'pending') {
      throw new Error('Submission is not pending')
    }

    // Update submission status
    await db
      .update(submissions)
      .set({
        status: 'approved',
        reviewedBy,
      })
      .where(eq(submissions.id, submissionId))

    // If it's a create submission, create the member
    if (submission.submissionType === 'create') {
      const memberData = submission.memberData as Record<string, unknown>
      await this.create({
        familyId: submission.familyId,
        userId: (memberData.userId as string) || null,
        name: memberData.name as string,
        dob: (memberData.dob as string) || null,
        dod: (memberData.dod as string) || null,
        gender: (memberData.gender as 'male' | 'female' | 'other') || null,
        profilePhoto: (memberData.profilePhoto as string) || null,
        privacySettings: (memberData.privacySettings as {
          visibilityLevel: string
          customRules?: Record<string, unknown>
        }) || {
          visibilityLevel: 'family_only',
          customRules: {},
        },
        createdBy: submission.submittedBy,
      })
    } else if (submission.submissionType === 'update') {
      // If it's an update submission, update the member
      const memberData = submission.memberData as Record<string, unknown>
      const memberId = memberData.id as string
      if (!memberId) {
        throw new Error('Member ID is required for update submission')
      }

      await this.update(memberId, {
        name: memberData.name as string,
        dob: (memberData.dob as string) || null,
        dod: (memberData.dod as string) || null,
        gender: (memberData.gender as 'male' | 'female' | 'other') || null,
        profilePhoto: (memberData.profilePhoto as string) || null,
        privacySettings: (memberData.privacySettings as {
          visibilityLevel: string
          customRules?: Record<string, unknown>
        }),
      })
    }

    return { success: true }
  }

  async rejectSubmission(submissionId: string, reviewedBy: string) {
    const [submission] = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, submissionId))
      .limit(1)

    if (!submission) {
      throw new Error('Submission not found')
    }

    if (submission.status !== 'pending') {
      throw new Error('Submission is not pending')
    }

    await db
      .update(submissions)
      .set({
        status: 'rejected',
        reviewedBy,
      })
      .where(eq(submissions.id, submissionId))

    return { success: true }
  }

  async canAccessMember(memberId: string, userId: string): Promise<boolean> {
    const member = await this.findById(memberId)
    if (!member) {
      return false
    }

    // Check if user is admin of the family
    const isAdmin = await familyService.isAdmin(member.familyId, userId)
    if (isAdmin) {
      return true
    }

    // Check if user is the creator
    if (member.createdBy === userId) {
      return true
    }

    // Check if user is a member of the family
    const isMember = await familyService.isMember(member.familyId, userId)

    const visibility = (member.privacySettings as any)?.visibilityLevel || 'family_only'

    if (visibility === 'private') {
      // Only admin and creator handled above
      return false
    }

    if (visibility === 'family_only') {
      return isMember
    }

    if (visibility === 'public') {
      return true
    }

    return isMember
  }
}
