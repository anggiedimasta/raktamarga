import { z } from 'zod'

export const createMemberSchema = z.object({
  familyId: z.string().min(1, 'ID keluarga harus diisi'),
  userId: z.string().optional().nullable(),
  name: z.string().min(1, 'Nama harus diisi'),
  dob: z.string().date().optional().nullable(),
  dod: z.string().date().optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  profilePhoto: z.string().url().optional().nullable(),
  privacySettings: z
    .object({
      visibilityLevel: z.string(),
      customRules: z.record(z.unknown()).optional(),
    })
    .optional(),
})

export const getMemberByIdSchema = z.object({
  id: z.string().min(1, 'ID anggota harus diisi'),
})

export const updateMemberSchema = z.object({
  id: z.string().min(1, 'ID anggota harus diisi'),
  name: z.string().min(1, 'Nama harus diisi').optional(),
  dob: z.string().date().optional().nullable(),
  dod: z.string().date().optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  profilePhoto: z.string().url().optional().nullable(),
  privacySettings: z
    .object({
      visibilityLevel: z.string(),
      customRules: z.record(z.unknown()).optional(),
    })
    .optional(),
})

export const deleteMemberSchema = z.object({
  id: z.string().min(1, 'ID anggota harus diisi'),
})

export const listMembersSchema = z.object({
  familyId: z.string().min(1, 'ID keluarga harus diisi'),
})

export const submitMemberSchema = z.object({
  familyId: z.string().min(1, 'ID keluarga harus diisi'),
  memberData: z.record(z.unknown()),
  submissionType: z.enum(['create', 'update']),
  memberId: z.string().optional(), // Required for update type
})

export const approveSubmissionSchema = z.object({
  submissionId: z.string().min(1, 'ID submission harus diisi'),
})

export const rejectSubmissionSchema = z.object({
  submissionId: z.string().min(1, 'ID submission harus diisi'),
})

export const getSubmissionsSchema = z.object({
  familyId: z.string().min(1, 'ID keluarga harus diisi'),
})

export type CreateMemberInput = z.infer<typeof createMemberSchema>
export type GetMemberByIdInput = z.infer<typeof getMemberByIdSchema>
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
export type DeleteMemberInput = z.infer<typeof deleteMemberSchema>
export type ListMembersInput = z.infer<typeof listMembersSchema>
export type SubmitMemberInput = z.infer<typeof submitMemberSchema>
export type ApproveSubmissionInput = z.infer<typeof approveSubmissionSchema>
export type RejectSubmissionInput = z.infer<typeof rejectSubmissionSchema>
export type GetSubmissionsInput = z.infer<typeof getSubmissionsSchema>
