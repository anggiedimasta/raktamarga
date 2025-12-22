import { z } from 'zod'

export const createRelationshipSchema = z.object({
  member1Id: z.string().min(1, 'ID anggota 1 harus diisi'),
  member2Id: z.string().min(1, 'ID anggota 2 harus diisi'),
  relationshipType: z.enum([
    'parent',
    'child',
    'sibling',
    'spouse',
    'partner',
    'adoption',
    'step_sibling',
  ]),
})

export const updateRelationshipSchema = z.object({
  id: z.string().min(1, 'ID relasi harus diisi'),
  relationshipType: z.enum([
    'parent',
    'child',
    'sibling',
    'spouse',
    'partner',
    'adoption',
    'step_sibling',
  ]),
})

export const deleteRelationshipSchema = z.object({
  id: z.string().min(1, 'ID relasi harus diisi'),
})

export const listRelationshipsSchema = z.object({
  memberId: z.string().optional(),
  familyId: z.string().optional(),
  includeConnected: z.boolean().optional(),
})

export const verifyRelationshipSchema = z.object({
  id: z.string().min(1, 'ID relasi harus diisi'),
})

export const getByMemberSchema = z.object({
  memberId: z.string().min(1, 'ID anggota harus diisi'),
})

export type CreateRelationshipInput = z.infer<typeof createRelationshipSchema>
export type UpdateRelationshipInput = z.infer<typeof updateRelationshipSchema>
export type DeleteRelationshipInput = z.infer<typeof deleteRelationshipSchema>
export type ListRelationshipsInput = z.infer<typeof listRelationshipsSchema>
export type VerifyRelationshipInput = z.infer<typeof verifyRelationshipSchema>
export type GetByMemberInput = z.infer<typeof getByMemberSchema>
