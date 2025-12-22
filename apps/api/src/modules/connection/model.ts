import { z } from 'zod'

export const createConnectionSchema = z.object({
  family1Id: z.string().min(1, 'ID keluarga 1 harus diisi'),
  family2Id: z.string().min(1, 'ID keluarga 2 harus diisi'),
  connectingMemberId: z.string().min(1, 'ID anggota penghubung harus diisi'),
})

export const getConnectionByIdSchema = z.object({
  id: z.string().min(1, 'ID koneksi harus diisi'),
})

export const listConnectionsSchema = z.object({
  familyId: z.string().min(1, 'ID keluarga harus diisi'),
})

export const approveConnectionSchema = z.object({
  id: z.string().min(1, 'ID koneksi harus diisi'),
})

export const rejectConnectionSchema = z.object({
  id: z.string().min(1, 'ID koneksi harus diisi'),
})

export const verifyConnectionSchema = z.object({
  id: z.string().min(1, 'ID koneksi harus diisi'),
})

export type CreateConnectionInput = z.infer<typeof createConnectionSchema>
export type GetConnectionByIdInput = z.infer<typeof getConnectionByIdSchema>
export type ListConnectionsInput = z.infer<typeof listConnectionsSchema>
export type ApproveConnectionInput = z.infer<typeof approveConnectionSchema>
export type RejectConnectionInput = z.infer<typeof rejectConnectionSchema>
export type VerifyConnectionInput = z.infer<typeof verifyConnectionSchema>
