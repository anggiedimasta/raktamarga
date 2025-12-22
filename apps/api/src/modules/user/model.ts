import { z } from 'zod'

export const updateSettingsSchema = z.object({
  notifications: z.object({
    emailDigest: z.boolean(),
    pushEnabled: z.boolean(),
    mentionOnly: z.boolean(),
  }),
  language: z.enum(['id', 'en']),
})

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().url().optional(),
})

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
