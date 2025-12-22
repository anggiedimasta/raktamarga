import { z } from 'zod'

export const createEventSchema = z.object({
  memberId: z.string().min(1, 'ID anggota harus diisi'),
  eventType: z.enum([
    'birth',
    'death',
    'marriage',
    'divorce',
    'partnership',
    'adoption',
    'graduation',
    'migration',
    'custom',
  ]),
  eventDate: z.string().date(),
  location: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  relatedMemberId: z.string().optional().nullable(),
  photos: z.array(z.string().url()).optional().default([]),
  privacyLevel: z.enum([
    'private',
    'family_only',
    'immediate_family',
    'extended_family',
    'connected_families',
    'extended_connections',
    'public',
  ]),
})

export const getEventByIdSchema = z.object({
  id: z.string().min(1, 'ID event harus diisi'),
})

export const updateEventSchema = z.object({
  id: z.string().min(1, 'ID event harus diisi'),
  eventType: z
    .enum([
      'birth',
      'death',
      'marriage',
      'divorce',
      'partnership',
      'adoption',
      'graduation',
      'migration',
      'custom',
    ])
    .optional(),
  eventDate: z.string().date().optional(),
  location: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  relatedMemberId: z.string().optional().nullable(),
  photos: z.array(z.string().url()).optional(),
  privacyLevel: z
    .enum([
      'private',
      'family_only',
      'immediate_family',
      'extended_family',
      'connected_families',
      'extended_connections',
      'public',
    ])
    .optional(),
})

export const deleteEventSchema = z.object({
  id: z.string().min(1, 'ID event harus diisi'),
})

export const listEventsSchema = z.object({
  memberId: z.string().optional(),
  familyId: z.string().optional(),
  eventType: z.string().optional(),
  location: z.string().optional(),
})

export const searchEventsSchema = z.object({
  familyId: z.string().optional(),
  eventType: z
    .enum([
      'birth',
      'death',
      'marriage',
      'divorce',
      'partnership',
      'adoption',
      'graduation',
      'migration',
      'custom',
    ])
    .optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  location: z.string().optional(),
})

export type CreateEventInput = z.infer<typeof createEventSchema>
export type GetEventByIdInput = z.infer<typeof getEventByIdSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type DeleteEventInput = z.infer<typeof deleteEventSchema>
export type ListEventsInput = z.infer<typeof listEventsSchema>
export type SearchEventsInput = z.infer<typeof searchEventsSchema>
