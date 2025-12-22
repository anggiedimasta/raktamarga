import { z } from 'zod'

export const listNotificationsSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
  unreadOnly: z.boolean().optional().default(false),
})

export const markAsReadSchema = z.object({
  id: z.string().min(1, 'ID notifikasi harus diisi'),
})

export const createNotificationSchema = z.object({
  userId: z.string().min(1, 'ID user harus diisi'),
  type: z.enum([
    'member_submission_pending',
    'member_edit_pending',
    'connection_request',
    'join_request',
    'submission_approved',
    'submission_rejected',
    'edit_approved',
    'edit_rejected',
    'member_added',
    'connection_established',
    'event_added',
    'privacy_changed',
  ]),
  title: z.string().min(1, 'Judul harus diisi'),
  message: z.string().min(1, 'Pesan harus diisi'),
  relatedEntityType: z.string().optional().nullable(),
  relatedEntityId: z.string().optional().nullable(),
})

export type ListNotificationsInput = z.infer<typeof listNotificationsSchema>
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>
