import { z } from 'zod'

export const createFamilySchema = z.object({
  name: z.string().min(1, 'Nama keluarga harus diisi'),
  description: z.string().optional(),
  familyCode: z.string().min(6).max(12).optional(),
})

export const getFamilyByCodeSchema = z.object({
  code: z.string().min(1, 'Kode keluarga harus diisi'),
})

export const getFamilyByIdSchema = z.object({
  id: z.string().min(1, 'ID keluarga harus diisi'),
})

export const joinFamilySchema = z.object({
  code: z.string().min(1, 'Kode keluarga harus diisi'),
})

export const updateFamilySchema = z.object({
  id: z.string().min(1, 'ID keluarga harus diisi'),
  name: z.string().min(1, 'Nama keluarga harus diisi').optional(),
  description: z.string().optional().nullable(),
})

export const deleteFamilySchema = z.object({
  id: z.string().min(1, 'ID keluarga harus diisi'),
})

export const transferAdminSchema = z.object({
  familyId: z.string().min(1, 'ID keluarga harus diisi'),
  newAdminId: z.string().min(1, 'ID admin baru harus diisi'),
})

export const getFamilyMembersSchema = z.object({
  familyId: z.string().min(1, 'ID keluarga harus diisi'),
  includeConnected: z.boolean().optional(),
})

export type CreateFamilyInput = z.infer<typeof createFamilySchema>
export type GetFamilyByCodeInput = z.infer<typeof getFamilyByCodeSchema>
export type GetFamilyByIdInput = z.infer<typeof getFamilyByIdSchema>
export type JoinFamilyInput = z.infer<typeof joinFamilySchema>
export type UpdateFamilyInput = z.infer<typeof updateFamilySchema>
export type DeleteFamilyInput = z.infer<typeof deleteFamilySchema>
export type TransferAdminInput = z.infer<typeof transferAdminSchema>
export type GetFamilyMembersInput = z.infer<typeof getFamilyMembersSchema>
